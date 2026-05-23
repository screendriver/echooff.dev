import { assert, describe, expect, it } from "vitest";
import { isErr, isOk } from "true-myth/result";
import { parseResumeData } from "./resume-data.ts";

describe("resume data parsing", () => {
	it("returns parsed resume data and strips undeclared keys", () => {
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

		expect(actualResumeData).toStrictEqual(expectedResumeData);
	});

	it("returns an error summary for invalid resume data", () => {
		const actualParseResult = parseResumeData([]);
		const expectedErrorMessage = "must be non-empty";
		const expectedErrorType = TypeError;

		const actualIsErrResult = isErr(actualParseResult);

		assert.ok(actualIsErrResult);
		const actualError = actualParseResult.error;
		const actualErrorMessage = actualError.message;
		const actualErrorType = actualError;

		expect(actualErrorMessage).toBe(expectedErrorMessage);
		expect(actualErrorType).toBeInstanceOf(expectedErrorType);
	});
});
