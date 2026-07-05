import assert from "node:assert";
import { suite, test } from "mocha";
import { fake } from "sinon";
import { calculateReadingProgressPercentage, initializeReadingProgressIndicator } from "./reading-progress.ts";

function failWhenListenerWasNotRegistered(): void {
	throw new Error("Expected the reading progress listener to be registered before invocation");
}

suite("calculateReadingProgressPercentage()", function () {
	test("returns zero percent at the top of the page", function () {
		const actualProgressPercentage = calculateReadingProgressPercentage({
			documentScrollHeight: 2400,
			verticalScrollOffset: 0,
			viewportHeight: 800
		});
		const expectedProgressPercentage = 0;

		assert.strictEqual(actualProgressPercentage, expectedProgressPercentage);
	});

	test("returns one hundred percent at the bottom of the page", function () {
		const actualProgressPercentage = calculateReadingProgressPercentage({
			documentScrollHeight: 2400,
			verticalScrollOffset: 1600,
			viewportHeight: 800
		});
		const expectedProgressPercentage = 100;

		assert.strictEqual(actualProgressPercentage, expectedProgressPercentage);
	});

	test("clamps values below zero percent", function () {
		const actualProgressPercentage = calculateReadingProgressPercentage({
			documentScrollHeight: 2400,
			verticalScrollOffset: -200,
			viewportHeight: 800
		});
		const expectedProgressPercentage = 0;

		assert.strictEqual(actualProgressPercentage, expectedProgressPercentage);
	});

	test("clamps values above one hundred percent", function () {
		const actualProgressPercentage = calculateReadingProgressPercentage({
			documentScrollHeight: 2400,
			verticalScrollOffset: 3200,
			viewportHeight: 800
		});
		const expectedProgressPercentage = 100;

		assert.strictEqual(actualProgressPercentage, expectedProgressPercentage);
	});

	test("returns one hundred percent for pages without scrollable distance", function () {
		const actualProgressPercentage = calculateReadingProgressPercentage({
			documentScrollHeight: 800,
			verticalScrollOffset: 0,
			viewportHeight: 800
		});
		const expectedProgressPercentage = 100;

		assert.strictEqual(actualProgressPercentage, expectedProgressPercentage);
	});
});

suite("initializeReadingProgressIndicator()", function () {
	test("writes the initial progress immediately and updates on scroll and resize", function () {
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

		assert.deepStrictEqual(actualProgressPercentages, expectedProgressPercentages);
	});

	test("registers one scroll listener and one resize listener", function () {
		let recordedProgressWriteCount = 0;
		const registerScrollListener = fake(function (listener: () => void): void {
			const actualListenerType = typeof listener;
			const expectedListenerType = "function";

			assert.strictEqual(actualListenerType, expectedListenerType);
		});
		const registerResizeListener = fake(function (listener: () => void): void {
			const actualListenerType = typeof listener;
			const expectedListenerType = "function";

			assert.strictEqual(actualListenerType, expectedListenerType);
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

		assert.strictEqual(actualProgressWriteCount, expectedProgressWriteCount);

		assert.strictEqual(registerScrollListener.calledOnce, true);
		assert.strictEqual(registerResizeListener.calledOnce, true);
	});
});
