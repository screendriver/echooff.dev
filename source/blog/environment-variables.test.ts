import { describe, expect, it } from "vitest";
import {
	hackerNewsApiUrlInputSchema,
	webmentionApiUrlInputSchema
} from "./environment-variable-input-schema.js";
import { parseHackerNewsApiUrl, parseWebmentionApiUrl } from "./environment-variables.js";

describe("hacker news API URL schema", () => {
	it("does not allow booleans", () => {
		expect(() => {
			hackerNewsApiUrlInputSchema.assert(true);
		}).toThrow("must be a string (was boolean)");
	});

	it("does not allow numbers", () => {
		expect(() => {
			hackerNewsApiUrlInputSchema.assert(42);
		}).toThrow("must be a string (was a number)");
	});

	it("does not allow empty strings", () => {
		expect(() => {
			hackerNewsApiUrlInputSchema.assert("");
		}).toThrow('must be a URL string (was "")');
	});

	it("does not allow strings that are not a URL", () => {
		expect(() => {
			hackerNewsApiUrlInputSchema.assert("foo");
		}).toThrow('must be a URL string (was "foo")');
	});

	it("allows a string URL", () => {
		const hackerNewsApiUrl = hackerNewsApiUrlInputSchema.assert(
			"https://hn.algolia.com/api/v1/search_by_date"
		);

		expect(hackerNewsApiUrl).toBe("https://hn.algolia.com/api/v1/search_by_date");
	});

	it("parses a string URL into a URL instance", () => {
		const hackerNewsApiUrl = parseHackerNewsApiUrl("https://hn.algolia.com/api/v1/search_by_date");

		expect(hackerNewsApiUrl.toString()).toStrictEqual(
			new URL("https://hn.algolia.com/api/v1/search_by_date").toString()
		);
	});
});

describe("webmention API URL schema", () => {
	it("does not allow booleans", () => {
		expect(() => {
			webmentionApiUrlInputSchema.assert(true);
		}).toThrow("must be a string (was boolean)");
	});

	it("does not allow numbers", () => {
		expect(() => {
			webmentionApiUrlInputSchema.assert(42);
		}).toThrow("must be a string (was a number)");
	});

	it("does not allow empty strings", () => {
		expect(() => {
			webmentionApiUrlInputSchema.assert("");
		}).toThrow('must be a URL string (was "")');
	});

	it("does not allow strings that are not a URL", () => {
		expect(() => {
			webmentionApiUrlInputSchema.assert("foo");
		}).toThrow('must be a URL string (was "foo")');
	});

	it("allows a string URL", () => {
		const webmentionApiUrl = webmentionApiUrlInputSchema.assert("https://webmention.io/api/mentions.jf2");

		expect(webmentionApiUrl).toBe("https://webmention.io/api/mentions.jf2");
	});

	it("parses a string URL into a URL instance", () => {
		const webmentionApiUrl = parseWebmentionApiUrl("https://webmention.io/api/mentions.jf2");

		expect(webmentionApiUrl.toString()).toStrictEqual(new URL("https://webmention.io/api/mentions.jf2").toString());
	});
});
