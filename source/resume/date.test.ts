import { test, expect } from "vitest";
import { formatSinceDate } from "./date.js";

type TestFormatSinceDateErrorInput = {
	readonly since: string;
	readonly onlyYear: boolean;
	readonly expectedErrorMessage: string;
};

test.each<TestFormatSinceDateErrorInput>([
	{ since: "", onlyYear: true, expectedErrorMessage: 'Since "" is not a valid date' },
	{ since: "", onlyYear: false, expectedErrorMessage: 'Since "" is not a valid date' },
	{ since: "foo", onlyYear: true, expectedErrorMessage: 'Since "foo" is not a valid date' },
	{ since: "foo", onlyYear: false, expectedErrorMessage: 'Since "foo" is not a valid date' },
])("formatSinceDate() returns a Result Err when 'since' is equals $since and 'onlyYear' is $onlyYear", (input) => {
	const { since, onlyYear, expectedErrorMessage } = input;
	const formattedDateResult = formatSinceDate(since, onlyYear);

	if (formattedDateResult.isErr) {
		expect(formattedDateResult.error).toBe(expectedErrorMessage);
	} else {
		expect.fail("Result is not an Err");
	}
});

type TestFormatSinceDateOkInput = {
	readonly since: string;
	readonly onlyYear: boolean;
	readonly expectedFormatResult: string;
};

test.each<TestFormatSinceDateOkInput>([
	{ since: "2022-01-01", onlyYear: true, expectedFormatResult: "2022" },
	{ since: "2022-01-01", onlyYear: false, expectedFormatResult: "January 2022" },
])("formatSinceDate() returns a Result Ok when 'onlyYear' is $onlyYear", (input) => {
	const { since, onlyYear, expectedFormatResult } = input;
	const formattedDateResult = formatSinceDate(since, onlyYear);

	if (formattedDateResult.isOk) {
		expect(formattedDateResult.value).toBe(expectedFormatResult);
	} else {
		expect.fail("Result is not an Ok");
	}
});
