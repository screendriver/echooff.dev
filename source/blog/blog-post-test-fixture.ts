import type { CollectionEntry } from "astro:content";
import type { BlogPostTopic } from "./blog-post-topics.js";

export type BlogPostCollectionEntryInput = {
	readonly description: string;
	readonly id: string;
	readonly title: string;
	readonly publishedAt: string;
	readonly topic: BlogPostTopic;
};

export function createBlogPostCollectionEntry(input: BlogPostCollectionEntryInput): CollectionEntry<"blog"> {
	const blogPostCollectionEntry: CollectionEntry<"blog"> = {
		id: input.id,
		collection: "blog",
		data: {
			description: input.description,
			title: input.title,
			publishedAt: input.publishedAt,
			topic: input.topic
		},
		body: ""
	};

	return blogPostCollectionEntry;
}
