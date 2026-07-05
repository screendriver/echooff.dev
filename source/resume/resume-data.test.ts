import assert from "node:assert";
import { suite, test } from "mocha";
import { isErr, isOk } from "true-myth/result";
import { parseResumeData } from "./resume-data.ts";

suite("resume data parsing", function () {
	test("returns parsed resume data and strips undeclared keys", function () {
		const actualParseResult = parseResumeData([
			{
				since: "2024-01-01",
				showOnlyYear: false,
				industry: "Software",
				jobTitle: "Staff Engineer",
				jobDescription: "Builds reliable systems.",
				company: {
					name: "Example",
					url: "https://example.com",
					extraCompanyProperty: "ignored"
				},
				extraResumeProperty: "ignored"
			}
		]);

		const actualIsOkResult = isOk(actualParseResult);

		assert.ok(actualIsOkResult);
		const actualResumeData = actualParseResult.value;
		const expectedResumeData = [
			{
				since: "2024-01-01",
				showOnlyYear: false,
				industry: "Software",
				jobTitle: "Staff Engineer",
				jobDescription: "Builds reliable systems.",
				company: {
					name: "Example",
					url: new URL("https://example.com")
				}
			}
		];

		assert.deepStrictEqual(actualResumeData, expectedResumeData);
	});

	test("returns an error summary for invalid resume data", function () {
		const actualParseResult = parseResumeData([]);
		const expectedErrorMessage = "must be non-empty";
		const expectedErrorType = TypeError;

		const actualIsErrResult = isErr(actualParseResult);

		assert.ok(actualIsErrResult);
		const actualError = actualParseResult.error;
		const actualErrorMessage = actualError.message;
		const actualErrorType = actualError;

		assert.strictEqual(actualErrorMessage, expectedErrorMessage);
		assert.ok(actualErrorType instanceof expectedErrorType);
	});
});
