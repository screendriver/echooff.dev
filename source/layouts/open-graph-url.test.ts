import { describe, expect, it } from "vitest";
import { resolveOpenGraphUrl } from "./open-graph-url.ts";

describe("resolveOpenGraphUrl()", () => {
	it("returns openGraphUrl when it is provided", () => {
		const actualOpenGraphUrl = resolveOpenGraphUrl({
			canonicalUrl: "https://www.example.com/",
			defaultOpenGraphUrl: "https://www.example.com/index.html",
			openGraphUrl: "https://www.example.com/blog"
		});
		const expectedOpenGraphUrl = "https://www.example.com/blog";

		expect(actualOpenGraphUrl).toBe(expectedOpenGraphUrl);
	});

	it("returns canonicalUrl when openGraphUrl is not provided", () => {
		const actualOpenGraphUrl = resolveOpenGraphUrl({
			canonicalUrl: "https://www.example.com/",
			defaultOpenGraphUrl: "https://www.example.com/index.html",
			openGraphUrl: undefined
		});
		const expectedOpenGraphUrl = "https://www.example.com/";

		expect(actualOpenGraphUrl).toBe(expectedOpenGraphUrl);
	});

	it("returns defaultOpenGraphUrl when neither openGraphUrl nor canonicalUrl is provided", () => {
		const actualOpenGraphUrl = resolveOpenGraphUrl({
			canonicalUrl: undefined,
			defaultOpenGraphUrl: "https://www.example.com/index.html",
			openGraphUrl: undefined
		});
		const expectedOpenGraphUrl = "https://www.example.com/index.html";

		expect(actualOpenGraphUrl).toBe(expectedOpenGraphUrl);
	});
});
