import assert from "node:assert";
import { suite, test } from "mocha";
import { err, ok } from "true-myth/result";
import { createRssFeedItemsForBlogPosts } from "./blog-feed.ts";
import { createBlogPostCollectionEntry } from "./blog-post-test-fixture.ts";

suite("createRssFeedItemsForBlogPosts()", function () {
	test("creates RSS feed items for blog posts", function () {
		const actualRssFeedItemsResult = createRssFeedItemsForBlogPosts(
			[
				createBlogPostCollectionEntry({
					description: "Why I started writing on example.com",
					id: "why-i-started-this-blog",
					title: "Why I started this Blog",
					publishedAt: "2026-02-28T12:39:00+01:00",
					topic: "Writing"
				})
			],
			new URL("https://example.com")
		);
		const expectedRssFeedItemsResult = ok([
			{
				title: "Why I started this Blog",
				description: "Why I started writing on example.com",
				link: "https://example.com/blog/why-i-started-this-blog",
				pubDate: new Date("2026-02-28T12:39:00+01:00")
			}
		]);

		assert.deepStrictEqual(actualRssFeedItemsResult, expectedRssFeedItemsResult);
	});

	test("includes an updated timestamp as Atom custom data", function () {
		const actualRssFeedItemsResult = createRssFeedItemsForBlogPosts(
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
			new URL("https://example.com")
		);
		const expectedRssFeedItemsResult = ok([
			{
				title: "Why I started this Blog",
				description: "Why I started writing on example.com",
				link: "https://example.com/blog/why-i-started-this-blog",
				pubDate: new Date("2026-02-28T12:39:00+01:00"),
				customData: "<atom:updated>2026-07-21T15:59:00+02:00</atom:updated>"
			}
		]);

		assert.deepStrictEqual(actualRssFeedItemsResult, expectedRssFeedItemsResult);
	});

	test("returns an error when a blog post publication timestamp is invalid", function () {
		const actualRssFeedItemsResult = createRssFeedItemsForBlogPosts(
			[
				createBlogPostCollectionEntry({
					description: "Broken blog post",
					id: "broken",
					title: "Broken",
					publishedAt: "not-a-date",
					topic: "Writing"
				})
			],
			new URL("https://example.com")
		);
		const expectedErrorMessage = 'Published at "not-a-date" is not a valid ISO 8601 date-time';

		assert.deepStrictEqual(actualRssFeedItemsResult, err(new TypeError(expectedErrorMessage)));
	});

	test("returns an error when a blog post update timestamp is invalid", function () {
		const actualRssFeedItemsResult = createRssFeedItemsForBlogPosts(
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
		const expectedErrorMessage = 'Updated at "not-a-date" is not a valid ISO 8601 date-time';

		assert.deepStrictEqual(actualRssFeedItemsResult, err(new TypeError(expectedErrorMessage)));
	});
});
