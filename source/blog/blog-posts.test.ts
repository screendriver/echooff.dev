import { describe, expect, it } from "vitest";
import {
	createLatestBlogIndexEntries,
	createBlogPostPageTitle,
	createBlogPostReadingTimeLabel,
	createBlogIndexEntries,
	formatPublishedAtFallbackDateTime,
	sortBlogPostsByPublicationDateDescending
} from "./blog-posts.ts";
import { createBlogPostCollectionEntry } from "./blog-post-test-fixture.ts";

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

		const actualSortedBlogPosts = sortBlogPostsByPublicationDateDescending([olderBlogPost, newerBlogPost]);
		const expectedSortedBlogPosts = [newerBlogPost, olderBlogPost];

		expect(actualSortedBlogPosts).toStrictEqual(expectedSortedBlogPosts);
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

		const actualSortedBlogPosts = sortBlogPostsByPublicationDateDescending([blogPostB, blogPostA]);
		const expectedSortedBlogPosts = [blogPostA, blogPostB];

		expect(actualSortedBlogPosts).toStrictEqual(expectedSortedBlogPosts);
	});
});

describe("formatPublishedAtFallbackDateTime()", () => {
	it("returns a deterministic readable fallback date", () => {
		const actualFallbackDateTime = formatPublishedAtFallbackDateTime("2026-02-28T14:30:00+01:00");
		const expectedFallbackDateTime = "2026-02-28";

		expect(actualFallbackDateTime).toBe(expectedFallbackDateTime);
	});

	it("throws when the timestamp is invalid", () => {
		const actualFormatOperation = (): void => {
			formatPublishedAtFallbackDateTime("not-a-date");
		};
		const expectedErrorMessage = 'Published at "not-a-date" is not a valid ISO 8601 date-time';

		expect(actualFormatOperation).toThrow(expectedErrorMessage);
	});
});

describe("createBlogPostReadingTimeLabel()", () => {
	it("returns the reading-time package label for empty content", () => {
		const actualReadingTimeLabel = createBlogPostReadingTimeLabel("");
		const expectedReadingTimeLabel = "0 min read";

		expect(actualReadingTimeLabel).toBe(expectedReadingTimeLabel);
	});

	it("returns a one-minute label for short blog posts", () => {
		const actualReadingTimeLabel = createBlogPostReadingTimeLabel(
			"Dependency injection keeps side effects explicit."
		);
		const expectedReadingTimeLabel = "1 min read";

		expect(actualReadingTimeLabel).toBe(expectedReadingTimeLabel);
	});

	it("returns a multi-minute label for longer blog posts", () => {
		const actualReadingTimeLabel = createBlogPostReadingTimeLabel("word ".repeat(400));
		const expectedReadingTimeLabel = "2 min read";

		expect(actualReadingTimeLabel).toBe(expectedReadingTimeLabel);
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

		const actualReadingTimeLabel = createBlogPostReadingTimeLabel(markdownDocument);
		const expectedReadingTimeLabel = "1 min read";

		expect(actualReadingTimeLabel).toBe(expectedReadingTimeLabel);
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

		const actualBlogIndexEntries = createBlogIndexEntries([blogPost]);
		const expectedBlogIndexEntries = [
			{
				description: "Clear descriptions help readers choose what to open",
				publishedAt: "2026-03-14T07:22:00+01:00",
				readingTimeLabel: "1 min read",
				slug: "blog-index-entry",
				title: "Blog index entry",
				topic: "TypeScript",
				topicSlug: "typescript"
			}
		];

		expect(actualBlogIndexEntries).toStrictEqual(expectedBlogIndexEntries);
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

		const actualLatestBlogIndexEntries = createLatestBlogIndexEntries(
			[oldestBlogPost, newestBlogPost, middleBlogPost],
			2
		);
		const expectedLatestBlogIndexEntries = [
			{
				description: "Newest blog post description",
				publishedAt: "2026-03-01T10:00:00+01:00",
				readingTimeLabel: "0 min read",
				slug: "newest-blog-post",
				title: "Newest Blog Post",
				topic: "Architecture",
				topicSlug: "architecture"
			},
			{
				description: "Middle blog post description",
				publishedAt: "2026-02-01T10:00:00+01:00",
				readingTimeLabel: "0 min read",
				slug: "middle-blog-post",
				title: "Middle Blog Post",
				topic: "TypeScript",
				topicSlug: "typescript"
			}
		];

		expect(actualLatestBlogIndexEntries).toStrictEqual(expectedLatestBlogIndexEntries);
	});

	it("returns all available entries when fewer posts exist than the requested maximum", () => {
		const onlyBlogPost = createBlogPostCollectionEntry({
			description: "Only blog post description",
			id: "only-blog-post",
			title: "Only Blog Post",
			publishedAt: "2026-04-01T10:00:00+01:00",
			topic: "Writing"
		});

		const actualLatestBlogIndexEntries = createLatestBlogIndexEntries([onlyBlogPost], 3);
		const expectedLatestBlogIndexEntries = [
			{
				description: "Only blog post description",
				publishedAt: "2026-04-01T10:00:00+01:00",
				readingTimeLabel: "0 min read",
				slug: "only-blog-post",
				title: "Only Blog Post",
				topic: "Writing",
				topicSlug: "writing"
			}
		];

		expect(actualLatestBlogIndexEntries).toStrictEqual(expectedLatestBlogIndexEntries);
	});
});

describe("createBlogPostPageTitle()", () => {
	it("places the blog post title before the site owner name", () => {
		const actualPageTitle = createBlogPostPageTitle("Dependency injection without frameworks in TypeScript");
		const expectedPageTitle = "Dependency injection without frameworks in TypeScript | Christian Rackerseder";

		expect(actualPageTitle).toBe(expectedPageTitle);
	});
});
