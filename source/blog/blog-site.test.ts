import assert from "node:assert";
import { suite, test } from "mocha";
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

suite("getConfiguredSiteUrlOrThrow()", function () {
	test("returns the configured site URL", function () {
		const configuredSiteUrl = new URL("https://example.com");
		const actualConfiguredSiteUrl = getConfiguredSiteUrlOrThrow(configuredSiteUrl);
		const expectedConfiguredSiteUrl = configuredSiteUrl;

		assert.deepStrictEqual(actualConfiguredSiteUrl, expectedConfiguredSiteUrl);
	});

	test("throws when Astro.site is not configured", function () {
		const actualOperation = (): void => {
			getConfiguredSiteUrlOrThrow(undefined);
		};
		const expectedErrorMessage = "Astro.site must be configured to create absolute blog URLs";

		assert.throws(actualOperation, { message: expectedErrorMessage });
	});
});

suite("createBlogIndexAbsoluteUrl()", function () {
	test("creates the absolute blog index URL", function () {
		const actualBlogIndexAbsoluteUrl = createBlogIndexAbsoluteUrl(new URL("https://example.com"));
		const expectedBlogIndexAbsoluteUrl = "https://example.com/blog";

		assert.strictEqual(actualBlogIndexAbsoluteUrl, expectedBlogIndexAbsoluteUrl);
	});
});

suite("createBlogIndexPagePath()", function () {
	test("returns the root-relative blog index path for the first page", function () {
		const actualBlogIndexPagePath = createBlogIndexPagePath(1);
		const expectedBlogIndexPagePath = ok("/blog");

		assert.deepStrictEqual(actualBlogIndexPagePath, expectedBlogIndexPagePath);
	});

	test("returns the root-relative paginated blog index path for later pages", function () {
		const actualBlogIndexPagePath = createBlogIndexPagePath(2);
		const expectedBlogIndexPagePath = ok("/blog/page/2");

		assert.deepStrictEqual(actualBlogIndexPagePath, expectedBlogIndexPagePath);
	});

	test("returns a Result Err when the page number is not a positive integer", function () {
		const actualZeroPagePath = createBlogIndexPagePath(0);
		const expectedZeroPagePath = err(
			new RangeError('Blog index page number must be a positive integer, received "0"')
		);
		const actualFractionalPagePath = createBlogIndexPagePath(1.5);
		const expectedFractionalPagePath = err(
			new RangeError('Blog index page number must be a positive integer, received "1.5"')
		);

		assert.deepStrictEqual(actualZeroPagePath, expectedZeroPagePath);
		assert.deepStrictEqual(actualFractionalPagePath, expectedFractionalPagePath);
	});
});

suite("createBlogIndexPageAbsoluteUrl()", function () {
	test("creates the absolute URL for the first blog index page", function () {
		const actualBlogIndexPageAbsoluteUrl = createBlogIndexPageAbsoluteUrl(new URL("https://example.com"), 1);
		const expectedBlogIndexPageAbsoluteUrl = ok("https://example.com/blog");

		assert.deepStrictEqual(actualBlogIndexPageAbsoluteUrl, expectedBlogIndexPageAbsoluteUrl);
	});

	test("creates the absolute URL for later blog index pages", function () {
		const actualBlogIndexPageAbsoluteUrl = createBlogIndexPageAbsoluteUrl(new URL("https://example.com"), 3);
		const expectedBlogIndexPageAbsoluteUrl = ok("https://example.com/blog/page/3");

		assert.deepStrictEqual(actualBlogIndexPageAbsoluteUrl, expectedBlogIndexPageAbsoluteUrl);
	});

	test("propagates invalid blog index page numbers as a Result Err", function () {
		const actualBlogIndexPageAbsoluteUrl = createBlogIndexPageAbsoluteUrl(new URL("https://example.com"), 0);
		const expectedBlogIndexPageAbsoluteUrl = err(
			new RangeError('Blog index page number must be a positive integer, received "0"')
		);

		assert.deepStrictEqual(actualBlogIndexPageAbsoluteUrl, expectedBlogIndexPageAbsoluteUrl);
	});
});

