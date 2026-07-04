import { describe, expect, it } from "vitest";
import { just, nothing } from "true-myth/maybe";
import { err, ok } from "true-myth/result";
import { parseCachedMaybeString } from "./cached-maybe.ts";

describe("parseCachedMaybeString()", () => {
	it("parses a serialized Just string", () => {
		const actualResult = parseCachedMaybeString({
			value: "https://example.com/avatar.jpg",
			variant: "Just"
		});
		const expectedResult = ok(just("https://example.com/avatar.jpg"));

		expect(actualResult).toStrictEqual(expectedResult);
	});

	it("parses a serialized Nothing value", () => {
		const actualResult = parseCachedMaybeString({
			variant: "Nothing"
		});
		const expectedResult = ok(nothing());

		expect(actualResult).toStrictEqual(expectedResult);
	});

	it("rejects malformed serialized values", () => {
		const actualResult = parseCachedMaybeString({
			value: 123,
			variant: "Just"
		});
		const expectedResult = err(new TypeError("Cached Maybe Just value must be a string."));

		expect(actualResult).toStrictEqual(expectedResult);
	});
});
