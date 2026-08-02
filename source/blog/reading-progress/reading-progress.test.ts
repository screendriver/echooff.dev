import assert from "node:assert";
import { suite, test } from "mocha";
import { calculateReadingProgressPercentage } from "./reading-progress.ts";

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

	test("returns fifty percent in the middle of a scrollable page", function () {
		const actualProgressPercentage = calculateReadingProgressPercentage({
			documentScrollHeight: 2400,
			verticalScrollOffset: 800,
			viewportHeight: 800
		});
		const expectedProgressPercentage = 50;

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

	test("preserves fractional numeric boundary values", function () {
		const actualProgressPercentage = calculateReadingProgressPercentage({
			documentScrollHeight: 1000,
			verticalScrollOffset: 333.333333,
			viewportHeight: 400
		});
		const expectedProgressPercentage = 55.5555555;

		assert.ok(Math.abs(actualProgressPercentage - expectedProgressPercentage) < 0.000001);
	});
});
