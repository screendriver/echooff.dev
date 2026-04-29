import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { blogPostTopics } from "./blog/blog-post-topics.js";

const blogContentDirectoryPath = "./source/content/blog";

const blogCollection = defineCollection({
	loader: glob({
		base: blogContentDirectoryPath,
		pattern: "**/*.md"
	}),
	schema: z.object({
		title: z.string().min(1),
		description: z.string().min(1),
		publishedAt: z.iso.datetime({ offset: true }),
		topic: z.enum(blogPostTopics)
	})
});

export const collections = {
	blog: blogCollection
};
