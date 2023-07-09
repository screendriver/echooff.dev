import test from "ava";
import { fake } from "sinon";
import { createErrorReporter } from "./reporter";

test("sends the given error to Sentry", (t) => {
	const originalConsoleError = console.error;
	try {
		const errorFunctionFake = fake();
		console.error = errorFunctionFake;

		const error = new Error("Test error");
		createErrorReporter().send(error);

		t.is(errorFunctionFake.callCount, 1);
		t.is(errorFunctionFake.args[0]?.[0], error);
	} finally {
		console.error = originalConsoleError;
	}
});
