import { describe, it, expect, assert } from "vitest";
import { isErr, isOk } from "true-myth/result";
import { formatSinceDate } from "./date.js";

type TestFormatSinceDateErrorInput = {
	readonly since: string;
	readonly onlyYear: boolean;
	readonly expectedErrorMessage: string;
};

type TestFormatSinceDateOkInput = {
	readonly since: string;
	readonly onlyYear: boolean;
	readonly expectedFormatResult: string;
};

describe("formatSinceDate()", () => {
	it.each<TestFormatSinceDateErrorInput>([
		{ since: "", onlyYear: true, expectedErrorMessage: 'Since "" is not a valid date' },
		{ since: "", onlyYear: false, expectedErrorMessage: 'Since "" is not a valid date' },
		{ since: "foo", onlyYear: true, expectedErrorMessage: 'Since "foo" is not a valid date' },
		{ since: "foo", onlyYear: false, expectedErrorMessage: 'Since "foo" is not a valid date' }
	])("returns a Result Err when 'since' is equals $since and 'onlyYear' is $onlyYear", (input) => {
		const { since, onlyYear, expectedErrorMessage } = input;
		const formattedDateResult = formatSinceDate(since, onlyYear);

		assert(isErr(formattedDateResult));

		expect(formattedDateResult.error).toBe(expectedErrorMessage);
	});

	it.each<TestFormatSinceDateOkInput>([
		{ since: "2022-01-01", onlyYear: true, expectedFormatResult: "2022" },
		{ since: "2022-01-01", onlyYear: false, expectedFormatResult: "January 2022" }
	])("returns a Result Ok when 'onlyYear' is $onlyYear", (input) => {
		const { since, onlyYear, expectedFormatResult } = input;
		const formattedDateResult = formatSinceDate(since, onlyYear);

		assert(isOk(formattedDateResult));

		expect(formattedDateResult.value).toBe(expectedFormatResult);
	});
});
