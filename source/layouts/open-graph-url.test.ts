import assert from "node:assert";
import { suite, test } from "mocha";
import { resolveOpenGraphUrl } from "./open-graph-url.ts";

suite("resolveOpenGraphUrl()", function () {
	test("returns openGraphUrl when it is provided", function () {
		const actualOpenGraphUrl = resolveOpenGraphUrl({
			canonicalUrl: "https://www.example.com/",
			defaultOpenGraphUrl: "https://www.example.com/index.html",
			openGraphUrl: "https://www.example.com/blog"
		});
		const expectedOpenGraphUrl = "https://www.example.com/blog";

		assert.strictEqual(actualOpenGraphUrl, expectedOpenGraphUrl);
	});

	test("returns canonicalUrl when openGraphUrl is not provided", function () {
		const actualOpenGraphUrl = resolveOpenGraphUrl({
			canonicalUrl: "https://www.example.com/",
			defaultOpenGraphUrl: "https://www.example.com/index.html",
			openGraphUrl: undefined
		});
		const expectedOpenGraphUrl = "https://www.example.com/";

		assert.strictEqual(actualOpenGraphUrl, expectedOpenGraphUrl);
	});

	test("returns defaultOpenGraphUrl when neither openGraphUrl nor canonicalUrl is provided", function () {
		const actualOpenGraphUrl = resolveOpenGraphUrl({
			canonicalUrl: undefined,
			defaultOpenGraphUrl: "https://www.example.com/index.html",
			openGraphUrl: undefined
		});
		const expectedOpenGraphUrl = "https://www.example.com/index.html";

		assert.strictEqual(actualOpenGraphUrl, expectedOpenGraphUrl);
	});
});
