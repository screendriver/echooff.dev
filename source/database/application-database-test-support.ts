import process from "node:process";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { isOk, type Result } from "true-myth/result";
import {
	closeApplicationDatabase,
	createApplicationDatabase,
	type ApplicationDatabaseConnection
} from "./application-database.ts";

type ApplicationDatabaseTest = (applicationDatabaseConnection: ApplicationDatabaseConnection) => Promise<void>;
type AsynchronousMochaTest = () => Promise<void>;

async function createTemporaryDatabasePath(): Promise<string> {
	const testDatabaseDirectoryPath = join(process.cwd(), "target", "application-database-tests");

	await mkdir(testDatabaseDirectoryPath, {
		recursive: true
	});

	const temporaryDirectoryPath = await mkdtemp(join(testDatabaseDirectoryPath, "database-"));

	return join(temporaryDirectoryPath, "application.sqlite");
}

async function removeTemporaryDatabaseFile(databasePath: string): Promise<void> {
	await rm(dirname(databasePath), {
		force: true,
		recursive: true
	});
}

async function createTestApplicationDatabase(databasePath: string): Promise<ApplicationDatabaseConnection> {
	const applicationDatabaseResult = await createApplicationDatabase({
		busyTimeoutMilliseconds: 2000,
		databasePath
	});

	if (isOk(applicationDatabaseResult)) {
		return applicationDatabaseResult.value;
	}

	throw applicationDatabaseResult.error;
}

function unwrapTestResult<Value>(result: Result<Value, Error>): Value {
	if (isOk(result)) {
		return result.value;
	}

	throw result.error;
}

async function runWithTemporaryDatabasePath<Value>(
	runDatabaseTest: (databasePath: string) => Promise<Value>
): Promise<Value> {
	const databasePath = await createTemporaryDatabasePath();

	try {
		return await runDatabaseTest(databasePath);
	} finally {
		await removeTemporaryDatabaseFile(databasePath);
	}
}

async function runWithApplicationDatabaseConnection<Value>(
	databasePath: string,
	runDatabaseTest: (applicationDatabaseConnection: ApplicationDatabaseConnection) => Promise<Value>
): Promise<Value> {
	const applicationDatabaseConnection = await createTestApplicationDatabase(databasePath);

	try {
		return await runDatabaseTest(applicationDatabaseConnection);
	} finally {
		unwrapTestResult(await closeApplicationDatabase(applicationDatabaseConnection));
	}
}

async function runWithTemporaryApplicationDatabase<Value>(
	runDatabaseTest: (applicationDatabaseConnection: ApplicationDatabaseConnection) => Promise<Value>
): Promise<Value> {
	return runWithTemporaryDatabasePath(async (databasePath) => {
		return runWithApplicationDatabaseConnection(databasePath, runDatabaseTest);
	});
}

async function runWithReopenedApplicationDatabase(
	databasePath: string,
	runDatabaseTest: ApplicationDatabaseTest
): Promise<void> {
	const firstApplicationDatabaseConnection = await createTestApplicationDatabase(databasePath);
	unwrapTestResult(await closeApplicationDatabase(firstApplicationDatabaseConnection));
	await runWithApplicationDatabaseConnection(databasePath, runDatabaseTest);
}

export function withTemporaryApplicationDatabase(runDatabaseTest: ApplicationDatabaseTest): AsynchronousMochaTest {
	return async function runTestWithTemporaryApplicationDatabase(): Promise<void> {
		await runWithTemporaryApplicationDatabase(runDatabaseTest);
	};
}

export function withReopenedApplicationDatabase(runDatabaseTest: ApplicationDatabaseTest): AsynchronousMochaTest {
	return async function runTestWithReopenedApplicationDatabase(): Promise<void> {
		await runWithTemporaryDatabasePath(async (databasePath) => {
			await runWithReopenedApplicationDatabase(databasePath, runDatabaseTest);
		});
	};
}

export function withClosedTemporaryApplicationDatabase(
	runDatabaseTest: ApplicationDatabaseTest
): AsynchronousMochaTest {
	return async function runTestWithClosedTemporaryApplicationDatabase(): Promise<void> {
		const closedApplicationDatabaseConnection = await runWithTemporaryApplicationDatabase(
			async (applicationDatabaseConnection) => {
				return applicationDatabaseConnection;
			}
		);

		await runDatabaseTest(closedApplicationDatabaseConnection);
	};
}
