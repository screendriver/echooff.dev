import assert from "node:assert";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { suite, test } from "mocha";
import { isOk } from "true-myth/result";
import {
	bugsinkApplication,
	bugsinkDsn,
	bugsinkEnvironment,
	bugsinkHost,
	createBugsinkDataCollection,
	createBugsinkEventTags,
	readBugsinkConfiguration,
	type BugsinkConfiguration
} from "./bugsink-configuration.ts";
import {
	createBugsinkServerOptions,
	createUnexpectedServerFailureReporter,
	initializeBugsinkServer,
	type BugsinkServerSdk
} from "./bugsink-server.ts";

const repositoryRootDirectoryPath = fileURLToPath(new URL("../../", import.meta.url));

const testBugsinkConfiguration: BugsinkConfiguration = {
	dsn: bugsinkDsn,
	release: "release-test"
};

suite("Bugsink configuration", function () {
	test("accepts the public project DSN only when it uses the Bugsink origin", function () {
		const configurationResult = readBugsinkConfiguration({
			PROD: true,
			PUBLIC_BUGSINK_RELEASE: testBugsinkConfiguration.release
		});

		assert.strictEqual(isOk(configurationResult), true);
		assert.deepStrictEqual(configurationResult.unwrapOr(undefined), testBugsinkConfiguration);
		assert.strictEqual(bugsinkHost, "https://bugsink.82r.de");
	});

	test("validates the source-controlled DSN against the configured origin", function () {
		const parsedBugsinkDsn = new URL(bugsinkDsn);

		assert.strictEqual(parsedBugsinkDsn.origin, bugsinkHost);
	});

	test("allows local builds to continue without initializing reporting", function () {
		const configurationResult = readBugsinkConfiguration({
			PROD: false,
			PUBLIC_BUGSINK_RELEASE: testBugsinkConfiguration.release
		});

		assert.strictEqual(isOk(configurationResult), true);
		assert.strictEqual(configurationResult.unwrapOr(undefined), undefined);
	});

	test("defines the public DSN in one source configuration module", async function () {
		const configurationSource = await readFile(
			join(repositoryRootDirectoryPath, "source/error-reporting/bugsink-configuration.ts"),
			"utf8"
		);

		assert.strictEqual(configurationSource.match(/https:\/\/[^\s"]+@bugsink\.82r\.de/gu)?.length, 1);
	});

	test("uses the shared production tags and privacy policy", function () {
		const actualBugsinkEventTags = createBugsinkEventTags("browser", testBugsinkConfiguration.release);

		assert.deepStrictEqual(actualBugsinkEventTags, {
			application: bugsinkApplication,
			environment: bugsinkEnvironment,
			release: testBugsinkConfiguration.release,
			runtime: "browser"
		});
		assert.deepStrictEqual(createBugsinkDataCollection(), {
			cookies: false,
			databaseQueryData: false,
			frameContextLines: 0,
			genAI: { inputs: false, outputs: false },
			graphQL: { document: false, variables: false },
			httpBodies: [],
			httpHeaders: { request: false, response: false },
			stackFrameVariables: false,
			urlQueryParams: false,
			userInfo: false
		});
	});

	test("configures the server adapter without browser instrumentation", function () {
		const serverOptions = createBugsinkServerOptions(testBugsinkConfiguration);
		const { integrations } = serverOptions;

		if (!Array.isArray(integrations)) {
			throw new TypeError("Expected explicit server integrations.");
		}

		const { defaultIntegrations, dsn, environment, release } = serverOptions;
		assert.deepStrictEqual(
			{ defaultIntegrations, dsn, environment, release },
			{
				defaultIntegrations: false,
				dsn: testBugsinkConfiguration.dsn,
				environment: bugsinkEnvironment,
				release: testBugsinkConfiguration.release
			}
		);
		assert.deepStrictEqual(
			integrations.map(function readIntegrationName(integration) {
				return integration.name;
			}),
			["Dedupe", "LinkedErrors", "OnUncaughtException", "OnUnhandledRejection"]
		);
		assert.strictEqual(serverOptions.tracesSampleRate, undefined);
	});

	test("does not initialize the server adapter outside the deployed runtime", function () {
		const initializationOptions: unknown[] = [];
		const fakeServerSdk: BugsinkServerSdk = {
			captureException() {
				return "server-event-id";
			},
			init(options): undefined {
				initializationOptions.push(options);
				return undefined;
			}
		};

		const wasInitialized = initializeBugsinkServer({
			configuration: testBugsinkConfiguration,
			isProductionApplicationRuntime: false,
			sdk: fakeServerSdk
		});

		assert.strictEqual(wasInitialized, false);
		assert.deepStrictEqual(initializationOptions, []);
	});

	test("reports unexpected server request failures with technical tags", function () {
		const capturedFailures: { readonly error: unknown; readonly context: unknown }[] = [];
		const reportUnexpectedServerFailure = createUnexpectedServerFailureReporter({
			captureException(error, context) {
				capturedFailures.push({ context, error });
				return "server-event-id";
			}
		});
		const expectedError = new Error("unexpected request failure");

		reportUnexpectedServerFailure({
			error: expectedError,
			method: "PUT",
			pathname: "/api/reactions/example-post",
			statusCode: 500
		});

		assert.strictEqual(capturedFailures.length, 1);
		assert.deepStrictEqual(capturedFailures[0], {
			context: {
				tags: {
					"http.method": "PUT",
					"http.pathname": "/api/reactions/example-post",
					"http.status_code": "500"
				}
			},
			error: expectedError
		});
	});
});
