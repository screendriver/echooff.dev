import assert from "node:assert";
import { suite, test } from "mocha";
import { fake } from "sinon";
import { createStandardStreamRuntimeLogger } from "./runtime-logger.ts";

suite("standardStreamRuntimeLogger", function () {
	test("writes structured info messages to standard output", function () {
		const writeErrorText = fake<[string], undefined>();
		const writeOutputText = fake<[string], undefined>();
		const standardStreamRuntimeLogger = createStandardStreamRuntimeLogger({ writeErrorText, writeOutputText });

		standardStreamRuntimeLogger.info("Loaded blog post mentions", {
			durationMilliseconds: 42,
			event: "blog_post_mentions_loaded"
		});

		assert.deepStrictEqual(writeOutputText.firstCall.args, [
			'{"level":"info","message":"Loaded blog post mentions","durationMilliseconds":42,"event":"blog_post_mentions_loaded"}\n'
		]);
		assert.strictEqual(writeErrorText.notCalled, true);
	});

	test("writes Error warning messages to standard error", function () {
		const writeErrorText = fake<[string], undefined>();
		const writeOutputText = fake<[string], undefined>();
		const standardStreamRuntimeLogger = createStandardStreamRuntimeLogger({ writeErrorText, writeOutputText });

		standardStreamRuntimeLogger.warn("Unable to load mentions", new Error("service unavailable"), {
			event: "blog_post_mentions_load_failed"
		});

		assert.deepStrictEqual(writeErrorText.firstCall.args, [
			'{"level":"warn","message":"Unable to load mentions","event":"blog_post_mentions_load_failed","errorMessage":"service unavailable","errorName":"Error"}\n'
		]);
		assert.strictEqual(writeOutputText.notCalled, true);
	});

	test("writes unknown warning values to standard error", function () {
		const writeErrorText = fake<[string], undefined>();
		const writeOutputText = fake<[string], undefined>();
		const standardStreamRuntimeLogger = createStandardStreamRuntimeLogger({ writeErrorText, writeOutputText });

		standardStreamRuntimeLogger.warn("Unable to load mentions", "service unavailable", {
			event: "blog_post_mentions_load_failed"
		});

		assert.deepStrictEqual(writeErrorText.firstCall.args, [
			'{"level":"warn","message":"Unable to load mentions","event":"blog_post_mentions_load_failed","errorMessage":"service unavailable","errorName":"UnknownError"}\n'
		]);
		assert.strictEqual(writeOutputText.notCalled, true);
	});
});
