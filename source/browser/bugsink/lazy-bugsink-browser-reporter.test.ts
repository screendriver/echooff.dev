import assert from "node:assert";
import { suite, test } from "mocha";
import { just, nothing } from "true-myth/maybe";
import type { UnexpectedFailureContext, UnexpectedFailureReporter } from "../report-unexpected-browser-failure.ts";
import { createLazyBugsinkBrowserReporter, type BrowserBugsinkSdkModule } from "./lazy-bugsink-browser-reporter.ts";

const testConfiguration = {
	dsn: "https://public-key@bugsink.82r.de/2",
	release: "release-test"
} as const;

type FakeBrowserBugsinkSdk = {
	captureException: BrowserBugsinkSdkModule["captureException"];
	readonly capturedContexts: readonly unknown[];
	readonly capturedErrors: readonly unknown[];
	readonly dedupeIntegration: BrowserBugsinkSdkModule["dedupeIntegration"];
	readonly init: BrowserBugsinkSdkModule["init"];
	readonly initializationOptions: readonly unknown[];
	readonly linkedErrorsIntegration: BrowserBugsinkSdkModule["linkedErrorsIntegration"];
};

type CreateReporterOptions = {
	readonly configuration?: typeof testConfiguration;
	readonly loadSdk?: () => Promise<BrowserBugsinkSdkModule>;
	readonly terminalFailures?: readonly unknown[];
};

type CreatedReporter = {
	readonly fakeSdk: FakeBrowserBugsinkSdk;
	readonly reporter: UnexpectedFailureReporter;
	readonly terminalFailures: readonly unknown[];
};

type SynchronousUnexpectedFailureReport = (error: unknown, context: UnexpectedFailureContext) => unknown;

type RecordedSentryInitializationOptions = {
	readonly integrations?: readonly { readonly name: string }[];
};

function createFakeBrowserBugsinkSdk(): FakeBrowserBugsinkSdk {
	const capturedContexts: unknown[] = [];
	const capturedErrors: unknown[] = [];
	const initializationOptions: unknown[] = [];

	const fakeSdk = {
		captureException(error: unknown, context: unknown): string {
			capturedErrors.push(error);
			capturedContexts.push(context);
			return "event-id";
		},
		capturedContexts,
		capturedErrors,
		dedupeIntegration() {
			return { name: "Dedupe" };
		},
		init(options: unknown): undefined {
			initializationOptions.push(options);
			return undefined;
		},
		initializationOptions,
		linkedErrorsIntegration() {
			return { name: "LinkedErrors" };
		}
	} as unknown as FakeBrowserBugsinkSdk;

	return fakeSdk;
}

function createReporter(options: CreateReporterOptions = {}): CreatedReporter {
	const terminalFailures: unknown[] =
		options.terminalFailures === undefined ? [] : Array.from(options.terminalFailures);
	const fakeSdk = createFakeBrowserBugsinkSdk();
	const reporter = createLazyBugsinkBrowserReporter({
		configuration:
			options.configuration === undefined ? nothing<typeof testConfiguration>() : just(options.configuration),
		loadSdk:
			options.loadSdk ??
			async function loadFakeSdk(): Promise<BrowserBugsinkSdkModule> {
				return fakeSdk;
			},
		readPathname(): string {
			return "/blog/first-post";
		},
		terminalFallback(error): void {
			terminalFailures.push(error);
		}
	});

	return { fakeSdk, reporter, terminalFailures };
}

function createFailureContext(): UnexpectedFailureContext {
	return {
		feature: "blog_reactions",
		operation: "blog_reaction.add",
		properties: {
			statusCode: 403
		},
		runtime: "browser"
	};
}

function reportFailureAndReadReturnValue(
	reporter: UnexpectedFailureReporter,
	error: unknown,
	context: UnexpectedFailureContext
): unknown {
	const synchronousReport: SynchronousUnexpectedFailureReport = reporter.report;

	return synchronousReport(error, context);
}

async function flushReportingTask(): Promise<void> {
	await Promise.resolve();
	await Promise.resolve();
	await Promise.resolve();
}

