import assert from "node:assert";
import { suite, test } from "mocha";
import type { ApplicationDatabaseConnection } from "./application-database.ts";
import {
	withClosedTemporaryApplicationDatabase,
	withReopenedApplicationDatabase,
	withTemporaryApplicationDatabase
} from "./application-database-test-support.ts";

function readApplicationDatabaseTableNames(applicationDatabaseConnection: ApplicationDatabaseConnection): string[] {
	const tableRows = applicationDatabaseConnection.sqliteDatabase
		.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
		.all() as { readonly name: string }[];

	return tableRows.map((tableRow) => {
		return tableRow.name;
	});
}

suite("application database", function () {
	test(
		"creates the central tables with WAL and the configured busy timeout",
		withTemporaryApplicationDatabase(async (applicationDatabaseConnection) => {
			const actualTableNames = readApplicationDatabaseTableNames(applicationDatabaseConnection);
			const expectedTableNames = ["blog_reactions", "mention_cache"];
			const actualJournalMode = applicationDatabaseConnection.sqliteDatabase.pragma("journal_mode", {
				simple: true
			});
			const actualBusyTimeout = applicationDatabaseConnection.sqliteDatabase.pragma("busy_timeout", {
				simple: true
			});

			assert.deepStrictEqual(actualTableNames, expectedTableNames);
			assert.strictEqual(actualJournalMode, "wal");
			assert.strictEqual(actualBusyTimeout, 2000);
		})
	);

	test(
		"initializes the schema idempotently and preserves it after reopening",
		withReopenedApplicationDatabase(async (applicationDatabaseConnection) => {
			const actualTableNames = readApplicationDatabaseTableNames(applicationDatabaseConnection);
			const expectedTableNames = ["blog_reactions", "mention_cache"];

			assert.deepStrictEqual(actualTableNames, expectedTableNames);
		})
	);

	test(
		"does not permit database queries after the central owner closes the connection",
		withClosedTemporaryApplicationDatabase(async (applicationDatabaseConnection) => {
			await assert.rejects(async () => {
				await applicationDatabaseConnection.database.selectFrom("mention_cache").select("cache_key").execute();
			}, Error);
		})
	);
});
