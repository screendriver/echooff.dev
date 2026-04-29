import { describe, expect, it } from "vitest";
import {
	createAbsoluteAssetUrl,
	createBlogIndexAbsoluteUrl,
	createBlogPostAbsoluteUrl,
	createBlogRssFeedAbsoluteUrl,
	createBlogTopicAbsoluteUrl,
	createBlogTopicIndexAbsoluteUrl,
	createBlogTopicPath,
	createWebmentionEndpointUrl,
	createSiteHomeAbsoluteUrl,
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
		}).toThrow("Astro.site must be configured to create absolute blog URLs");
	});
});

describe("createBlogIndexAbsoluteUrl()", () => {
	it("creates the absolute blog index URL", () => {
		expect(createBlogIndexAbsoluteUrl(new URL("https://www.echooff.dev"))).toBe("https://www.echooff.dev/blog");
	});
});

describe("createSiteHomeAbsoluteUrl()", () => {
	it("creates the absolute site home URL", () => {
		expect(createSiteHomeAbsoluteUrl(new URL("https://www.echooff.dev"))).toBe("https://www.echooff.dev/");
	});
});

describe("createBlogPostAbsoluteUrl()", () => {
	it("creates the absolute URL for a blog post", () => {
		expect(createBlogPostAbsoluteUrl(new URL("https://www.echooff.dev"), "why-i-started-this-blog")).toBe(
			"https://www.echooff.dev/blog/why-i-started-this-blog"
		);
	});
});

describe("createBlogTopicIndexAbsoluteUrl()", () => {
	it("creates the absolute URL for the blog topic index", () => {
		expect(createBlogTopicIndexAbsoluteUrl(new URL("https://www.echooff.dev"))).toBe(
			"https://www.echooff.dev/blog/topics"
		);
	});
});

describe("createBlogTopicPath()", () => {
	it("creates the root-relative path for a blog topic archive", () => {
		expect(createBlogTopicPath("architecture")).toBe("/blog/topics/architecture");
	});
});

describe("createBlogTopicAbsoluteUrl()", () => {
	it("creates the absolute URL for a blog topic archive", () => {
		expect(createBlogTopicAbsoluteUrl(new URL("https://www.echooff.dev"), "typescript")).toBe(
			"https://www.echooff.dev/blog/topics/typescript"
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

describe("createWebmentionEndpointUrl()", () => {
	it("creates the webmention.io endpoint URL for the configured site host", () => {
		expect(createWebmentionEndpointUrl(new URL("https://www.echooff.dev"))).toBe(
			"https://webmention.io/www.echooff.dev/webmention"
		);
	});
});
