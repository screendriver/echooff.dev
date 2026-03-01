import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const blogCollection = defineCollection({
	schema: z.object({
		title: z.string().min(1),
		description: z.string().min(1),
		publishedAt: z.string().datetime({ offset: true })
	})
});

export const collections = {
	blog: blogCollection
};
