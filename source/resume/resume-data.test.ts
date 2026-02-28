import { assert, describe, expect, it } from "vitest";
import { parseResumeData } from "./resume-data.js";

describe("resume data parsing", () => {
	it("returns parsed resume data and strips undeclared keys", () => {
		const parseResult = parseResumeData([
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

		assert.ok(parseResult.isOk);

		expect(parseResult.value).toStrictEqual([
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
		]);
	});

	it("returns an error summary for invalid resume data", () => {
		const parseResult = parseResumeData([]);

		assert.ok(parseResult.isErr);

		expect(parseResult.error).toBe("must be non-empty");
	});
});
