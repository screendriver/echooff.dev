import { describe, expect, it } from "vitest";
import { resolveOpenGraphUrl } from "./open-graph-url.js";

describe("resolveOpenGraphUrl()", () => {
	it("returns openGraphUrl when it is provided", () => {
		const resolvedOpenGraphUrl = resolveOpenGraphUrl({
			canonicalUrl: "https://www.example.com/",
			defaultOpenGraphUrl: "https://www.example.com/index.html",
			openGraphUrl: "https://www.example.com/blog"
		});

		expect(resolvedOpenGraphUrl).toBe("https://www.example.com/blog");
	});

	it("returns canonicalUrl when openGraphUrl is not provided", () => {
		const resolvedOpenGraphUrl = resolveOpenGraphUrl({
			canonicalUrl: "https://www.example.com/",
			defaultOpenGraphUrl: "https://www.example.com/index.html",
			openGraphUrl: undefined
		});

		expect(resolvedOpenGraphUrl).toBe("https://www.example.com/");
	});

	it("returns defaultOpenGraphUrl when neither openGraphUrl nor canonicalUrl is provided", () => {
		const resolvedOpenGraphUrl = resolveOpenGraphUrl({
			canonicalUrl: undefined,
			defaultOpenGraphUrl: "https://www.example.com/index.html",
			openGraphUrl: undefined
		});

		expect(resolvedOpenGraphUrl).toBe("https://www.example.com/index.html");
	});
});