suite("createSiteHomeAbsoluteUrl()", function () {
	test("creates the absolute site home URL", function () {
		const actualSiteHomeAbsoluteUrl = createSiteHomeAbsoluteUrl(new URL("https://example.com"));
		const expectedSiteHomeAbsoluteUrl = "https://example.com/";

		assert.strictEqual(actualSiteHomeAbsoluteUrl, expectedSiteHomeAbsoluteUrl);
	});
});

suite("createBlogPostAbsoluteUrl()", function () {
	test("creates the absolute URL for a blog post", function () {
		const actualBlogPostAbsoluteUrl = createBlogPostAbsoluteUrl(
			new URL("https://example.com"),
			"why-i-started-this-blog"
		);
		const expectedBlogPostAbsoluteUrl = "https://example.com/blog/why-i-started-this-blog";

		assert.strictEqual(actualBlogPostAbsoluteUrl, expectedBlogPostAbsoluteUrl);
	});
});

suite("createBlogTopicIndexAbsoluteUrl()", function () {
	test("creates the absolute URL for the blog topic index", function () {
		const actualBlogTopicIndexAbsoluteUrl = createBlogTopicIndexAbsoluteUrl(new URL("https://example.com"));
		const expectedBlogTopicIndexAbsoluteUrl = "https://example.com/blog/topics";

		assert.strictEqual(actualBlogTopicIndexAbsoluteUrl, expectedBlogTopicIndexAbsoluteUrl);
	});
});

suite("createBlogTopicPath()", function () {
	test("creates the root-relative path for a blog topic archive", function () {
		const actualBlogTopicPath = createBlogTopicPath("architecture");
		const expectedBlogTopicPath = "/blog/topics/architecture";

		assert.strictEqual(actualBlogTopicPath, expectedBlogTopicPath);
	});
});

suite("createBlogTopicAbsoluteUrl()", function () {
	test("creates the absolute URL for a blog topic archive", function () {
		const actualBlogTopicAbsoluteUrl = createBlogTopicAbsoluteUrl(new URL("https://example.com"), "typescript");
		const expectedBlogTopicAbsoluteUrl = "https://example.com/blog/topics/typescript";

		assert.strictEqual(actualBlogTopicAbsoluteUrl, expectedBlogTopicAbsoluteUrl);
	});
});

suite("createBlogRssFeedAbsoluteUrl()", function () {
	test("creates the absolute URL for the RSS feed", function () {
		const actualBlogRssFeedAbsoluteUrl = createBlogRssFeedAbsoluteUrl(new URL("https://example.com"));
		const expectedBlogRssFeedAbsoluteUrl = "https://example.com/rss.xml";

		assert.strictEqual(actualBlogRssFeedAbsoluteUrl, expectedBlogRssFeedAbsoluteUrl);
	});
});

suite("createAbsoluteAssetUrl()", function () {
	test("creates the absolute URL for an asset pathname", function () {
		const actualAbsoluteAssetUrl = createAbsoluteAssetUrl(new URL("https://example.com"), "/_astro/header.jpg");
		const expectedAbsoluteAssetUrl = "https://example.com/_astro/header.jpg";

		assert.strictEqual(actualAbsoluteAssetUrl, expectedAbsoluteAssetUrl);
	});
});

suite("createWebmentionEndpointUrl()", function () {
	test("creates the webmention.io endpoint URL for the configured site host", function () {
		const actualWebmentionEndpointUrl = createWebmentionEndpointUrl(new URL("https://example.com"));
		const expectedWebmentionEndpointUrl = "https://webmention.io/example.com/webmention";

		assert.strictEqual(actualWebmentionEndpointUrl, expectedWebmentionEndpointUrl);
	});
});
