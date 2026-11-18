import assert from "node:assert";
import { suite, test } from "mocha";
import { hackerNewsApiUrlInputSchema, webmentionApiUrlInputSchema } from "./environment-variable-input-schema.ts";
import {
	defaultHackerNewsApiUrl,
	defaultWebmentionApiUrl,
	parseHackerNewsApiUrl,
	parseRuntimeHackerNewsApiUrl,
	parseRuntimeWebmentionApiUrl,
	parseWebmentionApiUrl
} from "./environment-variables.ts";

type InputAssertionSchema = {
	readonly assert: (input: unknown) => unknown;
};

function assertInputSchemaValue(inputSchema: InputAssertionSchema, input: unknown): void {
	inputSchema.assert(input);
}

function parseInvalidRuntimeHackerNewsApiUrl(): void {
	parseRuntimeHackerNewsApiUrl({
		HACKER_NEWS_API_URL: "not a url"
	});
}

function parseInvalidRuntimeWebmentionApiUrl(): void {
	parseRuntimeWebmentionApiUrl({
		WEBMENTION_API_URL: "not a url"
	});
}

suite("hacker news API URL schema", function () {
	test("does not allow booleans", function () {
		const expectedErrorMessage = "must be a string (was boolean)";

		assert.throws(assertInputSchemaValue.bind(undefined, hackerNewsApiUrlInputSchema, true), {
			message: expectedErrorMessage
		});
	});

	test("does not allow numbers", function () {
		const expectedErrorMessage = "must be a string (was a number)";

		assert.throws(assertInputSchemaValue.bind(undefined, hackerNewsApiUrlInputSchema, 42), {
			message: expectedErrorMessage
		});
	});

	test("does not allow empty strings", function () {
		const expectedErrorMessage = 'must be a URL string (was "")';

		assert.throws(assertInputSchemaValue.bind(undefined, hackerNewsApiUrlInputSchema, ""), {
			message: expectedErrorMessage
		});
	});

	test("does not allow strings that are not a URL", function () {
		const expectedErrorMessage = 'must be a URL string (was "foo")';

		assert.throws(assertInputSchemaValue.bind(undefined, hackerNewsApiUrlInputSchema, "foo"), {
			message: expectedErrorMessage
		});
	});

	test("allows a string URL", function () {
		const actualHackerNewsApiUrl = hackerNewsApiUrlInputSchema.assert(
			"https://hn.algolia.com/api/v1/search_by_date"
		);
		const expectedHackerNewsApiUrl = "https://hn.algolia.com/api/v1/search_by_date";

		assert.strictEqual(actualHackerNewsApiUrl, expectedHackerNewsApiUrl);
	});

	test("parses a string URL into a URL instance", function () {
		const hackerNewsApiUrl = parseHackerNewsApiUrl("https://hn.algolia.com/api/v1/search_by_date");
		const expectedParsedHackerNewsApiUrl = new URL("https://hn.algolia.com/api/v1/search_by_date");
		const actualHackerNewsApiUrl = hackerNewsApiUrl.href;
		const expectedHackerNewsApiUrl = expectedParsedHackerNewsApiUrl.href;

		assert.deepStrictEqual(actualHackerNewsApiUrl, expectedHackerNewsApiUrl);
	});
});

