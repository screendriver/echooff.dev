import { describe, expect, it } from "vitest";
import { err, ok } from "true-myth/result";
import {
	createAbsoluteAssetUrl,
	createBlogIndexAbsoluteUrl,
	createBlogIndexPageAbsoluteUrl,
	createBlogIndexPagePath,
	createBlogPostAbsoluteUrl,
	createBlogRssFeedAbsoluteUrl,
	createBlogTopicAbsoluteUrl,
	createBlogTopicIndexAbsoluteUrl,
	createBlogTopicPath,
	createWebmentionEndpointUrl,
	createSiteHomeAbsoluteUrl,
	getConfiguredSiteUrlOrThrow
} from "./blog-site.ts";

describe("getConfiguredSiteUrlOrThrow()", () => {
	it("returns the configured site URL", () => {
		const configuredSiteUrl = new URL("https://example.com");
		const actualConfiguredSiteUrl = getConfiguredSiteUrlOrThrow(configuredSiteUrl);
		const expectedConfiguredSiteUrl = configuredSiteUrl;

		expect(actualConfiguredSiteUrl).toStrictEqual(expectedConfiguredSiteUrl);
	});

	it("throws when Astro.site is not configured", () => {
		const actualOperation = (): void => {
			getConfiguredSiteUrlOrThrow(undefined);
		};
		const expectedErrorMessage = "Astro.site must be configured to create absolute blog URLs";

		expect(actualOperation).toThrow(expectedErrorMessage);
	});
});

describe("createBlogIndexAbsoluteUrl()", () => {
	it("creates the absolute blog index URL", () => {
		const actualBlogIndexAbsoluteUrl = createBlogIndexAbsoluteUrl(new URL("https://example.com"));
		const expectedBlogIndexAbsoluteUrl = "https://example.com/blog";

		expect(actualBlogIndexAbsoluteUrl).toBe(expectedBlogIndexAbsoluteUrl);
	});
});

describe("createBlogIndexPagePath()", () => {
	it("returns the root-relative blog index path for the first page", () => {
		const actualBlogIndexPagePath = createBlogIndexPagePath(1);
		const expectedBlogIndexPagePath = ok("/blog");

		expect(actualBlogIndexPagePath).toStrictEqual(expectedBlogIndexPagePath);
	});

	it("returns the root-relative paginated blog index path for later pages", () => {
		const actualBlogIndexPagePath = createBlogIndexPagePath(2);
		const expectedBlogIndexPagePath = ok("/blog/page/2");

		expect(actualBlogIndexPagePath).toStrictEqual(expectedBlogIndexPagePath);
	});

	it("returns a Result Err when the page number is not a positive integer", () => {
		const actualZeroPagePath = createBlogIndexPagePath(0);
		const expectedZeroPagePath = err(
			new RangeError('Blog index page number must be a positive integer, received "0"')
		);
		const actualFractionalPagePath = createBlogIndexPagePath(1.5);
		const expectedFractionalPagePath = err(
			new RangeError('Blog index page number must be a positive integer, received "1.5"')
		);

		expect(actualZeroPagePath).toStrictEqual(expectedZeroPagePath);
		expect(actualFractionalPagePath).toStrictEqual(expectedFractionalPagePath);
	});
});

describe("createBlogIndexPageAbsoluteUrl()", () => {
	it("creates the absolute URL for the first blog index page", () => {
		const actualBlogIndexPageAbsoluteUrl = createBlogIndexPageAbsoluteUrl(new URL("https://example.com"), 1);
		const expectedBlogIndexPageAbsoluteUrl = ok("https://example.com/blog");

		expect(actualBlogIndexPageAbsoluteUrl).toStrictEqual(expectedBlogIndexPageAbsoluteUrl);
	});

	it("creates the absolute URL for later blog index pages", () => {
		const actualBlogIndexPageAbsoluteUrl = createBlogIndexPageAbsoluteUrl(new URL("https://example.com"), 3);
		const expectedBlogIndexPageAbsoluteUrl = ok("https://example.com/blog/page/3");

		expect(actualBlogIndexPageAbsoluteUrl).toStrictEqual(expectedBlogIndexPageAbsoluteUrl);
	});

	it("propagates invalid blog index page numbers as a Result Err", () => {
		const actualBlogIndexPageAbsoluteUrl = createBlogIndexPageAbsoluteUrl(new URL("https://example.com"), 0);
		const expectedBlogIndexPageAbsoluteUrl = err(
			new RangeError('Blog index page number must be a positive integer, received "0"')
		);

		expect(actualBlogIndexPageAbsoluteUrl).toStrictEqual(expectedBlogIndexPageAbsoluteUrl);
	});
});

