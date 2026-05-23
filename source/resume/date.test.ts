import { describe, it, expect, assert } from "vitest";
import { isErr, isOk } from "true-myth/result";
import { formatSinceDate } from "./date.ts";

type TestFormatSinceDateErrorInput = {
	readonly since: string;
	readonly onlyYear: boolean;
	readonly expectedErrorMessage: string;
	readonly expectedErrorType: typeof RangeError;
};

type TestFormatSinceDateOkInput = {
	readonly since: string;
	readonly onlyYear: boolean;
	readonly expectedFormatResult: string;
};

describe("formatSinceDate()", () => {
	it.each<TestFormatSinceDateErrorInput>([
		{
			since: "",
			onlyYear: true,
			expectedErrorMessage: 'Since "" is not a valid date',
			expectedErrorType: RangeError
		},
		{
			since: "",
			onlyYear: false,
			expectedErrorMessage: 'Since "" is not a valid date',
			expectedErrorType: RangeError
		},
		{
			since: "foo",
			onlyYear: true,
			expectedErrorMessage: 'Since "foo" is not a valid date',
			expectedErrorType: RangeError
		},
		{
			since: "foo",
			onlyYear: false,
			expectedErrorMessage: 'Since "foo" is not a valid date',
			expectedErrorType: RangeError
		}
	])("returns a Result Err when 'since' is equals $since and 'onlyYear' is $onlyYear", (input) => {
		const { since, onlyYear, expectedErrorMessage, expectedErrorType } = input;
		const actualFormattedDateResult = formatSinceDate(since, onlyYear);

		assert(isErr(actualFormattedDateResult));

		const actualError = actualFormattedDateResult.error;
		const actualErrorMessage = actualError.message;
		const actualErrorType = actualError;

		expect(actualErrorMessage).toBe(expectedErrorMessage);
		expect(actualErrorType).toBeInstanceOf(expectedErrorType);
	});

	it.each<TestFormatSinceDateOkInput>([
		{ since: "2022-01-01", onlyYear: true, expectedFormatResult: "2022" },
		{ since: "2022-01-01", onlyYear: false, expectedFormatResult: "January 2022" }
	])("returns a Result Ok when 'onlyYear' is $onlyYear", (input) => {
		const { since, onlyYear, expectedFormatResult } = input;
		const actualFormattedDateResult = formatSinceDate(since, onlyYear);

		assert(isOk(actualFormattedDateResult));

		const actualFormatResult = actualFormattedDateResult.value;

		expect(actualFormatResult).toBe(expectedFormatResult);
	});
});
