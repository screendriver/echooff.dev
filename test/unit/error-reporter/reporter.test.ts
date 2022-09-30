import { test, assert, vi } from "vitest";
import { createErrorReporter, ErrorReporterDependencies } from "../../../src/error-reporter/reporter";

test("sends the given error to Sentry", () => {
    const captureException = vi.fn();
    const dependencies = {
        sentry: {
            captureException,
        },
    } as unknown as ErrorReporterDependencies;
    const error = new Error("Test error");
    createErrorReporter(dependencies).send(error);

    assert.strictEqual(captureException.mock.calls.length, 1);
    assert.strictEqual(captureException.mock.calls[0]?.[0], error);
});