suite("createLazyBugsinkBrowserReporter()", function () {
	test("does not load the SDK during reporter construction", function () {
		let loadCount = 0;

		createReporter({
			configuration: testConfiguration,
			loadSdk: async function loadSdk(): Promise<BrowserBugsinkSdkModule> {
				loadCount += 1;
				return createFakeBrowserBugsinkSdk();
			}
		});

		assert.strictEqual(loadCount, 0);
	});

	test("loads and initializes the SDK once after the first report", async function () {
		const { fakeSdk, reporter } = createReporter({ configuration: testConfiguration });
		const expectedFailure = new Error("browser failure");

		const actualReturnValue = reportFailureAndReadReturnValue(reporter, expectedFailure, createFailureContext());
		await flushReportingTask();

		assert.strictEqual(actualReturnValue, undefined);
		assert.deepStrictEqual(fakeSdk.capturedErrors, [expectedFailure]);
		const initializationOptions = fakeSdk.initializationOptions[0] as Record<string, unknown>;
		const configuredIntegrations = (fakeSdk.initializationOptions[0] as RecordedSentryInitializationOptions)
			.integrations;

		assert.deepStrictEqual(
			configuredIntegrations?.map(function readIntegrationName(integration): string {
				return integration.name;
			}),
			["Dedupe", "LinkedErrors"]
		);
		assert.deepStrictEqual(
			{
				defaultIntegrations: initializationOptions.defaultIntegrations,
				replaysOnErrorSampleRate: initializationOptions.replaysOnErrorSampleRate,
				replaysSessionSampleRate: initializationOptions.replaysSessionSampleRate,
				sendDefaultPii: initializationOptions.sendDefaultPii,
				tracesSampleRate: initializationOptions.tracesSampleRate
			},
			{
				defaultIntegrations: false,
				replaysOnErrorSampleRate: undefined,
				replaysSessionSampleRate: undefined,
				sendDefaultPii: false,
				tracesSampleRate: undefined
			}
		);
	});

	test("shares one loading promise for concurrent reports and reuses the client", async function () {
		let resolveSdk: (sdk: BrowserBugsinkSdkModule) => void = function resolveSdkBeforeLoad(): never {
			throw new Error("Expected the SDK loading promise to be pending.");
		};
		let loadCount = 0;
		const fakeSdk = createFakeBrowserBugsinkSdk();
		const { reporter } = createReporter({
			configuration: testConfiguration,
			loadSdk: async function loadSdk(): Promise<BrowserBugsinkSdkModule> {
				loadCount += 1;
				return new Promise<BrowserBugsinkSdkModule>(function createSdkTask(resolve) {
					resolveSdk = resolve;
				});
			}
		});
		const firstFailure = new Error("first failure");
		const secondFailure = new Error("second failure");

		reporter.report(firstFailure, createFailureContext());
		reporter.report(secondFailure, createFailureContext());
		assert.strictEqual(loadCount, 1);

		resolveSdk(fakeSdk);
		await flushReportingTask();
		reporter.report(new Error("later failure"), createFailureContext());
		await flushReportingTask();

		assert.strictEqual(loadCount, 1);
		assert.partialDeepStrictEqual(fakeSdk, {
			capturedErrors: [firstFailure, secondFailure],
			initializationOptions: [{}]
		});
	});

	test("attaches safe context without cookies or request data", async function () {
		const { fakeSdk, reporter } = createReporter({ configuration: testConfiguration });

		reporter.report(new Error("context failure"), createFailureContext());
		await flushReportingTask();

		const captureContext = fakeSdk.capturedContexts[0] as Record<string, unknown>;
		assert.partialDeepStrictEqual(captureContext, {
			extra: { pathname: "/blog/first-post" },
			tags: {
				application: "echooff.dev",
				environment: "production",
				feature: "blog_reactions",
				operation: "blog_reaction.add",
				release: "release-test",
				runtime: "browser",
				statusCode: "403"
			}
		});
		assert.deepStrictEqual(Object.keys(captureContext), ["extra", "tags"]);
	});

	test("handles an SDK loading failure and permits one later retry", async function () {
		let loadCount = 0;
		const fakeSdk = createFakeBrowserBugsinkSdk();
		const { reporter, terminalFailures } = createReporter({
			configuration: testConfiguration,
			loadSdk: async function loadSdk(): Promise<BrowserBugsinkSdkModule> {
				loadCount += 1;
				if (loadCount === 1) {
					throw new Error("SDK load failure");
				}

				return fakeSdk;
			}
		});
		const firstFailure = new Error("first failure");
		const secondFailure = new Error("second failure");

		reporter.report(firstFailure, createFailureContext());
		await flushReportingTask();
		reporter.report(secondFailure, createFailureContext());
		await flushReportingTask();

		assert.strictEqual(loadCount, 2);
		assert.deepStrictEqual(terminalFailures, [firstFailure]);
		assert.deepStrictEqual(fakeSdk.capturedErrors, [secondFailure]);
	});

	test("uses the terminal fallback when capture fails without reporting the capture failure", async function () {
		const fakeSdk = createFakeBrowserBugsinkSdk();
		fakeSdk.captureException = function captureException(): never {
			throw new Error("capture failure");
		};
		const { reporter, terminalFailures } = createReporter({
			configuration: testConfiguration,
			loadSdk: async function loadSdk(): Promise<BrowserBugsinkSdkModule> {
				return fakeSdk;
			}
		});
		const originalFailure = new Error("original failure");

		reporter.report(originalFailure, createFailureContext());
		await flushReportingTask();

		assert.deepStrictEqual(terminalFailures, [originalFailure]);
	});

	test("does not load the SDK when configuration is absent", async function () {
		let loadCount = 0;
		const { reporter, terminalFailures } = createReporter({
			loadSdk: async function loadSdk(): Promise<BrowserBugsinkSdkModule> {
				loadCount += 1;
				return createFakeBrowserBugsinkSdk();
			}
		});
		const expectedFailure = new Error("local failure");

		reporter.report(expectedFailure, createFailureContext());

		assert.strictEqual(loadCount, 0);
		assert.deepStrictEqual(terminalFailures, [expectedFailure]);
	});
});
