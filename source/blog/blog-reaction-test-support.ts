import type { PublishedBlogPostCatalogue, PublishedBlogPostSlug } from "./published-blog-post-catalogue.ts";

export function createTestPublishedBlogPostSlug(postSlug: string): PublishedBlogPostSlug {
	const testPublishedBlogPostCatalogue: PublishedBlogPostCatalogue = {
		hasPublishedBlogPost(candidatePostSlug): candidatePostSlug is PublishedBlogPostSlug {
			return candidatePostSlug === postSlug;
		}
	};

	if (!testPublishedBlogPostCatalogue.hasPublishedBlogPost(postSlug)) {
		throw new Error("Expected the test slug to identify a published blog post.");
	}

	return postSlug;
}
