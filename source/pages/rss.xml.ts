import type { APIRoute } from "astro";
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export const get: APIRoute = async (context) => {
	if (context.site === undefined) {
		throw new Error("Context has no site attached");
	}

	const blogPosts = await getCollection("blog");

	return rss({
		title: "Christian Rackerseder — Blog",
		description: "Full-Stack Software Engineer with a passion for the Jamstack and test driven development.",
		site: context.site.toString(),
		items: blogPosts.map((blogPost) => {
			const { data } = blogPost;

			return {
				title: data.title,
				pubDate: data.date,
				description: data.description,
				link: `/blog/${blogPost.slug}/`
			};
		})
	});
};
