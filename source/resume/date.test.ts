import assert from "node:assert";
import { suite, test } from "mocha";
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

function testFormatSinceDateError(input: TestFormatSinceDateErrorInput): () => void {
	return function () {
		const { since, onlyYear, expectedErrorMessage, expectedErrorType } = input;
		const actualFormattedDateResult = formatSinceDate(since, onlyYear);

		assert.ok(isErr(actualFormattedDateResult));

		const actualError = actualFormattedDateResult.error;
		const actualErrorMessage = actualError.message;
		const actualErrorType = actualError;

		assert.strictEqual(actualErrorMessage, expectedErrorMessage);
		assert.ok(actualErrorType instanceof expectedErrorType);
	};
}

function testFormatSinceDateOk(input: TestFormatSinceDateOkInput): () => void {
	return function () {
		const { since, onlyYear, expectedFormatResult } = input;
		const actualFormattedDateResult = formatSinceDate(since, onlyYear);

		assert.ok(isOk(actualFormattedDateResult));

		const actualFormatResult = actualFormattedDateResult.value;

		assert.strictEqual(actualFormatResult, expectedFormatResult);
	};
}

suite("formatSinceDate()", function () {
	test(
		"returns a Result Err for empty since and onlyYear true",
		testFormatSinceDateError({
			since: "",
			onlyYear: true,
			expectedErrorMessage: 'Since "" is not a valid date',
			expectedErrorType: RangeError
		})
	);

	test(
		"returns a Result Err for empty since and onlyYear false",
		testFormatSinceDateError({
			since: "",
			onlyYear: false,
			expectedErrorMessage: 'Since "" is not a valid date',
			expectedErrorType: RangeError
		})
	);

	test(
		"returns a Result Err for invalid since and onlyYear true",
		testFormatSinceDateError({
			since: "foo",
			onlyYear: true,
			expectedErrorMessage: 'Since "foo" is not a valid date',
			expectedErrorType: RangeError
		})
	);

	test(
		"returns a Result Err for invalid since and onlyYear false",
		testFormatSinceDateError({
			since: "foo",
			onlyYear: false,
			expectedErrorMessage: 'Since "foo" is not a valid date',
			expectedErrorType: RangeError
		})
	);

	test(
		"returns a Result Ok when onlyYear is true",
		testFormatSinceDateOk({
			since: "2022-01-01",
			onlyYear: true,
			expectedFormatResult: "2022"
		})
	);

	test(
		"returns a Result Ok when onlyYear is false",
		testFormatSinceDateOk({
			since: "2022-01-01",
			onlyYear: false,
			expectedFormatResult: "January 2022"
		})
	);
});
