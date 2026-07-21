import type { CollectionEntry } from "astro:content";
import { of } from "true-myth/maybe";
import type { BlogPostTopic } from "./blog-post-topics.ts";

export type BlogPostCollectionEntryInput = {
	readonly body?: string;
	readonly description: string;
	readonly id: string;
	readonly title: string;
	readonly publishedAt: string;
	readonly updatedAt?: string;
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
			...of(input.updatedAt)
				.map((updatedAt) => {
					return { updatedAt };
				})
				.unwrapOr({}),
			topic: input.topic
		},
		body: input.body ?? ""
	};

	return blogPostCollectionEntry;
}
