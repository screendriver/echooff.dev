import is from "@sindresorhus/is";
import type { CollectionEntry } from "astro:content";

export function sortBlogPostsByPublicationDateDescending(
	blogPosts: readonly CollectionEntry<"blog">[]
): CollectionEntry<"blog">[] {
	return Array.from(blogPosts).toSorted((firstBlogPost, secondBlogPost) => {
		const secondPublishedAtValue = Date.parse(secondBlogPost.data.publishedAt);
		const firstPublishedAtValue = Date.parse(firstBlogPost.data.publishedAt);

		if (secondPublishedAtValue !== firstPublishedAtValue) {
			return secondPublishedAtValue - firstPublishedAtValue;
		}

		return firstBlogPost.id.localeCompare(secondBlogPost.id);
	});
}

export function formatPublishedAtFallbackDateTime(publishedAt: string): string {
	const publishedAtDate = new Date(publishedAt);

	if (!is.validDate(publishedAtDate)) {
		throw new TypeError(`Published at "${publishedAt}" is not a valid ISO 8601 date-time`);
	}

	return publishedAt.replace("T", " ").replace(/:\d{2}(?:\.\d+)?(?=[+-]\d{2}:\d{2}|Z$)/u, "");
}
