import type { Kysely, Transaction } from "kysely";
import type { Maybe } from "true-myth/maybe";
import { tryOrElse } from "true-myth/task";
import type { ApplicationDatabase } from "./application-database.ts";
import type { BlogReactionRepository, BlogReactionSnapshot } from "./blog-reaction.ts";
import type { PublishedBlogPostSlug } from "./published-blog-post-catalogue.ts";
import { normalizeSqliteDatabaseError } from "./sqlite-database-error.ts";

type ApplicationDatabaseTransaction = Transaction<ApplicationDatabase>;

type ReadReactionSnapshotOptions = {
	readonly database: ApplicationDatabaseTransaction;
	readonly postSlug: PublishedBlogPostSlug;
	readonly reactorHash: Maybe<string>;
};

type AddReactionAndReadSnapshotOptions = {
	readonly database: Kysely<ApplicationDatabase>;
	readonly postSlug: PublishedBlogPostSlug;
	readonly reactorHash: string;
};

type RemoveReactionAndReadSnapshotOptions = {
	readonly database: Kysely<ApplicationDatabase>;
	readonly postSlug: PublishedBlogPostSlug;
	readonly reactorHash: string;
};

async function readReactionCountForPost(
	database: Kysely<ApplicationDatabase>,
	postSlug: PublishedBlogPostSlug
): Promise<number> {
	const reactionCountRow = await database
		.selectFrom("blog_reactions")
		.select((expressionBuilder) => {
			return expressionBuilder.fn.count<number>("reactor_hash").as("count");
		})
		.where("post_slug", "=", postSlug)
		.executeTakeFirstOrThrow();

	return reactionCountRow.count;
}

async function readReactionSnapshot(
	readReactionSnapshotOptions: ReadReactionSnapshotOptions
): Promise<BlogReactionSnapshot> {
	const { database, postSlug, reactorHash } = readReactionSnapshotOptions;
	const count = await readReactionCountForPost(database, postSlug);

	if (reactorHash.isNothing) {
		return {
			count,
			reacted: false
		};
	}

	const matchingReaction = await database
		.selectFrom("blog_reactions")
		.select("reactor_hash")
		.where("post_slug", "=", postSlug)
		.where("reactor_hash", "=", reactorHash.value)
		.executeTakeFirst();

	return {
		count,
		reacted: matchingReaction !== undefined
	};
}
async function addReactionAndReadSnapshot(
	addReactionAndReadSnapshotOptions: AddReactionAndReadSnapshotOptions
): Promise<BlogReactionSnapshot> {
	const { database, postSlug, reactorHash } = addReactionAndReadSnapshotOptions;

	return database.transaction().execute(async (applicationDatabaseTransaction) => {
		await applicationDatabaseTransaction
			.insertInto("blog_reactions")
			.values({
				post_slug: postSlug,
				reactor_hash: reactorHash
			})
			.onConflict((conflict) => {
				return conflict.columns(["post_slug", "reactor_hash"]).doNothing();
			})
			.execute();

		const count = await readReactionCountForPost(applicationDatabaseTransaction, postSlug);

		return {
			count,
			reacted: true
		};
	});
}

async function removeReactionAndReadSnapshot(
	removeReactionAndReadSnapshotOptions: RemoveReactionAndReadSnapshotOptions
): Promise<BlogReactionSnapshot> {
	const { database, postSlug, reactorHash } = removeReactionAndReadSnapshotOptions;

	return database.transaction().execute(async (applicationDatabaseTransaction) => {
		await applicationDatabaseTransaction
			.deleteFrom("blog_reactions")
			.where("post_slug", "=", postSlug)
			.where("reactor_hash", "=", reactorHash)
			.execute();

		const count = await readReactionCountForPost(applicationDatabaseTransaction, postSlug);

		return {
			count,
			reacted: false
		};
	});
}

export function createBlogReactionRepository(database: Kysely<ApplicationDatabase>): BlogReactionRepository {
	return {
		addReactionAndReadSnapshot(postSlug, reactorHash) {
			return tryOrElse(normalizeSqliteDatabaseError, async () => {
				return addReactionAndReadSnapshot({
					database,
					postSlug,
					reactorHash
				});
			});
		},
		readSnapshot(postSlug, reactorHash) {
			return tryOrElse(normalizeSqliteDatabaseError, async () => {
				return database.transaction().execute(async (applicationDatabaseTransaction) => {
					return readReactionSnapshot({
						database: applicationDatabaseTransaction,
						postSlug,
						reactorHash
					});
				});
			});
		},
		removeReactionAndReadSnapshot(postSlug, reactorHash) {
			return tryOrElse(normalizeSqliteDatabaseError, async () => {
				return removeReactionAndReadSnapshot({
					database,
					postSlug,
					reactorHash
				});
			});
		}
	};
}
