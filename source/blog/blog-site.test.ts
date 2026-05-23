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

describe("createBlogIndexPagePath()", () => {
	it("returns the root-relative blog index path for the first page", () => {
		expect(createBlogIndexPagePath(1)).toStrictEqual(ok("/blog"));
	});

	it("returns the root-relative paginated blog index path for later pages", () => {
		expect(createBlogIndexPagePath(2)).toStrictEqual(ok("/blog/page/2"));
	});

	it("returns a Result Err when the page number is not a positive integer", () => {
		expect(createBlogIndexPagePath(0)).toStrictEqual(
			err(new RangeError('Blog index page number must be a positive integer, received "0"'))
		);

		expect(createBlogIndexPagePath(1.5)).toStrictEqual(
			err(new RangeError('Blog index page number must be a positive integer, received "1.5"'))
		);
	});
});

describe("createBlogIndexPageAbsoluteUrl()", () => {
	it("creates the absolute URL for the first blog index page", () => {
		expect(createBlogIndexPageAbsoluteUrl(new URL("https://www.echooff.dev"), 1)).toStrictEqual(
			ok("https://www.echooff.dev/blog")
		);
	});

	it("creates the absolute URL for later blog index pages", () => {
		expect(createBlogIndexPageAbsoluteUrl(new URL("https://www.echooff.dev"), 3)).toStrictEqual(
			ok("https://www.echooff.dev/blog/page/3")
		);
	});

	it("propagates invalid blog index page numbers as a Result Err", () => {
		expect(createBlogIndexPageAbsoluteUrl(new URL("https://www.echooff.dev"), 0)).toStrictEqual(
			err(new RangeError('Blog index page number must be a positive integer, received "0"'))
		);
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
