import type { CollectionEntry } from "astro:content";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";

export type BlogPostCollectionEntryInput = {
	readonly description: string;
	readonly id: string;
	readonly title: string;
	readonly publishedAt: string;
};

const emptyBlogPostContentComponent: AstroComponentFactory = async function emptyBlogPostContentComponent() {
	return new Response("");
};

export function createBlogPostCollectionEntry(input: BlogPostCollectionEntryInput): CollectionEntry<"blog"> {
	const blogPostCollectionEntry: CollectionEntry<"blog"> = {
		id: input.id,
		slug: input.id,
		collection: "blog",
		data: {
			description: input.description,
			title: input.title,
			publishedAt: input.publishedAt
		},
		body: "",
		async render() {
			return {
				Content: emptyBlogPostContentComponent,
				headings: [],
				remarkPluginFrontmatter: {}
			};
		}
	};

	return blogPostCollectionEntry;
}
