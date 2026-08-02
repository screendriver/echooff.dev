import { isError } from "@sindresorhus/is";
import Database from "better-sqlite3";

const sqliteBusyErrorMarker = Symbol("sqliteBusyError");

function createSqliteBusyError(): Error {
	const sqliteBusyError = new Error("The SQLite database remained busy after waiting.");
	Object.defineProperty(sqliteBusyError, sqliteBusyErrorMarker, {
		value: true
	});

	return sqliteBusyError;
}

export function normalizeSqliteDatabaseError(error: unknown): Error {
	if (!isError(error)) {
		return new Error("The SQLite database operation failed.");
	}

	if (error instanceof Database.SqliteError && error.code === "SQLITE_BUSY") {
		return createSqliteBusyError();
	}

	return error;
}

export function isSqliteBusyError(error: unknown): boolean {
	return isError(error) && Object.hasOwn(error, sqliteBusyErrorMarker);
}
