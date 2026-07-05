import assert from "node:assert";
import { suite, test } from "mocha";
import { just, nothing } from "true-myth/maybe";
import {
	createBlogPostTopicArchiveEntries,
	createBlogPostTopicArchiveEntryForSlug,
	getBlogPostTopicDetails,
	getBlogPostTopicDetailsBySlug,
	groupBlogPostsByTopic
} from "./blog-post-topics.ts";
import { createBlogPostCollectionEntry } from "./blog-post-test-fixture.ts";

suite("getBlogPostTopicDetails()", function () {
	test("returns the stable display label and URL slug for a topic", function () {
		const actualTopicDetails = getBlogPostTopicDetails("Node.js");
		const expectedTopicDetails = {
			label: "Node.js",
			slug: "nodejs"
		};
		const actualPublicTopicDetails = {
			label: actualTopicDetails.label,
			slug: actualTopicDetails.slug
		};

		assert.deepStrictEqual(actualPublicTopicDetails, expectedTopicDetails);
	});
});

suite("getBlogPostTopicDetailsBySlug()", function () {
	test("returns a topic details Maybe for a known topic slug", function () {
		const actualTopicDetails = getBlogPostTopicDetailsBySlug("typescript");
		const expectedTopicDetails = just({
			description: "TypeScript patterns that make intent, failures, and domain rules explicit.",
			label: "TypeScript",
			slug: "typescript"
		});

		assert.deepStrictEqual(actualTopicDetails, expectedTopicDetails);
	});

	test("returns Nothing for an unknown topic slug", function () {
		const actualTopicDetails = getBlogPostTopicDetailsBySlug("unknown");
		const expectedTopicDetails = nothing();

		assert.deepStrictEqual(actualTopicDetails, expectedTopicDetails);
	});
});

suite("groupBlogPostsByTopic()", function () {
	test("groups blog posts by their configured topic", function () {
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

		assert.deepStrictEqual(actualTypeScriptBlogPosts, expectedTypeScriptBlogPosts);
		assert.deepStrictEqual(actualTestingBlogPosts, expectedTestingBlogPosts);
	});
});

suite("createBlogPostTopicArchiveEntries()", function () {
	test("returns populated topics in deterministic display order", function () {
		const nodeJsBlogPost = createBlogPostCollectionEntry({
			description: "Node.js description",
			id: "nodejs-post",
			title: "Node.js post",
			publishedAt: "2026-03-16T07:22:00+01:00",
			topic: "Node.js"
		});
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

		const actualTopicArchiveEntries = createBlogPostTopicArchiveEntries([
			testingBlogPost,
			nodeJsBlogPost,
			architectureBlogPost
		]);
		const expectedTopicArchiveEntries = [
			{
				label: "Architecture",
				postCount: 1,
				slug: "architecture"
			},
			{
				label: "Node.js",
				postCount: 1,
				slug: "nodejs"
			},
			{
				label: "Testing",
				postCount: 1,
				slug: "testing"
			}
		];
		const actualPublicTopicArchiveEntries = actualTopicArchiveEntries.map((topicArchiveEntry) => {
			return {
				label: topicArchiveEntry.label,
				postCount: topicArchiveEntry.postCount,
				slug: topicArchiveEntry.slug
			};
		});

		assert.deepStrictEqual(actualPublicTopicArchiveEntries, expectedTopicArchiveEntries);
	});
});

suite("createBlogPostTopicArchiveEntryForSlug()", function () {
	test("returns a populated topic archive entry for a known topic slug", function () {
		const blogPost = createBlogPostCollectionEntry({
			description: "TypeScript description",
			id: "typescript-post",
			title: "TypeScript post",
			publishedAt: "2026-03-14T07:22:00+01:00",
			topic: "TypeScript"
		});

		const actualTopicArchiveEntry = createBlogPostTopicArchiveEntryForSlug([blogPost], "typescript");
		const expectedTopicArchiveEntry = just({
			description: "TypeScript patterns that make intent, failures, and domain rules explicit.",
			label: "TypeScript",
			postCount: 1,
			slug: "typescript"
		});

		assert.deepStrictEqual(actualTopicArchiveEntry, expectedTopicArchiveEntry);
	});

	test("returns Nothing for an unknown or empty topic slug", function () {
		const actualKnownTopicResult = createBlogPostTopicArchiveEntryForSlug([], "typescript");
		const expectedKnownTopicResult = nothing();
		const actualUnknownTopicResult = createBlogPostTopicArchiveEntryForSlug([], "unknown");
		const expectedUnknownTopicResult = nothing();

		assert.deepStrictEqual(actualKnownTopicResult, expectedKnownTopicResult);
		assert.deepStrictEqual(actualUnknownTopicResult, expectedUnknownTopicResult);
	});
});
