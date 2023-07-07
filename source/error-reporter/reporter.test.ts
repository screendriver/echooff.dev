import test from "node:test";
import assert from "node:assert";
import { fake } from "sinon";
import { createErrorReporter } from "./reporter";

test("sends the given error to Sentry", () => {
	const originalConsoleError = console.error;
	try {
		const errorFunctionFake = fake();
		console.error = errorFunctionFake;

		const error = new Error("Test error");
		createErrorReporter().send(error);

		assert.strictEqual(errorFunctionFake.callCount, 1);
		assert.strictEqual(errorFunctionFake.args[0]?.[0], error);
	} finally {
		console.error = originalConsoleError;
	}
});
