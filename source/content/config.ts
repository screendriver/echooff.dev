import { z, defineCollection } from "astro:content";

const blogCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z.date(),
		draft: z.boolean()
	})
});

export const collections = {
	blog: blogCollection
};
