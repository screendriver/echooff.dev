import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { isError, isSafeInteger } from "@sindresorhus/is";
import Database from "better-sqlite3";
import { Kysely, sql, SqliteDialect } from "kysely";
import { tryOrElse, type Task } from "true-myth/task";
import { Unit } from "true-myth/unit";

export const mentionCacheSchemaVersion = 1;

export type MentionCacheTable = {
	readonly cache_key: string;
	readonly fetched_at: string;
	readonly schema_version: number;
	readonly value: string;
};

export type BlogReactionTable = {
	readonly post_slug: string;
	readonly reactor_hash: string;
};

export type ApplicationDatabase = {
	readonly blog_reactions: BlogReactionTable;
	readonly mention_cache: MentionCacheTable;
};

export type ApplicationDatabaseConnection = {
	readonly database: Kysely<ApplicationDatabase>;
	readonly sqliteDatabase: Database.Database;
};

export type CreateApplicationDatabaseInput = {
	readonly busyTimeoutMilliseconds: number;
	readonly databasePath: string;
};

function normalizeApplicationDatabaseError(error: unknown): Error {
	if (isError(error)) {
		return error;
	}

	return new Error(String(error));
}

function formatBusyTimeoutPragma(busyTimeoutMilliseconds: number): string {
	if (!isSafeInteger(busyTimeoutMilliseconds) || busyTimeoutMilliseconds < 0) {
		throw new RangeError("SQLite busy timeout must be a non-negative safe integer.");
	}

	return `PRAGMA busy_timeout = ${busyTimeoutMilliseconds}`;
}

async function createApplicationDatabaseDirectory(databasePath: string): Promise<void> {
	if (databasePath === ":memory:") {
		return;
	}

	await mkdir(dirname(databasePath), {
		recursive: true
	});
}

async function createApplicationDatabaseSchema(database: Kysely<ApplicationDatabase>): Promise<void> {
	await database.schema
		.createTable("mention_cache")
		.ifNotExists()
		.addColumn("cache_key", "text", (column) => {
			return column.primaryKey();
		})
		.addColumn("fetched_at", "text", (column) => {
			return column.notNull();
		})
		.addColumn("value", "text", (column) => {
			return column.notNull();
		})
		.addColumn("schema_version", "integer", (column) => {
			return column.notNull();
		})
		.execute();

	await database.schema
		.createTable("blog_reactions")
		.ifNotExists()
		.addColumn("post_slug", "text", (column) => {
			return column.notNull();
		})
		.addColumn("reactor_hash", "text", (column) => {
			return column.notNull();
		})
		.addPrimaryKeyConstraint("blog_reactions_primary_key", ["post_slug", "reactor_hash"])
		.execute();
}

async function openApplicationDatabase(
	createApplicationDatabaseInput: CreateApplicationDatabaseInput
): Promise<ApplicationDatabaseConnection> {
	const { busyTimeoutMilliseconds, databasePath } = createApplicationDatabaseInput;

	await createApplicationDatabaseDirectory(databasePath);

	const sqliteDatabase = new Database(databasePath);
	const database = new Kysely<ApplicationDatabase>({
		dialect: new SqliteDialect({
			database: sqliteDatabase
		})
	});

	await sql`PRAGMA journal_mode = WAL`.execute(database);
	await sql.raw(formatBusyTimeoutPragma(busyTimeoutMilliseconds)).execute(database);
	await createApplicationDatabaseSchema(database);

	return {
		database,
		sqliteDatabase
	};
}

export function createApplicationDatabase(
	createApplicationDatabaseInput: CreateApplicationDatabaseInput
): Task<ApplicationDatabaseConnection, Error> {
	return tryOrElse(normalizeApplicationDatabaseError, async () => {
		return openApplicationDatabase(createApplicationDatabaseInput);
	});
}

export function closeApplicationDatabase(
	applicationDatabaseConnection: ApplicationDatabaseConnection
): Task<Unit, Error> {
	return tryOrElse(normalizeApplicationDatabaseError, async () => {
		await applicationDatabaseConnection.database.destroy();
		applicationDatabaseConnection.sqliteDatabase.close();

		return Unit;
	});
}
