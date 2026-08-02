import type { CollectionEntry } from "astro:content";

export type PublishedBlogPostSlug = string & {
	readonly publishedBlogPostSlugBrand: "PublishedBlogPostSlug";
};

export type PublishedBlogPostCatalogue = {
	readonly hasPublishedBlogPost: (postSlug: string) => postSlug is PublishedBlogPostSlug;
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
		hasPublishedBlogPost(postSlug): postSlug is PublishedBlogPostSlug {
			return publishedBlogPostSlugs.has(postSlug);
		}
	};
}
