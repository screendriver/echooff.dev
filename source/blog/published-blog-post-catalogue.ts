import type { CollectionEntry } from "astro:content";

export type PublishedBlogPostCatalogue = {
	readonly hasPublishedBlogPost: (postSlug: string) => boolean;
};

export function createPublishedBlogPostCatalogue(
	blogPosts: readonly CollectionEntry<"blog">[]
): PublishedBlogPostCatalogue {
	const publishedBlogPostSlugs = new Set(
		blogPosts.map((blogPost) => {
			return blogPost.id;
		})
	);

	return {
		hasPublishedBlogPost(postSlug) {
			return publishedBlogPostSlugs.has(postSlug);
		}
	};
}
