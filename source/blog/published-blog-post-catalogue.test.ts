import assert from "node:assert";
import { suite, test } from "mocha";
import { createBlogPostCollectionEntry } from "./blog-post-test-fixture.ts";
import { createPublishedBlogPostCatalogue, type PublishedBlogPostSlug } from "./published-blog-post-catalogue.ts";

function readPublishedBlogPostSlug(postSlug: PublishedBlogPostSlug): string {
	return postSlug;
}

suite("createPublishedBlogPostCatalogue()", function () {
	test("recognizes every blog post exposed by the blog collection", function () {
		const firstBlogPost = createBlogPostCollectionEntry({
			description: "First blog post",
			id: "first-blog-post",
			title: "First blog post",
			publishedAt: "2026-07-01T10:00:00+00:00",
			topic: "Writing"
		});
		const secondBlogPost = createBlogPostCollectionEntry({
			description: "Second blog post",
			id: "second-blog-post",
			title: "Second blog post",
			publishedAt: "2026-07-02T10:00:00+00:00",
			topic: "Writing"
		});
		const publishedBlogPostCatalogue = createPublishedBlogPostCatalogue([firstBlogPost, secondBlogPost]);

		assert.strictEqual(publishedBlogPostCatalogue.hasPublishedBlogPost("first-blog-post"), true);
		assert.strictEqual(publishedBlogPostCatalogue.hasPublishedBlogPost("second-blog-post"), true);
	});

	test("does not recognize an unknown slug", function () {
		const blogPost = createBlogPostCollectionEntry({
			description: "Known blog post",
			id: "known-blog-post",
			title: "Known blog post",
			publishedAt: "2026-07-01T10:00:00+00:00",
			topic: "Writing"
		});
		const publishedBlogPostCatalogue = createPublishedBlogPostCatalogue([blogPost]);

		assert.strictEqual(publishedBlogPostCatalogue.hasPublishedBlogPost("unknown-blog-post"), false);
	});

	test("narrows a known string to a published blog post slug", function () {
		const blogPost = createBlogPostCollectionEntry({
			description: "Known blog post",
			id: "known-blog-post",
			title: "Known blog post",
			publishedAt: "2026-07-01T10:00:00+00:00",
			topic: "Writing"
		});
		const publishedBlogPostCatalogue = createPublishedBlogPostCatalogue([blogPost]);
		const candidateSlug: string = blogPost.id;

		if (!publishedBlogPostCatalogue.hasPublishedBlogPost(candidateSlug)) {
			throw new Error("Expected the test blog post to be published.");
		}

		const actualSlug = readPublishedBlogPostSlug(candidateSlug);

		assert.strictEqual(actualSlug, blogPost.id);
	});
});
