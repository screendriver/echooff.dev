import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blogCollection = defineCollection({
	loader: glob({
		pattern: "**/*.md",
		base: "./source/content/blog"
	}),
	schema: z.object({
		title: z.string().min(1),
		description: z.string().min(1),
		publishedAt: z.string().datetime({ offset: true })
	})
});

export const collections = {
	blog: blogCollection
};
