import { describe, expect, it, vi } from "vitest";
import { createStandardStreamRuntimeLogger } from "./runtime-logger.ts";

describe("standardStreamRuntimeLogger", () => {
	it("writes structured info messages to standard output", () => {
		const writeErrorText = vi.fn<(textContent: string) => void>();
		const writeOutputText = vi.fn<(textContent: string) => void>();
		const standardStreamRuntimeLogger = createStandardStreamRuntimeLogger({ writeErrorText, writeOutputText });

		standardStreamRuntimeLogger.info("Loaded blog post mentions", {
			durationMilliseconds: 42,
			event: "blog_post_mentions_loaded"
		});

		expect(writeOutputText).toHaveBeenCalledWith(
			'{"level":"info","message":"Loaded blog post mentions","durationMilliseconds":42,"event":"blog_post_mentions_loaded"}\n'
		);
		expect(writeErrorText).not.toHaveBeenCalled();
	});

	it("writes Error warning messages to standard error", () => {
		const writeErrorText = vi.fn<(textContent: string) => void>();
		const writeOutputText = vi.fn<(textContent: string) => void>();
		const standardStreamRuntimeLogger = createStandardStreamRuntimeLogger({ writeErrorText, writeOutputText });

		standardStreamRuntimeLogger.warn("Unable to load mentions", new Error("service unavailable"), {
			event: "blog_post_mentions_load_failed"
		});

		expect(writeErrorText).toHaveBeenCalledWith(
			'{"level":"warn","message":"Unable to load mentions","event":"blog_post_mentions_load_failed","errorMessage":"service unavailable","errorName":"Error"}\n'
		);
		expect(writeOutputText).not.toHaveBeenCalled();
	});

	it("writes unknown warning values to standard error", () => {
		const writeErrorText = vi.fn<(textContent: string) => void>();
		const writeOutputText = vi.fn<(textContent: string) => void>();
		const standardStreamRuntimeLogger = createStandardStreamRuntimeLogger({ writeErrorText, writeOutputText });

		standardStreamRuntimeLogger.warn("Unable to load mentions", "service unavailable", {
			event: "blog_post_mentions_load_failed"
		});

		expect(writeErrorText).toHaveBeenCalledWith(
			'{"level":"warn","message":"Unable to load mentions","event":"blog_post_mentions_load_failed","errorMessage":"service unavailable","errorName":"UnknownError"}\n'
		);
		expect(writeOutputText).not.toHaveBeenCalled();
	});
});
