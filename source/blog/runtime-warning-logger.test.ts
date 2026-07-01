import { describe, expect, it, vi } from "vitest";
import { createStandardErrorRuntimeWarningLogger } from "./runtime-warning-logger.ts";

describe("standardErrorRuntimeWarningLogger", () => {
	it("writes Error messages to standard error", () => {
		const writeText = vi.fn<(textContent: string) => void>();
		const standardErrorRuntimeWarningLogger = createStandardErrorRuntimeWarningLogger({ writeText });

		standardErrorRuntimeWarningLogger.warn("Unable to load mentions", new Error("service unavailable"));

		expect(writeText).toHaveBeenCalledWith("Unable to load mentions: service unavailable\n");
	});

	it("writes unknown error values to standard error", () => {
		const writeText = vi.fn<(textContent: string) => void>();
		const standardErrorRuntimeWarningLogger = createStandardErrorRuntimeWarningLogger({ writeText });

		standardErrorRuntimeWarningLogger.warn("Unable to load mentions", "service unavailable");

		expect(writeText).toHaveBeenCalledWith("Unable to load mentions: service unavailable\n");
	});
});
