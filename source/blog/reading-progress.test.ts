import { describe, expect, it, vi } from "vitest";
import { calculateReadingProgressPercentage, initializeReadingProgressIndicator } from "./reading-progress.ts";

function failWhenListenerWasNotRegistered(): void {
	throw new Error("Expected the reading progress listener to be registered before invocation");
}

describe("calculateReadingProgressPercentage()", () => {
	it("returns zero percent at the top of the page", () => {
		const actualProgressPercentage = calculateReadingProgressPercentage({
			documentScrollHeight: 2400,
			verticalScrollOffset: 0,
			viewportHeight: 800
		});
		const expectedProgressPercentage = 0;

		expect(actualProgressPercentage).toBe(expectedProgressPercentage);
	});

	it("returns one hundred percent at the bottom of the page", () => {
		const actualProgressPercentage = calculateReadingProgressPercentage({
			documentScrollHeight: 2400,
			verticalScrollOffset: 1600,
			viewportHeight: 800
		});
		const expectedProgressPercentage = 100;

		expect(actualProgressPercentage).toBe(expectedProgressPercentage);
	});

	it("clamps values below zero percent", () => {
		const actualProgressPercentage = calculateReadingProgressPercentage({
			documentScrollHeight: 2400,
			verticalScrollOffset: -200,
			viewportHeight: 800
		});
		const expectedProgressPercentage = 0;

		expect(actualProgressPercentage).toBe(expectedProgressPercentage);
	});

	it("clamps values above one hundred percent", () => {
		const actualProgressPercentage = calculateReadingProgressPercentage({
			documentScrollHeight: 2400,
			verticalScrollOffset: 3200,
			viewportHeight: 800
		});
		const expectedProgressPercentage = 100;

		expect(actualProgressPercentage).toBe(expectedProgressPercentage);
	});

	it("returns one hundred percent for pages without scrollable distance", () => {
		const actualProgressPercentage = calculateReadingProgressPercentage({
			documentScrollHeight: 800,
			verticalScrollOffset: 0,
			viewportHeight: 800
		});
		const expectedProgressPercentage = 100;

		expect(actualProgressPercentage).toBe(expectedProgressPercentage);
	});
});

describe("initializeReadingProgressIndicator()", () => {
	it("writes the initial progress immediately and updates on scroll and resize", () => {
		let verticalScrollOffset = 0;
		const recordedProgressPercentages: number[] = [];
		let registeredScrollListener = failWhenListenerWasNotRegistered;
		let registeredResizeListener = failWhenListenerWasNotRegistered;

		initializeReadingProgressIndicator({
			readDocumentScrollHeight() {
				return 2400;
			},
			readVerticalScrollOffset() {
				return verticalScrollOffset;
			},
			readViewportHeight() {
				return 800;
			},
			registerResizeListener(listener) {
				registeredResizeListener = listener;
			},
			registerScrollListener(listener) {
				registeredScrollListener = listener;
			},
			writeProgressPercentage(progressPercentage) {
				recordedProgressPercentages.push(progressPercentage);
			}
		});

		verticalScrollOffset = 400;
		registeredScrollListener();

		verticalScrollOffset = 1200;
		registeredResizeListener();

		const actualProgressPercentages = recordedProgressPercentages;
		const expectedProgressPercentages = [0, 25, 75];

		expect(actualProgressPercentages).toStrictEqual(expectedProgressPercentages);
	});

	it("registers one scroll listener and one resize listener", () => {
		let recordedProgressWriteCount = 0;
		const registerScrollListener = vi.fn<(listener: () => void) => void>((listener) => {
			const actualListenerType = typeof listener;
			const expectedListenerType = "function";

			expect(actualListenerType).toBe(expectedListenerType);
		});
		const registerResizeListener = vi.fn<(listener: () => void) => void>((listener) => {
			const actualListenerType = typeof listener;
			const expectedListenerType = "function";

			expect(actualListenerType).toBe(expectedListenerType);
		});

		initializeReadingProgressIndicator({
			readDocumentScrollHeight() {
				return 2400;
			},
			readVerticalScrollOffset() {
				return 0;
			},
			readViewportHeight() {
				return 800;
			},
			registerResizeListener,
			registerScrollListener,
			writeProgressPercentage() {
				recordedProgressWriteCount += 1;
			}
		});

		const actualProgressWriteCount = recordedProgressWriteCount;
		const expectedProgressWriteCount = 1;

		expect(actualProgressWriteCount).toBe(expectedProgressWriteCount);

		const actualRegisterScrollListener = registerScrollListener;
		const actualRegisterResizeListener = registerResizeListener;

		expect(actualRegisterScrollListener).toHaveBeenCalledOnce();
		expect(actualRegisterResizeListener).toHaveBeenCalledOnce();
	});
});
