import assert from "node:assert";
import { suite, test } from "mocha";
import { just, nothing } from "true-myth/maybe";
import { err, ok } from "true-myth/result";
import { parseCachedMaybeString } from "./cached-maybe.ts";

suite("parseCachedMaybeString()", function () {
	test("parses a serialized Just string", function () {
		const actualResult = parseCachedMaybeString({
			value: "https://example.com/avatar.jpg",
			variant: "Just"
		});
		const expectedResult = ok(just("https://example.com/avatar.jpg"));

		assert.deepStrictEqual(actualResult, expectedResult);
	});

	test("parses a serialized Nothing value", function () {
		const actualResult = parseCachedMaybeString({
			variant: "Nothing"
		});
		const expectedResult = ok(nothing());

		assert.deepStrictEqual(actualResult, expectedResult);
	});

	test("rejects malformed serialized values", function () {
		const actualResult = parseCachedMaybeString({
			value: 123,
			variant: "Just"
		});
		const expectedResult = err(new TypeError("Cached Maybe value is malformed."));

		assert.deepStrictEqual(actualResult, expectedResult);
	});
});
