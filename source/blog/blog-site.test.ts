import { describe, expect, it } from "vitest";
import {
	createAbsoluteAssetUrl,
	createBlogIndexAbsoluteUrl,
	createBlogPostAbsoluteUrl,
	createBlogRssFeedAbsoluteUrl,
	getConfiguredSiteUrlOrThrow
} from "./blog-site.js";

describe("getConfiguredSiteUrlOrThrow()", () => {
	it("returns the configured site URL", () => {
		const configuredSiteUrl = new URL("https://www.echooff.dev");

		expect(getConfiguredSiteUrlOrThrow(configuredSiteUrl)).toStrictEqual(configuredSiteUrl);
	});

	it("throws when Astro.site is not configured", () => {
		expect(() => {
			getConfiguredSiteUrlOrThrow(undefined);
		}).toThrowError("Astro.site must be configured to create absolute blog URLs");
	});
});

describe("createBlogIndexAbsoluteUrl()", () => {
	it("creates the absolute blog index URL", () => {
		expect(createBlogIndexAbsoluteUrl(new URL("https://www.echooff.dev"))).toBe("https://www.echooff.dev/blog");
	});
});

describe("createBlogPostAbsoluteUrl()", () => {
	it("creates the absolute URL for a blog post", () => {
		expect(createBlogPostAbsoluteUrl(new URL("https://www.echooff.dev"), "why-i-started-this-blog")).toBe(
			"https://www.echooff.dev/blog/why-i-started-this-blog"
		);
	});
});

describe("createBlogRssFeedAbsoluteUrl()", () => {
	it("creates the absolute URL for the RSS feed", () => {
		expect(createBlogRssFeedAbsoluteUrl(new URL("https://www.echooff.dev"))).toBe(
			"https://www.echooff.dev/rss.xml"
		);
	});
});

describe("createAbsoluteAssetUrl()", () => {
	it("creates the absolute URL for an asset pathname", () => {
		expect(createAbsoluteAssetUrl(new URL("https://www.echooff.dev"), "/_astro/header.jpg")).toBe(
			"https://www.echooff.dev/_astro/header.jpg"
		);
	});
});
