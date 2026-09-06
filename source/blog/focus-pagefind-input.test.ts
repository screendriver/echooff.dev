import assert from "node:assert";
import { suite, test } from "mocha";
import { focusPagefindInput, type PagefindInput } from "./focus-pagefind-input.ts";

suite("focusPagefindInput()", function () {
	test("focuses the Pagefind custom element", function () {
		let focusCallCount = 0;
		const pagefindInput: PagefindInput = {
			focus() {
				focusCallCount += 1;
			}
		};

		focusPagefindInput(pagefindInput);

		assert.strictEqual(focusCallCount, 1);
	});

	test("does nothing when the Pagefind custom element is not available", function () {
		focusPagefindInput(null);
	});
});
