import test from "ava";
import { formatSinceDate } from "./date.js";

interface TestFormatSinceDateErrorInput {
	readonly since: string;
	readonly onlyYear: boolean;
}

const testFormatSinceDateErrorMacro = test.macro<[TestFormatSinceDateErrorInput, string]>(
	(t, input, expectedErrorMessage) => {
		const { since, onlyYear } = input;
		const formattedDateResult = formatSinceDate(since, onlyYear);

		if (formattedDateResult.isErr) {
			t.is(formattedDateResult.error, expectedErrorMessage);
		} else {
			t.fail("Result is not an Err");
		}
	},
);

test(
	'formatSinceDate() returns a Result Err when "since" is an empty string and "onlyYear" is true',
	testFormatSinceDateErrorMacro,
	{ since: "", onlyYear: true },
	'Since "" is not a valid date',
);

test(
	'formatSinceDate() returns a Result Err when "since" is an empty string and "onlyYear" is false',
	testFormatSinceDateErrorMacro,
	{ since: "", onlyYear: false },
	'Since "" is not a valid date',
);

test(
	'formatSinceDate() returns a Result Err when "since" is an invalid string and "onlyYear" is true',
	testFormatSinceDateErrorMacro,
	{ since: "foo", onlyYear: true },
	'Since "foo" is not a valid date',
);

test(
	'formatSinceDate() returns a Result Err when "since" is an invalid string and "onlyYear" is false',
	testFormatSinceDateErrorMacro,
	{ since: "foo", onlyYear: false },
	'Since "foo" is not a valid date',
);

interface TestFormatSinceDateOkInput {
	readonly since: string;
	readonly onlyYear: boolean;
}

const testFormatSinceDateOkMacro = test.macro<[TestFormatSinceDateOkInput, string]>(
	(t, input, expectedFormatResult) => {
		const { since, onlyYear } = input;
		const formattedDateResult = formatSinceDate(since, onlyYear);

		if (formattedDateResult.isOk) {
			t.is(formattedDateResult.value, expectedFormatResult);
		} else {
			t.fail("Result is not an Ok");
		}
	},
);

test(
	"formatSinceDate() returns a Result Ok with only the year",
	testFormatSinceDateOkMacro,
	{ since: "2022-01-01", onlyYear: true },
	"2022",
);

test(
	"formatSinceDate() returns a Result Ok with the year and full month",
	testFormatSinceDateOkMacro,
	{ since: "2022-01-01", onlyYear: false },
	"January 2022",
);