describe("createSiteHomeAbsoluteUrl()", () => {
	it("creates the absolute site home URL", () => {
		const actualSiteHomeAbsoluteUrl = createSiteHomeAbsoluteUrl(new URL("https://example.com"));
		const expectedSiteHomeAbsoluteUrl = "https://example.com/";

		expect(actualSiteHomeAbsoluteUrl).toBe(expectedSiteHomeAbsoluteUrl);
	});
});

describe("createBlogPostAbsoluteUrl()", () => {
	it("creates the absolute URL for a blog post", () => {
		const actualBlogPostAbsoluteUrl = createBlogPostAbsoluteUrl(
			new URL("https://example.com"),
			"why-i-started-this-blog"
		);
		const expectedBlogPostAbsoluteUrl = "https://example.com/blog/why-i-started-this-blog";

		expect(actualBlogPostAbsoluteUrl).toBe(expectedBlogPostAbsoluteUrl);
	});
});

describe("createBlogTopicIndexAbsoluteUrl()", () => {
	it("creates the absolute URL for the blog topic index", () => {
		const actualBlogTopicIndexAbsoluteUrl = createBlogTopicIndexAbsoluteUrl(new URL("https://example.com"));
		const expectedBlogTopicIndexAbsoluteUrl = "https://example.com/blog/topics";

		expect(actualBlogTopicIndexAbsoluteUrl).toBe(expectedBlogTopicIndexAbsoluteUrl);
	});
});

describe("createBlogTopicPath()", () => {
	it("creates the root-relative path for a blog topic archive", () => {
		const actualBlogTopicPath = createBlogTopicPath("architecture");
		const expectedBlogTopicPath = "/blog/topics/architecture";

		expect(actualBlogTopicPath).toBe(expectedBlogTopicPath);
	});
});

describe("createBlogTopicAbsoluteUrl()", () => {
	it("creates the absolute URL for a blog topic archive", () => {
		const actualBlogTopicAbsoluteUrl = createBlogTopicAbsoluteUrl(new URL("https://example.com"), "typescript");
		const expectedBlogTopicAbsoluteUrl = "https://example.com/blog/topics/typescript";

		expect(actualBlogTopicAbsoluteUrl).toBe(expectedBlogTopicAbsoluteUrl);
	});
});

describe("createBlogRssFeedAbsoluteUrl()", () => {
	it("creates the absolute URL for the RSS feed", () => {
		const actualBlogRssFeedAbsoluteUrl = createBlogRssFeedAbsoluteUrl(new URL("https://example.com"));
		const expectedBlogRssFeedAbsoluteUrl = "https://example.com/rss.xml";

		expect(actualBlogRssFeedAbsoluteUrl).toBe(expectedBlogRssFeedAbsoluteUrl);
	});
});

describe("createAbsoluteAssetUrl()", () => {
	it("creates the absolute URL for an asset pathname", () => {
		const actualAbsoluteAssetUrl = createAbsoluteAssetUrl(new URL("https://example.com"), "/_astro/header.jpg");
		const expectedAbsoluteAssetUrl = "https://example.com/_astro/header.jpg";

		expect(actualAbsoluteAssetUrl).toBe(expectedAbsoluteAssetUrl);
	});
});

describe("createWebmentionEndpointUrl()", () => {
	it("creates the webmention.io endpoint URL for the configured site host", () => {
		const actualWebmentionEndpointUrl = createWebmentionEndpointUrl(new URL("https://example.com"));
		const expectedWebmentionEndpointUrl = "https://webmention.io/example.com/webmention";

		expect(actualWebmentionEndpointUrl).toBe(expectedWebmentionEndpointUrl);
	});
});
