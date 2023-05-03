import { test, assert, vi } from "vitest";
import { createErrorReporter } from "../../../source/error-reporter/reporter";

test("sends the given error to Sentry", () => {
	const originalConsoleError = console.error;
	try {
		const errorFunctionMock = vi.fn<unknown[], unknown>();
		console.error = errorFunctionMock;

		const error = new Error("Test error");
		createErrorReporter().send(error);

		assert.strictEqual(errorFunctionMock.mock.calls.length, 1);
		assert.strictEqual(errorFunctionMock.mock.calls[0]?.[0], error);
	} finally {
		console.error = originalConsoleError;
	}
});
