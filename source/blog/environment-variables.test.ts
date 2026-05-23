import { describe, expect, it } from "vitest";
import { hackerNewsApiUrlInputSchema, webmentionApiUrlInputSchema } from "./environment-variable-input-schema.ts";
import { parseHackerNewsApiUrl, parseWebmentionApiUrl } from "./environment-variables.ts";

describe("hacker news API URL schema", () => {
	it("does not allow booleans", () => {
		const actualAssertionOperation = (): void => {
			hackerNewsApiUrlInputSchema.assert(true);
		};
		const expectedErrorMessage = "must be a string (was boolean)";

		expect(actualAssertionOperation).toThrow(expectedErrorMessage);
	});

	it("does not allow numbers", () => {
		const actualAssertionOperation = (): void => {
			hackerNewsApiUrlInputSchema.assert(42);
		};
		const expectedErrorMessage = "must be a string (was a number)";

		expect(actualAssertionOperation).toThrow(expectedErrorMessage);
	});

	it("does not allow empty strings", () => {
		const actualAssertionOperation = (): void => {
			hackerNewsApiUrlInputSchema.assert("");
		};
		const expectedErrorMessage = 'must be a URL string (was "")';

		expect(actualAssertionOperation).toThrow(expectedErrorMessage);
	});

	it("does not allow strings that are not a URL", () => {
		const actualAssertionOperation = (): void => {
			hackerNewsApiUrlInputSchema.assert("foo");
		};
		const expectedErrorMessage = 'must be a URL string (was "foo")';

		expect(actualAssertionOperation).toThrow(expectedErrorMessage);
	});

	it("allows a string URL", () => {
		const actualHackerNewsApiUrl = hackerNewsApiUrlInputSchema.assert(
			"https://hn.algolia.com/api/v1/search_by_date"
		);
		const expectedHackerNewsApiUrl = "https://hn.algolia.com/api/v1/search_by_date";

		expect(actualHackerNewsApiUrl).toBe(expectedHackerNewsApiUrl);
	});

	it("parses a string URL into a URL instance", () => {
		const hackerNewsApiUrl = parseHackerNewsApiUrl("https://hn.algolia.com/api/v1/search_by_date");
		const actualHackerNewsApiUrl = hackerNewsApiUrl.toString();
		const expectedHackerNewsApiUrl = new URL("https://hn.algolia.com/api/v1/search_by_date").toString();

		expect(actualHackerNewsApiUrl).toStrictEqual(expectedHackerNewsApiUrl);
	});
});

describe("webmention API URL schema", () => {
	it("does not allow booleans", () => {
		const actualAssertionOperation = (): void => {
			webmentionApiUrlInputSchema.assert(true);
		};
		const expectedErrorMessage = "must be a string (was boolean)";

		expect(actualAssertionOperation).toThrow(expectedErrorMessage);
	});

	it("does not allow numbers", () => {
		const actualAssertionOperation = (): void => {
			webmentionApiUrlInputSchema.assert(42);
		};
		const expectedErrorMessage = "must be a string (was a number)";

		expect(actualAssertionOperation).toThrow(expectedErrorMessage);
	});

	it("does not allow empty strings", () => {
		const actualAssertionOperation = (): void => {
			webmentionApiUrlInputSchema.assert("");
		};
		const expectedErrorMessage = 'must be a URL string (was "")';

		expect(actualAssertionOperation).toThrow(expectedErrorMessage);
	});

	it("does not allow strings that are not a URL", () => {
		const actualAssertionOperation = (): void => {
			webmentionApiUrlInputSchema.assert("foo");
		};
		const expectedErrorMessage = 'must be a URL string (was "foo")';

		expect(actualAssertionOperation).toThrow(expectedErrorMessage);
	});

	it("allows a string URL", () => {
		const actualWebmentionApiUrl = webmentionApiUrlInputSchema.assert("https://webmention.io/api/mentions.jf2");
		const expectedWebmentionApiUrl = "https://webmention.io/api/mentions.jf2";

		expect(actualWebmentionApiUrl).toBe(expectedWebmentionApiUrl);
	});

	it("parses a string URL into a URL instance", () => {
		const webmentionApiUrl = parseWebmentionApiUrl("https://webmention.io/api/mentions.jf2");
		const actualWebmentionApiUrl = webmentionApiUrl.toString();
		const expectedWebmentionApiUrl = new URL("https://webmention.io/api/mentions.jf2").toString();

		expect(actualWebmentionApiUrl).toStrictEqual(expectedWebmentionApiUrl);
	});
});