suite("webmention API URL schema", function () {
	test("does not allow booleans", function () {
		const expectedErrorMessage = "must be a string (was boolean)";

		assert.throws(assertInputSchemaValue.bind(undefined, webmentionApiUrlInputSchema, true), {
			message: expectedErrorMessage
		});
	});

	test("does not allow numbers", function () {
		const expectedErrorMessage = "must be a string (was a number)";

		assert.throws(assertInputSchemaValue.bind(undefined, webmentionApiUrlInputSchema, 42), {
			message: expectedErrorMessage
		});
	});

	test("does not allow empty strings", function () {
		const expectedErrorMessage = 'must be a URL string (was "")';

		assert.throws(assertInputSchemaValue.bind(undefined, webmentionApiUrlInputSchema, ""), {
			message: expectedErrorMessage
		});
	});

	test("does not allow strings that are not a URL", function () {
		const expectedErrorMessage = 'must be a URL string (was "foo")';

		assert.throws(assertInputSchemaValue.bind(undefined, webmentionApiUrlInputSchema, "foo"), {
			message: expectedErrorMessage
		});
	});

	test("allows a string URL", function () {
		const actualWebmentionApiUrl = webmentionApiUrlInputSchema.assert("https://webmention.io/api/mentions.jf2");
		const expectedWebmentionApiUrl = "https://webmention.io/api/mentions.jf2";

		assert.strictEqual(actualWebmentionApiUrl, expectedWebmentionApiUrl);
	});

	test("parses a string URL into a URL instance", function () {
		const webmentionApiUrl = parseWebmentionApiUrl("https://webmention.io/api/mentions.jf2");
		const expectedParsedWebmentionApiUrl = new URL("https://webmention.io/api/mentions.jf2");
		const actualWebmentionApiUrl = webmentionApiUrl.href;
		const expectedWebmentionApiUrl = expectedParsedWebmentionApiUrl.href;

		assert.deepStrictEqual(actualWebmentionApiUrl, expectedWebmentionApiUrl);
	});
});

suite("parseRuntimeHackerNewsApiUrl()", function () {
	test("uses the default Hacker News API URL when the runtime environment does not define one", function () {
		const actualHackerNewsApiUrl = parseRuntimeHackerNewsApiUrl({}).href;
		const expectedParsedHackerNewsApiUrl = new URL(defaultHackerNewsApiUrl);
		const expectedHackerNewsApiUrl = expectedParsedHackerNewsApiUrl.href;

		assert.strictEqual(actualHackerNewsApiUrl, expectedHackerNewsApiUrl);
	});

	test("uses the runtime Hacker News API URL when the runtime environment defines one", function () {
		const actualHackerNewsApiUrl = parseRuntimeHackerNewsApiUrl({
			HACKER_NEWS_API_URL: "http://127.0.0.1:4321/hacker-news"
		}).href;
		const expectedHackerNewsApiUrl = "http://127.0.0.1:4321/hacker-news";

		assert.strictEqual(actualHackerNewsApiUrl, expectedHackerNewsApiUrl);
	});

	test("rejects invalid runtime Hacker News API URLs", function () {
		const expectedErrorMessage = 'HACKER_NEWS_API_URL must be a URL string (was "not a url")';

		assert.throws(parseInvalidRuntimeHackerNewsApiUrl, { message: expectedErrorMessage });
	});
});

suite("parseRuntimeWebmentionApiUrl()", function () {
	test("uses the default Webmention API URL when the runtime environment does not define one", function () {
		const actualWebmentionApiUrl = parseRuntimeWebmentionApiUrl({}).href;
		const expectedParsedWebmentionApiUrl = new URL(defaultWebmentionApiUrl);
		const expectedWebmentionApiUrl = expectedParsedWebmentionApiUrl.href;

		assert.strictEqual(actualWebmentionApiUrl, expectedWebmentionApiUrl);
	});

	test("uses the runtime Webmention API URL when the runtime environment defines one", function () {
		const actualWebmentionApiUrl = parseRuntimeWebmentionApiUrl({
			WEBMENTION_API_URL: "http://127.0.0.1:4321/webmentions"
		}).href;
		const expectedWebmentionApiUrl = "http://127.0.0.1:4321/webmentions";

		assert.strictEqual(actualWebmentionApiUrl, expectedWebmentionApiUrl);
	});

	test("rejects invalid runtime Webmention API URLs", function () {
		const expectedErrorMessage = 'WEBMENTION_API_URL must be a URL string (was "not a url")';

		assert.throws(parseInvalidRuntimeWebmentionApiUrl, { message: expectedErrorMessage });
	});
});
