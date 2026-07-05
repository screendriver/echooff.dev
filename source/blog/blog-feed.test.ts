import assert from "node:assert";
import { suite, test } from "mocha";
import { createRssFeedItemsForBlogPosts } from "./blog-feed.ts";
import { createBlogPostCollectionEntry } from "./blog-post-test-fixture.ts";

suite("createRssFeedItemsForBlogPosts()", function () {
	test("creates RSS feed items for blog posts", function () {
		const actualRssFeedItems = createRssFeedItemsForBlogPosts(
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
		const expectedRssFeedItems = [
			{
				title: "Why I started this Blog",
				description: "Why I started writing on example.com",
				link: "https://example.com/blog/why-i-started-this-blog",
				pubDate: new Date("2026-02-28T12:39:00+01:00")
			}
		];

		assert.deepStrictEqual(actualRssFeedItems, expectedRssFeedItems);
	});

	test("throws when a blog post publication timestamp is invalid", function () {
		const actualCreateFeedOperation = (): void => {
			createRssFeedItemsForBlogPosts(
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
		};
		const expectedErrorMessage = 'Published at "not-a-date" is not a valid ISO 8601 date-time';

		assert.throws(actualCreateFeedOperation, { message: expectedErrorMessage });
	});
});
