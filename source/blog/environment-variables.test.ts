import { describe, expect, it } from "vitest";
import { webmentionApiBaseUrlInputSchema } from "./environment-variable-input-schema.js";
import { parseWebmentionApiBaseUrl } from "./environment-variables.js";

describe("webmention API base URL schema", () => {
	it("does not allow booleans", () => {
		expect(() => {
			webmentionApiBaseUrlInputSchema.assert(true);
		}).toThrow("must be a string (was boolean)");
	});

	it("does not allow numbers", () => {
		expect(() => {
			webmentionApiBaseUrlInputSchema.assert(42);
		}).toThrow("must be a string (was a number)");
	});

	it("does not allow empty strings", () => {
		expect(() => {
			webmentionApiBaseUrlInputSchema.assert("");
		}).toThrow('must be a URL string (was "")');
	});

	it("does not allow strings that are not a URL", () => {
		expect(() => {
			webmentionApiBaseUrlInputSchema.assert("foo");
		}).toThrow('must be a URL string (was "foo")');
	});

	it("allows a string URL", () => {
		const webmentionApiBaseUrl = webmentionApiBaseUrlInputSchema.assert("https://webmention.io");

		expect(webmentionApiBaseUrl).toBe("https://webmention.io");
	});

	it("parses a string URL into a URL instance", () => {
		const webmentionApiBaseUrl = parseWebmentionApiBaseUrl("https://webmention.io");

		expect(webmentionApiBaseUrl.toString()).toStrictEqual(new URL("https://webmention.io").toString());
	});
});
