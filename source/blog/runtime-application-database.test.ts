import assert from "node:assert";
import { suite, test } from "mocha";
import { err, ok } from "true-myth/result";
import { resolve as resolveTask, reject as rejectTask } from "true-myth/task";
import { Unit } from "true-myth/unit";
import type { ApplicationDatabaseConnection } from "./application-database.ts";
import {
	applicationDatabaseBusyTimeoutMilliseconds,
	createRuntimeApplicationDatabaseTaskReader,
	productionApplicationDatabasePath,
	type RuntimeApplicationDatabaseDependencies,
	type RuntimeApplicationDatabaseModule
} from "./runtime-application-database.ts";

function createTestApplicationDatabaseConnection(): ApplicationDatabaseConnection {
	return Object.create(null) as ApplicationDatabaseConnection;
}

function createRuntimeApplicationDatabaseDependencies(
	loadApplicationDatabaseModule: RuntimeApplicationDatabaseDependencies["loadApplicationDatabaseModule"]
): RuntimeApplicationDatabaseDependencies {
	return {
		busyTimeoutMilliseconds: 1234,
		databasePath: "/temporary/application.sqlite",
		loadApplicationDatabaseModule
	};
}

suite("createRuntimeApplicationDatabaseTaskReader()", function () {
	test("does not load the application database module before the first read", function () {
		let moduleLoadCount = 0;
		const runtimeApplicationDatabaseTaskReader = createRuntimeApplicationDatabaseTaskReader(
			createRuntimeApplicationDatabaseDependencies(() => {
				moduleLoadCount += 1;

				return resolveTask({
					createApplicationDatabase() {
						return resolveTask(createTestApplicationDatabaseConnection());
					},
					closeApplicationDatabase() {
						return resolveTask(Unit);
					}
				});
			})
		);

		const expectedModuleLoadCount = 0;

		assert.strictEqual(moduleLoadCount, expectedModuleLoadCount);
		assert.strictEqual(typeof runtimeApplicationDatabaseTaskReader, "function");
	});

	test("shares one initialization task and passes the configured database input", async function () {
		let moduleLoadCount = 0;
		let applicationDatabaseCreationCount = 0;
		const recordedDatabaseInputs: Parameters<RuntimeApplicationDatabaseModule["createApplicationDatabase"]>[] = [];
		const expectedApplicationDatabaseConnection = createTestApplicationDatabaseConnection();
		const applicationDatabaseModule: RuntimeApplicationDatabaseModule = {
			createApplicationDatabase(createApplicationDatabaseInput) {
				applicationDatabaseCreationCount += 1;
				recordedDatabaseInputs.push([createApplicationDatabaseInput]);

				return resolveTask(expectedApplicationDatabaseConnection);
			},
			closeApplicationDatabase() {
				return resolveTask(Unit);
			}
		};
		const runtimeApplicationDatabaseTaskReader = createRuntimeApplicationDatabaseTaskReader(
			createRuntimeApplicationDatabaseDependencies(() => {
				moduleLoadCount += 1;

				return resolveTask(applicationDatabaseModule);
			})
		);

		const firstApplicationDatabaseTask = runtimeApplicationDatabaseTaskReader();
		const secondApplicationDatabaseTask = runtimeApplicationDatabaseTaskReader();
		const actualApplicationDatabaseResult = await firstApplicationDatabaseTask;
		const expectedDatabaseInput = {
			busyTimeoutMilliseconds: 1234,
			databasePath: "/temporary/application.sqlite"
		};

		assert.strictEqual(firstApplicationDatabaseTask, secondApplicationDatabaseTask);
		assert.strictEqual(moduleLoadCount, 1);
		assert.strictEqual(applicationDatabaseCreationCount, 1);
		assert.deepStrictEqual(recordedDatabaseInputs, [[expectedDatabaseInput]]);
		assert.deepStrictEqual(actualApplicationDatabaseResult, ok(expectedApplicationDatabaseConnection));
	});

	test("shares a failed initialization task without retrying it", async function () {
		let moduleLoadCount = 0;
		const expectedError = new Error("application database unavailable");
		const runtimeApplicationDatabaseTaskReader = createRuntimeApplicationDatabaseTaskReader(
			createRuntimeApplicationDatabaseDependencies(() => {
				moduleLoadCount += 1;

				return rejectTask(expectedError);
			})
		);

		const firstApplicationDatabaseResult = await runtimeApplicationDatabaseTaskReader();
		const secondApplicationDatabaseResult = await runtimeApplicationDatabaseTaskReader();

		assert.strictEqual(moduleLoadCount, 1);
		assert.deepStrictEqual(firstApplicationDatabaseResult, err(expectedError));
		assert.deepStrictEqual(secondApplicationDatabaseResult, err(expectedError));
	});

	test("uses the production database path and busy timeout constants", function () {
		assert.strictEqual(productionApplicationDatabasePath, "/data/echooff.sqlite");
		assert.strictEqual(applicationDatabaseBusyTimeoutMilliseconds, 5000);
	});
});
