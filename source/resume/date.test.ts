import test from "node:test";
import assert from "node:assert";
import { formatSinceDate } from "./date.js";

interface TestFormatSinceDateErrorOptions {
	readonly since: string;
	readonly onlyYear: boolean;
	readonly expectedErrorMessage: string;
}

function testFormatSinceDateError(testOptions: TestFormatSinceDateErrorOptions): () => void {
	const { since, onlyYear, expectedErrorMessage } = testOptions;

	return () => {
		const formattedDateResult = formatSinceDate(since, onlyYear);

		if (formattedDateResult.isErr) {
			assert.strictEqual(formattedDateResult.error, expectedErrorMessage);
		} else {
			assert.fail("Result is not an Err");
		}
	};
}

test(
	'formatSinceDate() returns a Result Err when "since" is an empty string and "onlyYear" is true',
	testFormatSinceDateError({
		since: "",
		onlyYear: true,
		expectedErrorMessage: 'Since "" is not a valid date',
	}),
);

test(
	'formatSinceDate() returns a Result Err when "since" is an empty string and "onlyYear" is false',
	testFormatSinceDateError({
		since: "",
		onlyYear: false,
		expectedErrorMessage: 'Since "" is not a valid date',
	}),
);

test(
	'formatSinceDate() returns a Result Err when "since" is an invalid string and "onlyYear" is true',
	testFormatSinceDateError({
		since: "foo",
		onlyYear: true,
		expectedErrorMessage: 'Since "foo" is not a valid date',
	}),
);

test(
	'formatSinceDate() returns a Result Err when "since" is an invalid string and "onlyYear" is false',
	testFormatSinceDateError({
		since: "foo",
		onlyYear: false,
		expectedErrorMessage: 'Since "foo" is not a valid date',
	}),
);

interface TestFormatSinceDateOkOptions {
	readonly since: string;
	readonly onlyYear: boolean;
	readonly expectedFormatResult: string;
}

function testFormatSinceDateOk(testOptions: TestFormatSinceDateOkOptions): () => void {
	const { since, onlyYear, expectedFormatResult } = testOptions;

	return () => {
		const formattedDateResult = formatSinceDate(since, onlyYear);

		if (formattedDateResult.isOk) {
			assert.strictEqual(formattedDateResult.value, expectedFormatResult);
		} else {
			assert.fail("Result is not an Ok");
		}
	};
}

test(
	"formatSinceDate() returns a Result Ok with only the year",
	testFormatSinceDateOk({
		since: "2022-01-01",
		onlyYear: true,
		expectedFormatResult: "2022",
	}),
);

test(
	"formatSinceDate() returns a Result Ok with the year and full month",
	testFormatSinceDateOk({
		since: "2022-01-01",
		onlyYear: false,
		expectedFormatResult: "January 2022",
	}),
);
