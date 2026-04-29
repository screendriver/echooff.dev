import { describe, expect, it } from "vitest";
import { Maybe } from "true-myth";
import {
	createBlogPostTopicArchiveEntries,
	createBlogPostTopicArchiveEntryForSlug,
	getBlogPostTopicDetails,
	getBlogPostTopicDetailsBySlug,
	groupBlogPostsByTopic
} from "./blog-post-topics.js";
import { createBlogPostCollectionEntry } from "./blog-post-test-fixture.js";

describe("getBlogPostTopicDetails()", () => {
	it("returns the stable display label and URL slug for a topic", () => {
		expect(getBlogPostTopicDetails("TypeScript")).toMatchObject({
			label: "TypeScript",
			slug: "typescript"
		});
	});
});

describe("getBlogPostTopicDetailsBySlug()", () => {
	it("returns a topic details Maybe for a known topic slug", () => {
		expect(getBlogPostTopicDetailsBySlug("typescript")).toStrictEqual(
			Maybe.just({
				description: "TypeScript patterns that make intent, failures, and domain rules explicit.",
				label: "TypeScript",
				slug: "typescript"
			})
		);
	});

	it("returns Nothing for an unknown topic slug", () => {
		expect(getBlogPostTopicDetailsBySlug("unknown")).toStrictEqual(Maybe.nothing());
	});
});

describe("groupBlogPostsByTopic()", () => {
	it("groups blog posts by their configured topic", () => {
		const typeScriptBlogPost = createBlogPostCollectionEntry({
			description: "TypeScript description",
			id: "typescript-post",
			title: "TypeScript post",
			publishedAt: "2026-03-14T07:22:00+01:00",
			topic: "TypeScript"
		});
		const testingBlogPost = createBlogPostCollectionEntry({
			description: "Testing description",
			id: "testing-post",
			title: "Testing post",
			publishedAt: "2026-03-15T07:22:00+01:00",
			topic: "Testing"
		});

		const blogPostsByTopic = groupBlogPostsByTopic([typeScriptBlogPost, testingBlogPost]);

		expect(blogPostsByTopic.get("TypeScript")).toStrictEqual([typeScriptBlogPost]);
		expect(blogPostsByTopic.get("Testing")).toStrictEqual([testingBlogPost]);
	});
});

describe("createBlogPostTopicArchiveEntries()", () => {
	it("returns populated topics in deterministic display order", () => {
		const testingBlogPost = createBlogPostCollectionEntry({
			description: "Testing description",
			id: "testing-post",
			title: "Testing post",
			publishedAt: "2026-03-15T07:22:00+01:00",
			topic: "Testing"
		});
		const architectureBlogPost = createBlogPostCollectionEntry({
			description: "Architecture description",
			id: "architecture-post",
			title: "Architecture post",
			publishedAt: "2026-03-14T07:22:00+01:00",
			topic: "Architecture"
		});

		expect(createBlogPostTopicArchiveEntries([testingBlogPost, architectureBlogPost])).toMatchObject([
			{
				label: "Architecture",
				postCount: 1,
				slug: "architecture"
			},
			{
				label: "Testing",
				postCount: 1,
				slug: "testing"
			}
		]);
	});
});

describe("createBlogPostTopicArchiveEntryForSlug()", () => {
	it("returns a populated topic archive entry for a known topic slug", () => {
		const blogPost = createBlogPostCollectionEntry({
			description: "TypeScript description",
			id: "typescript-post",
			title: "TypeScript post",
			publishedAt: "2026-03-14T07:22:00+01:00",
			topic: "TypeScript"
		});

		expect(createBlogPostTopicArchiveEntryForSlug([blogPost], "typescript")).toStrictEqual(
			Maybe.just({
				description: "TypeScript patterns that make intent, failures, and domain rules explicit.",
				label: "TypeScript",
				postCount: 1,
				slug: "typescript"
			})
		);
	});

	it("returns Nothing for an unknown or empty topic slug", () => {
		expect(createBlogPostTopicArchiveEntryForSlug([], "typescript")).toStrictEqual(Maybe.nothing());
		expect(createBlogPostTopicArchiveEntryForSlug([], "unknown")).toStrictEqual(Maybe.nothing());
	});
});
