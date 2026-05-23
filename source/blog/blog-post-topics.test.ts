import { describe, expect, it } from "vitest";
import { Maybe } from "true-myth";
import {
	createBlogPostTopicArchiveEntries,
	createBlogPostTopicArchiveEntryForSlug,
	getBlogPostTopicDetails,
	getBlogPostTopicDetailsBySlug,
	groupBlogPostsByTopic
} from "./blog-post-topics.ts";
import { createBlogPostCollectionEntry } from "./blog-post-test-fixture.ts";

describe("getBlogPostTopicDetails()", () => {
	it("returns the stable display label and URL slug for a topic", () => {
		const actualTopicDetails = getBlogPostTopicDetails("TypeScript");
		const expectedTopicDetails = {
			label: "TypeScript",
			slug: "typescript"
		};

		expect(actualTopicDetails).toMatchObject(expectedTopicDetails);
	});
});

describe("getBlogPostTopicDetailsBySlug()", () => {
	it("returns a topic details Maybe for a known topic slug", () => {
		const actualTopicDetails = getBlogPostTopicDetailsBySlug("typescript");
		const expectedTopicDetails = Maybe.just({
			description: "TypeScript patterns that make intent, failures, and domain rules explicit.",
			label: "TypeScript",
			slug: "typescript"
		});

		expect(actualTopicDetails).toStrictEqual(expectedTopicDetails);
	});

	it("returns Nothing for an unknown topic slug", () => {
		const actualTopicDetails = getBlogPostTopicDetailsBySlug("unknown");
		const expectedTopicDetails = Maybe.nothing();

		expect(actualTopicDetails).toStrictEqual(expectedTopicDetails);
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
		const actualTypeScriptBlogPosts = blogPostsByTopic.get("TypeScript");
		const expectedTypeScriptBlogPosts = [typeScriptBlogPost];
		const actualTestingBlogPosts = blogPostsByTopic.get("Testing");
		const expectedTestingBlogPosts = [testingBlogPost];

		expect(actualTypeScriptBlogPosts).toStrictEqual(expectedTypeScriptBlogPosts);
		expect(actualTestingBlogPosts).toStrictEqual(expectedTestingBlogPosts);
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

		const actualTopicArchiveEntries = createBlogPostTopicArchiveEntries([testingBlogPost, architectureBlogPost]);
		const expectedTopicArchiveEntries = [
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
		];

		expect(actualTopicArchiveEntries).toMatchObject(expectedTopicArchiveEntries);
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

		const actualTopicArchiveEntry = createBlogPostTopicArchiveEntryForSlug([blogPost], "typescript");
		const expectedTopicArchiveEntry = Maybe.just({
			description: "TypeScript patterns that make intent, failures, and domain rules explicit.",
			label: "TypeScript",
			postCount: 1,
			slug: "typescript"
		});

		expect(actualTopicArchiveEntry).toStrictEqual(expectedTopicArchiveEntry);
	});

	it("returns Nothing for an unknown or empty topic slug", () => {
		const actualKnownTopicResult = createBlogPostTopicArchiveEntryForSlug([], "typescript");
		const expectedKnownTopicResult = Maybe.nothing();
		const actualUnknownTopicResult = createBlogPostTopicArchiveEntryForSlug([], "unknown");
		const expectedUnknownTopicResult = Maybe.nothing();

		expect(actualKnownTopicResult).toStrictEqual(expectedKnownTopicResult);
		expect(actualUnknownTopicResult).toStrictEqual(expectedUnknownTopicResult);
	});
});
