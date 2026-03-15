import type { CollectionEntry } from "astro:content";

export type BlogPostCollectionEntryInput = {
	readonly description: string;
	readonly id: string;
	readonly title: string;
	readonly publishedAt: string;
};

export function createBlogPostCollectionEntry(input: BlogPostCollectionEntryInput): CollectionEntry<"blog"> {
	const blogPostCollectionEntry: CollectionEntry<"blog"> = {
		id: input.id,
		collection: "blog",
		data: {
			description: input.description,
			title: input.title,
			publishedAt: input.publishedAt
		},
		body: ""
	};

	return blogPostCollectionEntry;
}
