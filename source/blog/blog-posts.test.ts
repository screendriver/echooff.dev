import { describe, expect, it } from "vitest";
import type { CollectionEntry } from "astro:content";
import { formatPublishedAtFallbackDateTime, sortBlogPostsByPublicationDateDescending } from "./blog-posts.js";

function createBlogPostCollectionEntry(input: {
	readonly id: string;
	readonly title: string;
	readonly publishedAt: string;
}): CollectionEntry<"blog"> {
	return {
		id: input.id,
		collection: "blog",
		data: {
			title: input.title,
			publishedAt: input.publishedAt
		},
		body: ""
	};
}

describe("sortBlogPostsByPublicationDateDescending()", () => {
	it("sorts newer blog posts before older blog posts", () => {
		const olderBlogPost = createBlogPostCollectionEntry({
			id: "older-blog-post",
			title: "Older Blog Post",
			publishedAt: "2026-02-01T10:00:00+01:00"
		});
		const newerBlogPost = createBlogPostCollectionEntry({
			id: "newer-blog-post",
			title: "Newer Blog Post",
			publishedAt: "2026-02-28T10:00:00+01:00"
		});

		const sortedBlogPosts = sortBlogPostsByPublicationDateDescending([olderBlogPost, newerBlogPost]);

		expect(sortedBlogPosts).toStrictEqual([newerBlogPost, olderBlogPost]);
	});

	it("uses the collection entry id as a deterministic tie breaker", () => {
		const blogPostB = createBlogPostCollectionEntry({
			id: "zebra",
			title: "Zebra",
			publishedAt: "2026-02-28T10:00:00+01:00"
		});
		const blogPostA = createBlogPostCollectionEntry({
			id: "alpha",
			title: "Alpha",
			publishedAt: "2026-02-28T10:00:00+01:00"
		});

		const sortedBlogPosts = sortBlogPostsByPublicationDateDescending([blogPostB, blogPostA]);

		expect(sortedBlogPosts).toStrictEqual([blogPostA, blogPostB]);
	});
});

describe("formatPublishedAtFallbackDateTime()", () => {
	it("returns a deterministic readable fallback timestamp", () => {
		expect(formatPublishedAtFallbackDateTime("2026-02-28T14:30:00+01:00")).toBe("2026-02-28 14:30+01:00");
	});

	it("throws when the timestamp is invalid", () => {
		expect(() => {
			formatPublishedAtFallbackDateTime("not-a-date");
		}).toThrowError('Published at "not-a-date" is not a valid ISO 8601 date-time');
	});
});
