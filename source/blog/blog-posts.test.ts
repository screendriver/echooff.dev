import { describe, expect, it } from "vitest";
import {
	createLatestBlogIndexEntries,
	createBlogPostPageTitle,
	createBlogPostReadingTimeLabel,
	createBlogIndexEntries,
	formatPublishedAtFallbackDateTime,
	sortBlogPostsByPublicationDateDescending
} from "./blog-posts.js";
import { createBlogPostCollectionEntry } from "./blog-post-test-fixture.js";

describe("sortBlogPostsByPublicationDateDescending()", () => {
	it("sorts newer blog posts before older blog posts", () => {
		const olderBlogPost = createBlogPostCollectionEntry({
			description: "Older blog post description",
			id: "older-blog-post",
			title: "Older Blog Post",
			publishedAt: "2026-02-01T10:00:00+01:00",
			topic: "Writing"
		});
		const newerBlogPost = createBlogPostCollectionEntry({
			description: "Newer blog post description",
			id: "newer-blog-post",
			title: "Newer Blog Post",
			publishedAt: "2026-02-28T10:00:00+01:00",
			topic: "Writing"
		});

		const sortedBlogPosts = sortBlogPostsByPublicationDateDescending([olderBlogPost, newerBlogPost]);

		expect(sortedBlogPosts).toStrictEqual([newerBlogPost, olderBlogPost]);
	});

	it("uses the collection entry id as a deterministic tie breaker", () => {
		const blogPostB = createBlogPostCollectionEntry({
			description: "Zebra blog post description",
			id: "zebra",
			title: "Zebra",
			publishedAt: "2026-02-28T10:00:00+01:00",
			topic: "Writing"
		});
		const blogPostA = createBlogPostCollectionEntry({
			description: "Alpha blog post description",
			id: "alpha",
			title: "Alpha",
			publishedAt: "2026-02-28T10:00:00+01:00",
			topic: "Writing"
		});

		const sortedBlogPosts = sortBlogPostsByPublicationDateDescending([blogPostB, blogPostA]);

		expect(sortedBlogPosts).toStrictEqual([blogPostA, blogPostB]);
	});
});

describe("formatPublishedAtFallbackDateTime()", () => {
	it("returns a deterministic readable fallback date", () => {
		expect(formatPublishedAtFallbackDateTime("2026-02-28T14:30:00+01:00")).toBe("2026-02-28");
	});

	it("throws when the timestamp is invalid", () => {
		expect(() => {
			formatPublishedAtFallbackDateTime("not-a-date");
		}).toThrow('Published at "not-a-date" is not a valid ISO 8601 date-time');
	});
});

describe("createBlogPostReadingTimeLabel()", () => {
	it("returns the reading-time package label for empty content", () => {
		expect(createBlogPostReadingTimeLabel("")).toBe("0 min read");
	});

	it("returns a one-minute label for short blog posts", () => {
		expect(createBlogPostReadingTimeLabel("Dependency injection keeps side effects explicit.")).toBe("1 min read");
	});

	it("returns a multi-minute label for longer blog posts", () => {
		expect(createBlogPostReadingTimeLabel("word ".repeat(400))).toBe("2 min read");
	});

	it("handles markdown syntax and code fences deterministically", () => {
		const markdownDocument = [
			"# Reading Time",
			"",
			"```ts",
			"const articleLength = 120;",
			"```",
			"",
			"word ".repeat(120)
		].join("\n");

		expect(createBlogPostReadingTimeLabel(markdownDocument)).toBe("1 min read");
	});
});

describe("createBlogIndexEntries()", () => {
	it("returns the fields required for rendering the blog index including descriptions", () => {
		const blogPost = createBlogPostCollectionEntry({
			body: "word ".repeat(120),
			description: "Clear descriptions help readers choose what to open",
			id: "blog-index-entry",
			title: "Blog index entry",
			publishedAt: "2026-03-14T07:22:00+01:00",
			topic: "TypeScript"
		});

		expect(createBlogIndexEntries([blogPost])).toStrictEqual([
			{
				description: "Clear descriptions help readers choose what to open",
				publishedAt: "2026-03-14T07:22:00+01:00",
				slug: "blog-index-entry",
				title: "Blog index entry",
				topic: "TypeScript",
				topicSlug: "typescript"
			}
		]);
	});
});

describe("createLatestBlogIndexEntries()", () => {
	it("returns newest blog index entries first up to the requested maximum", () => {
		const oldestBlogPost = createBlogPostCollectionEntry({
			description: "Oldest blog post description",
			id: "oldest-blog-post",
			title: "Oldest Blog Post",
			publishedAt: "2026-01-01T10:00:00+01:00",
			topic: "Writing"
		});
		const middleBlogPost = createBlogPostCollectionEntry({
			description: "Middle blog post description",
			id: "middle-blog-post",
			title: "Middle Blog Post",
			publishedAt: "2026-02-01T10:00:00+01:00",
			topic: "TypeScript"
		});
		const newestBlogPost = createBlogPostCollectionEntry({
			description: "Newest blog post description",
			id: "newest-blog-post",
			title: "Newest Blog Post",
			publishedAt: "2026-03-01T10:00:00+01:00",
			topic: "Architecture"
		});

		expect(createLatestBlogIndexEntries([oldestBlogPost, newestBlogPost, middleBlogPost], 2)).toStrictEqual([
			{
				description: "Newest blog post description",
				publishedAt: "2026-03-01T10:00:00+01:00",
				slug: "newest-blog-post",
				title: "Newest Blog Post",
				topic: "Architecture",
				topicSlug: "architecture"
			},
			{
				description: "Middle blog post description",
				publishedAt: "2026-02-01T10:00:00+01:00",
				slug: "middle-blog-post",
				title: "Middle Blog Post",
				topic: "TypeScript",
				topicSlug: "typescript"
			}
		]);
	});

	it("returns all available entries when fewer posts exist than the requested maximum", () => {
		const onlyBlogPost = createBlogPostCollectionEntry({
			description: "Only blog post description",
			id: "only-blog-post",
			title: "Only Blog Post",
			publishedAt: "2026-04-01T10:00:00+01:00",
			topic: "Writing"
		});

		expect(createLatestBlogIndexEntries([onlyBlogPost], 3)).toStrictEqual([
			{
				description: "Only blog post description",
				publishedAt: "2026-04-01T10:00:00+01:00",
				slug: "only-blog-post",
				title: "Only Blog Post",
				topic: "Writing",
				topicSlug: "writing"
			}
		]);
	});
});

describe("createBlogPostPageTitle()", () => {
	it("places the blog post title before the site owner name", () => {
		expect(createBlogPostPageTitle("Dependency injection without frameworks in TypeScript")).toBe(
			"Dependency injection without frameworks in TypeScript | Christian Rackerseder"
		);
	});
});
