import { describe, expect, it } from "vitest";
import type { CollectionEntry } from "astro:content";
import { createRssFeedItemsForBlogPosts } from "./blog-feed.js";

type BlogPostCollectionEntryInput = {
	readonly description: string;
	readonly id: string;
	readonly title: string;
	readonly publishedAt: string;
};

function createBlogPostCollectionEntry(input: BlogPostCollectionEntryInput): CollectionEntry<"blog"> {
	return {
		id: input.id,
		collection: "blog",
		data: {
			description: input.description,
			title: input.title,
			publishedAt: input.publishedAt
		},
		body: ""
	};
}

describe("createRssFeedItemsForBlogPosts()", () => {
	it("creates RSS feed items for blog posts", () => {
		const rssFeedItems = createRssFeedItemsForBlogPosts(
			[
				createBlogPostCollectionEntry({
					description: "Why I started writing on echooff.dev",
					id: "why-i-started-this-blog",
					title: "Why I started this Blog",
					publishedAt: "2026-02-28T12:39:00+01:00"
				})
			],
			new URL("https://www.echooff.dev")
		);

		expect(rssFeedItems).toStrictEqual([
			{
				title: "Why I started this Blog",
				description: "Why I started writing on echooff.dev",
				link: "https://www.echooff.dev/blog/why-i-started-this-blog",
				pubDate: new Date("2026-02-28T12:39:00+01:00")
			}
		]);
	});

	it("throws when a blog post publication timestamp is invalid", () => {
		expect(() => {
			createRssFeedItemsForBlogPosts(
				[
					createBlogPostCollectionEntry({
						description: "Broken blog post",
						id: "broken",
						title: "Broken",
						publishedAt: "not-a-date"
					})
				],
				new URL("https://www.echooff.dev")
			);
		}).toThrowError('Published at "not-a-date" is not a valid ISO 8601 date-time');
	});
});
