import { test, assert } from "vitest";
import { formatSinceDate } from "../../../source/resume/date";

interface Input {
	readonly since: string;
	readonly onlyYear: boolean;
}

test.each<[string, Input, string]>([
	['is an empty string and "onlyYear" is true', { since: "", onlyYear: true }, 'Since "" is not a valid date'],
	['is an empty string and "onlyYear" is false', { since: "", onlyYear: true }, 'Since "" is not a valid date'],
	[
		'is an invalid string and "onlyYear" is true',
		{ since: "foo", onlyYear: true },
		'Since "foo" is not a valid date',
	],
	[
		'is an invalid string and "onlyYear" is false',
		{ since: "foo", onlyYear: false },
		'Since "foo" is not a valid date',
	],
])('formatSinceDate() returns a Result Err when "since" %s', (_testDescription, input, expected) => {
	const formattedDateResult = formatSinceDate(input.since, input.onlyYear);

	if (formattedDateResult.isErr) {
		assert.strictEqual(formattedDateResult.error, expected);
	} else {
		assert.fail("Result is not an Err");
	}
});

test.each<[string, Input, string]>([
	["with only the year", { since: "2022-01-01", onlyYear: true }, "2022"],
	["with the year and full month", { since: "2022-02-01", onlyYear: false }, "February 2022"],
])("formatSinceDate() returns a Result Ok %s", (_testDescription, input, expected) => {
	const formattedDateResult = formatSinceDate(input.since, input.onlyYear);

	if (formattedDateResult.isOk) {
		assert.strictEqual(formattedDateResult.value, expected);
	} else {
		assert.fail("Result is not an Ok");
	}
});
