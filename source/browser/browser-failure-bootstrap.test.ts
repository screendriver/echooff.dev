import assert from "node:assert";
import { suite, test } from "mocha";
import { createBrowserFailureBootstrap, type BrowserFailureBootstrap } from "./browser-failure-bootstrap.ts";
import type { UnexpectedFailureContext, UnexpectedFailureReporter } from "./report-unexpected-browser-failure.ts";

type RecordedListener = (event: unknown) => void;

type TestBootstrap = {
	readonly bootstrap: BrowserFailureBootstrap;
	readonly listeners: ReadonlyMap<string, RecordedListener>;
	readonly reportedFailures: readonly { readonly context: UnexpectedFailureContext; readonly error: unknown }[];
};

function createTestBootstrap(): TestBootstrap {
	const listeners = new Map<string, RecordedListener>();
	const reportedFailures: { readonly context: UnexpectedFailureContext; readonly error: unknown }[] = [];
	const reporter: UnexpectedFailureReporter = {
		report(error, context): void {
			reportedFailures.push({ context, error });
		}
	};
	const bootstrap = createBrowserFailureBootstrap({
		capabilities: {
			addEventListener(eventName, listener): void {
				listeners.set(eventName, listener);
			}
		},
		reporter
	});

	return { bootstrap, listeners, reportedFailures };
}

suite("createBrowserFailureBootstrap()", function () {
	test("registers one error and one unhandled-rejection listener", function () {
		const { bootstrap, listeners } = createTestBootstrap();

		assert.strictEqual(bootstrap.install(), true);
		assert.strictEqual(listeners.size, 2);
		assert.strictEqual(listeners.has("error"), true);
		assert.strictEqual(listeners.has("unhandledrejection"), true);
	});

	test("prevents duplicate listener registration", function () {
		const { bootstrap, listeners } = createTestBootstrap();

		assert.strictEqual(bootstrap.install(), true);
		assert.strictEqual(bootstrap.install(), false);
		assert.strictEqual(listeners.size, 2);
	});

	test("delegates the original ErrorEvent error without preventing default behaviour", function () {
		const { bootstrap, listeners, reportedFailures } = createTestBootstrap();
		const expectedFailure = new Error("browser failure");

		bootstrap.install();
		const errorListener = listeners.get("error");

		if (errorListener === undefined) {
			throw new Error("Expected an error listener.");
		}

		errorListener({
			error: expectedFailure,
			preventDefault(): never {
				throw new Error("must not be called");
			}
		});

		assert.deepStrictEqual(reportedFailures, [
			{
				context: { operation: "window.error", runtime: "browser" },
				error: expectedFailure
			}
		]);
	});

	test("ignores resource errors without a useful exception", function () {
		const { bootstrap, listeners, reportedFailures } = createTestBootstrap();

		bootstrap.install();
		const errorListener = listeners.get("error");

		if (errorListener === undefined) {
			throw new Error("Expected an error listener.");
		}

		errorListener({ type: "error", target: { tagName: "IMG" } });
		errorListener({ error: null });

		assert.deepStrictEqual(reportedFailures, []);
	});

	test("delegates the original unhandled rejection reason, including non-Error values", function () {
		const { bootstrap, listeners, reportedFailures } = createTestBootstrap();
		const expectedReason = "rejected string";

		bootstrap.install();
		const unhandledRejectionListener = listeners.get("unhandledrejection");

		if (unhandledRejectionListener === undefined) {
			throw new Error("Expected an unhandled-rejection listener.");
		}

		unhandledRejectionListener({ reason: expectedReason });

		assert.deepStrictEqual(reportedFailures, [
			{
				context: { operation: "window.unhandledrejection", runtime: "browser" },
				error: expectedReason
			}
		]);
	});

	test("does not report during listener installation", function () {
		const { bootstrap, reportedFailures } = createTestBootstrap();

		bootstrap.install();

		assert.deepStrictEqual(reportedFailures, []);
	});
});
