import { describe, expect, it } from "vitest";
import { hackerNewsApiUrlInputSchema, webmentionApiUrlInputSchema } from "./environment-variable-input-schema.ts";
import {
	defaultHackerNewsApiUrl,
	defaultWebmentionApiUrl,
	parseHackerNewsApiUrl,
	parseRuntimeHackerNewsApiUrl,
	parseRuntimeWebmentionApiUrl,
	parseWebmentionApiUrl
} from "./environment-variables.ts";

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
		const expectedParsedHackerNewsApiUrl = new URL("https://hn.algolia.com/api/v1/search_by_date");
		const actualHackerNewsApiUrl = hackerNewsApiUrl.href;
		const expectedHackerNewsApiUrl = expectedParsedHackerNewsApiUrl.href;

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
		const expectedParsedWebmentionApiUrl = new URL("https://webmention.io/api/mentions.jf2");
		const actualWebmentionApiUrl = webmentionApiUrl.href;
		const expectedWebmentionApiUrl = expectedParsedWebmentionApiUrl.href;

		expect(actualWebmentionApiUrl).toStrictEqual(expectedWebmentionApiUrl);
	});
});

describe("parseRuntimeHackerNewsApiUrl()", () => {
	it("uses the default Hacker News API URL when the runtime environment does not define one", () => {
		const actualHackerNewsApiUrl = parseRuntimeHackerNewsApiUrl({}).href;
		const expectedParsedHackerNewsApiUrl = new URL(defaultHackerNewsApiUrl);
		const expectedHackerNewsApiUrl = expectedParsedHackerNewsApiUrl.href;

		expect(actualHackerNewsApiUrl).toBe(expectedHackerNewsApiUrl);
	});

	it("uses the runtime Hacker News API URL when the runtime environment defines one", () => {
		const actualHackerNewsApiUrl = parseRuntimeHackerNewsApiUrl({
			HACKER_NEWS_API_URL: "http://127.0.0.1:4321/hacker-news"
		}).href;
		const expectedHackerNewsApiUrl = "http://127.0.0.1:4321/hacker-news";

		expect(actualHackerNewsApiUrl).toBe(expectedHackerNewsApiUrl);
	});

	it("rejects invalid runtime Hacker News API URLs", () => {
		const actualParseOperation = (): void => {
			parseRuntimeHackerNewsApiUrl({
				HACKER_NEWS_API_URL: "not a url"
			});
		};
		const expectedErrorMessage = 'HACKER_NEWS_API_URL must be a URL string (was "not a url")';

		expect(actualParseOperation).toThrow(expectedErrorMessage);
	});
});

describe("parseRuntimeWebmentionApiUrl()", () => {
	it("uses the default Webmention API URL when the runtime environment does not define one", () => {
		const actualWebmentionApiUrl = parseRuntimeWebmentionApiUrl({}).href;
		const expectedParsedWebmentionApiUrl = new URL(defaultWebmentionApiUrl);
		const expectedWebmentionApiUrl = expectedParsedWebmentionApiUrl.href;

		expect(actualWebmentionApiUrl).toBe(expectedWebmentionApiUrl);
	});

	it("uses the runtime Webmention API URL when the runtime environment defines one", () => {
		const actualWebmentionApiUrl = parseRuntimeWebmentionApiUrl({
			WEBMENTION_API_URL: "http://127.0.0.1:4321/webmentions"
		}).href;
		const expectedWebmentionApiUrl = "http://127.0.0.1:4321/webmentions";

		expect(actualWebmentionApiUrl).toBe(expectedWebmentionApiUrl);
	});

	it("rejects invalid runtime Webmention API URLs", () => {
		const actualParseOperation = (): void => {
			parseRuntimeWebmentionApiUrl({
				WEBMENTION_API_URL: "not a url"
			});
		};
		const expectedErrorMessage = 'WEBMENTION_API_URL must be a URL string (was "not a url")';

		expect(actualParseOperation).toThrow(expectedErrorMessage);
	});
});
