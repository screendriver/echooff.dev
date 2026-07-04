import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { isError, isSafeInteger } from "@sindresorhus/is";
import Database from "better-sqlite3";
import { Kysely, sql, SqliteDialect, type Selectable } from "kysely";
import { just, nothing, type Maybe } from "true-myth/maybe";
import { tryOrElse as tryTaskOrElse, type Task } from "true-myth/task";

export const mentionCacheSchemaVersion = 1;

export type MentionCacheTable = {
	readonly cache_key: string;
	readonly fetched_at: string;
	readonly schema_version: number;
	readonly value: string;
};

export type MentionCacheDatabase = {
	readonly mention_cache: MentionCacheTable;
};

export type MentionCacheEntry = {
	readonly cacheKey: string;
	readonly fetchedAt: string;
	readonly schemaVersion: number;
	readonly value: string;
};

export type MentionCacheDatabaseConnection = {
	readonly database: Kysely<MentionCacheDatabase>;
	readonly sqliteDatabase: Database.Database;
};

export type MentionCacheRepository = {
	readonly close: () => Task<void, Error>;
	readonly deleteEntriesFetchedBefore: (fetchedBefore: string) => Task<void, Error>;
	readonly readEntry: (cacheKey: string) => Task<Maybe<MentionCacheEntry>, Error>;
	readonly writeEntry: (mentionCacheEntry: MentionCacheEntry) => Task<void, Error>;
};

type OpenMentionCacheDatabaseInput = {
	readonly busyTimeoutMilliseconds: number;
	readonly databasePath: string;
};

type CreateMentionCacheRepositoryInput = {
	readonly busyTimeoutMilliseconds: number;
	readonly databasePath: string;
};

async function createMentionCacheDirectory(databasePath: string): Promise<void> {
	if (databasePath === ":memory:") {
		return;
	}

	await mkdir(dirname(databasePath), {
		recursive: true
	});
}

function mapMentionCacheRow(mentionCacheRow: Selectable<MentionCacheTable>): MentionCacheEntry {
	return {
		cacheKey: mentionCacheRow.cache_key,
		fetchedAt: mentionCacheRow.fetched_at,
		schemaVersion: mentionCacheRow.schema_version,
		value: mentionCacheRow.value
	};
}

function formatBusyTimeoutPragma(busyTimeoutMilliseconds: number): string {
	if (!isSafeInteger(busyTimeoutMilliseconds) || busyTimeoutMilliseconds < 0) {
		throw new RangeError("SQLite busy timeout must be a non-negative safe integer.");
	}

	return `PRAGMA busy_timeout = ${busyTimeoutMilliseconds}`;
}

function normalizeMentionCacheDatabaseError(error: unknown): Error {
	if (isError(error)) {
		return error;
	}

	return new Error(String(error));
}

async function openMentionCacheDatabase(
	openMentionCacheDatabaseInput: OpenMentionCacheDatabaseInput
): Promise<MentionCacheDatabaseConnection> {
	const { busyTimeoutMilliseconds, databasePath } = openMentionCacheDatabaseInput;

	await createMentionCacheDirectory(databasePath);

	const sqliteDatabase = new Database(databasePath);
	const database = new Kysely<MentionCacheDatabase>({
		dialect: new SqliteDialect({
			database: sqliteDatabase
		})
	});

	await sql`PRAGMA journal_mode = WAL`.execute(database);
	await sql.raw(formatBusyTimeoutPragma(busyTimeoutMilliseconds)).execute(database);

	return {
		database,
		sqliteDatabase
	};
}

async function createMentionCacheTable(database: Kysely<MentionCacheDatabase>): Promise<void> {
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
}

async function closeMentionCacheDatabase(
	mentionCacheDatabaseConnection: MentionCacheDatabaseConnection
): Promise<void> {
	await mentionCacheDatabaseConnection.database.destroy();
	mentionCacheDatabaseConnection.sqliteDatabase.close();
}

async function readMentionCacheEntry(
	database: Kysely<MentionCacheDatabase>,
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
	database: Kysely<MentionCacheDatabase>,
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
	database: Kysely<MentionCacheDatabase>,
	fetchedBefore: string
): Promise<void> {
	await database.deleteFrom("mention_cache").where("fetched_at", "<", fetchedBefore).execute();
}

async function createMentionCacheRepositoryUnsafe(
	createMentionCacheRepositoryInput: CreateMentionCacheRepositoryInput
): Promise<MentionCacheRepository> {
	const mentionCacheDatabaseConnection = await openMentionCacheDatabase(createMentionCacheRepositoryInput);
	const { database } = mentionCacheDatabaseConnection;

	await createMentionCacheTable(database);

	return {
		close() {
			return tryTaskOrElse(normalizeMentionCacheDatabaseError, async () => {
				await closeMentionCacheDatabase(mentionCacheDatabaseConnection);
			});
		},
		deleteEntriesFetchedBefore(fetchedBefore) {
			return tryTaskOrElse(normalizeMentionCacheDatabaseError, async () => {
				await deleteMentionCacheEntriesFetchedBefore(database, fetchedBefore);
			});
		},
		readEntry(cacheKey) {
			return tryTaskOrElse(normalizeMentionCacheDatabaseError, async () => {
				return readMentionCacheEntry(database, cacheKey);
			});
		},
		writeEntry(mentionCacheEntry) {
			return tryTaskOrElse(normalizeMentionCacheDatabaseError, async () => {
				await writeMentionCacheEntry(database, mentionCacheEntry);
			});
		}
	};
}

export function createMentionCacheRepository(
	createMentionCacheRepositoryInput: CreateMentionCacheRepositoryInput
): Task<MentionCacheRepository, Error> {
	return tryTaskOrElse(normalizeMentionCacheDatabaseError, async () => {
		return createMentionCacheRepositoryUnsafe(createMentionCacheRepositoryInput);
	});
}
