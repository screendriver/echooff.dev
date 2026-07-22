import assert from "node:assert";
import { getRssString } from "@astrojs/rss";
import { suite, test } from "mocha";
import { err, isErr, ok } from "true-myth/result";
import { createBlogPostCollectionEntry } from "./blog-post-test-fixture.ts";
import { createBlogRssFeedOptions } from "./blog-rss-feed.ts";

suite("createBlogRssFeedOptions()", function () {
	test("creates RSS feed options from posts sorted by publication date descending", function () {
		const configuredSiteUrl = new URL("https://example.com");
		const actualRssFeedOptionsResult = createBlogRssFeedOptions(
			[
				createBlogPostCollectionEntry({
					description: "Older post",
					id: "older-post",
					title: "Older post",
					publishedAt: "2026-01-01T10:00:00+01:00",
					updatedAt: "2026-07-21T15:59:00+02:00",
					topic: "Writing"
				}),
				createBlogPostCollectionEntry({
					description: "Newer post",
					id: "newer-post",
					title: "Newer post",
					publishedAt: "2026-02-01T10:00:00+01:00",
					topic: "Writing"
				})
			],
			configuredSiteUrl
		);
		const expectedRssFeedOptionsResult = ok({
			title: "Christian Rackerseder | Blog",
			description: "Notes on web technologies, engineering tradeoffs, and front-end architecture.",
			site: configuredSiteUrl,
			trailingSlash: false,
			xmlns: {
				atom: "http://www.w3.org/2005/Atom"
			},
			items: [
				{
					title: "Newer post",
					description: "Newer post",
					link: "https://example.com/blog/newer-post",
					pubDate: new Date("2026-02-01T10:00:00+01:00")
				},
				{
					title: "Older post",
					description: "Older post",
					link: "https://example.com/blog/older-post",
					pubDate: new Date("2026-01-01T10:00:00+01:00"),
					customData: "<atom:updated>2026-07-21T15:59:00+02:00</atom:updated>"
				}
			]
		});

		assert.deepStrictEqual(actualRssFeedOptionsResult, expectedRssFeedOptionsResult);
	});

	test("renders Atom metadata while preserving the publication date and permalink GUID", async function () {
		const configuredSiteUrl = new URL("https://example.com");
		const actualRssFeedOptionsResult = createBlogRssFeedOptions(
			[
				createBlogPostCollectionEntry({
					description: "Why I started writing on example.com",
					id: "why-i-started-this-blog",
					title: "Why I started this Blog",
					publishedAt: "2026-02-28T12:39:00+01:00",
					updatedAt: "2026-07-21T15:59:00+02:00",
					topic: "Writing"
				})
			],
			configuredSiteUrl
		);

		if (isErr(actualRssFeedOptionsResult)) {
			throw actualRssFeedOptionsResult.error;
		}

		const actualRssXml = await getRssString(actualRssFeedOptionsResult.value);

		assert.match(actualRssXml, /xmlns:atom="http:\/\/www\.w3\.org\/2005\/Atom"/);
		assert.match(actualRssXml, /<pubDate>Sat, 28 Feb 2026 11:39:00 GMT<\/pubDate>/);
		assert.match(
			actualRssXml,
			/<guid isPermaLink="true">https:\/\/example\.com\/blog\/why-i-started-this-blog<\/guid>/
		);
		assert.match(actualRssXml, /<atom:updated>2026-07-21T15:59:00\+02:00<\/atom:updated>/);
	});

	test("returns an error when a blog post update timestamp is invalid", function () {
		const actualRssFeedOptionsResult = createBlogRssFeedOptions(
			[
				createBlogPostCollectionEntry({
					description: "Broken blog post",
					id: "broken",
					title: "Broken",
					publishedAt: "2026-02-28T12:39:00+01:00",
					updatedAt: "not-a-date",
					topic: "Writing"
				})
			],
			new URL("https://example.com")
		);

		assert.deepStrictEqual(
			actualRssFeedOptionsResult,
			err(new TypeError('Updated at "not-a-date" is not a valid ISO 8601 date-time'))
		);
	});

	test("throws when Astro.site is not configured", function () {
		const actualOperation = (): void => {
			createBlogRssFeedOptions([], undefined);
		};
		const expectedErrorMessage = "Astro.site must be configured to create absolute blog URLs";

		assert.throws(actualOperation, { message: expectedErrorMessage });
	});
});
