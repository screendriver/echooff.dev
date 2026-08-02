import { isError } from "@sindresorhus/is";
import { sql, type Kysely, type Selectable } from "kysely";
import { just, nothing, type Maybe } from "true-myth/maybe";
import { tryOrElse } from "true-myth/task";
import { Unit } from "true-myth/unit";
import type { ApplicationDatabase, MentionCacheTable } from "./application-database.ts";
import type { MentionCacheEntry, MentionCacheRepository } from "./mention-cache.ts";

function normalizeMentionCacheDatabaseError(error: unknown): Error {
	if (isError(error)) {
		return error;
	}

	return new Error(String(error));
}

function mapMentionCacheRow(mentionCacheRow: Selectable<MentionCacheTable>): MentionCacheEntry {
	return {
		cacheKey: mentionCacheRow.cache_key,
		fetchedAt: mentionCacheRow.fetched_at,
		schemaVersion: mentionCacheRow.schema_version,
		value: mentionCacheRow.value
	};
}

async function readMentionCacheEntry(
	database: Kysely<ApplicationDatabase>,
	cacheKey: string
): Promise<Maybe<MentionCacheEntry>> {
	const mentionCacheRow = await database
		.selectFrom("mention_cache")
		.select(["cache_key", "fetched_at", "schema_version", "value"])
		.where("cache_key", "=", cacheKey)
		.executeTakeFirst();

	if (mentionCacheRow === undefined) {
		return nothing();
	}

	return just(mapMentionCacheRow(mentionCacheRow));
}

async function writeMentionCacheEntry(
	database: Kysely<ApplicationDatabase>,
	mentionCacheEntry: MentionCacheEntry
): Promise<void> {
	await sql`
		INSERT INTO mention_cache (cache_key, fetched_at, value, schema_version)
		VALUES (
			${mentionCacheEntry.cacheKey},
			${mentionCacheEntry.fetchedAt},
			${mentionCacheEntry.value},
			${mentionCacheEntry.schemaVersion}
		)
		ON CONFLICT(cache_key) DO UPDATE SET
			fetched_at = excluded.fetched_at,
			value = excluded.value,
			schema_version = excluded.schema_version
		WHERE mention_cache.fetched_at <= excluded.fetched_at
	`.execute(database);
}

async function deleteMentionCacheEntriesFetchedBefore(
	database: Kysely<ApplicationDatabase>,
	fetchedBefore: string
): Promise<void> {
	await database.deleteFrom("mention_cache").where("fetched_at", "<", fetchedBefore).execute();
}

export function createMentionCacheRepository(database: Kysely<ApplicationDatabase>): MentionCacheRepository {
	return {
		deleteEntriesFetchedBefore(fetchedBefore) {
			return tryOrElse(normalizeMentionCacheDatabaseError, async () => {
				await deleteMentionCacheEntriesFetchedBefore(database, fetchedBefore);

				return Unit;
			});
		},
		readEntry(cacheKey) {
			return tryOrElse(normalizeMentionCacheDatabaseError, async () => {
				return readMentionCacheEntry(database, cacheKey);
			});
		},
		writeEntry(mentionCacheEntry) {
			return tryOrElse(normalizeMentionCacheDatabaseError, async () => {
				await writeMentionCacheEntry(database, mentionCacheEntry);

				return Unit;
			});
		}
	};
}
