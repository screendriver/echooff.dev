import is from "@sindresorhus/is";
import type { CollectionEntry } from "astro:content";
import { Maybe } from "true-myth";

export const blogPostTopics = ["Architecture", "Debugging", "Git", "Testing", "TypeScript", "Writing"] as const;

export type BlogPostTopic = (typeof blogPostTopics)[number];

export type BlogPostTopicDetails = {
	readonly description: string;
	readonly label: BlogPostTopic;
	readonly slug: string;
};

export type BlogPostTopicArchiveEntry = BlogPostTopicDetails & {
	readonly postCount: number;
};

const blogPostTopicDetailsByTopic = {
	Architecture: {
		description: "Design notes on explicit dependencies, runtime boundaries, and maintainable JavaScript systems.",
		label: "Architecture",
		slug: "architecture"
	},
	Debugging: {
		description: "Techniques for inspecting runtime behavior without polluting the codebase.",
		label: "Debugging",
		slug: "debugging"
	},
	Git: {
		description: "Practical Git workflows, repository operations, and tradeoffs in source control.",
		label: "Git",
		slug: "git"
	},
	Testing: {
		description: "Testing strategy, test design, and feedback loops for reliable software.",
		label: "Testing",
		slug: "testing"
	},
	TypeScript: {
		description: "TypeScript patterns that make intent, failures, and domain rules explicit.",
		label: "TypeScript",
		slug: "typescript"
	},
	Writing: {
		description: "Notes about publishing, writing, and the purpose behind this blog.",
		label: "Writing",
		slug: "writing"
	}
} satisfies Record<BlogPostTopic, BlogPostTopicDetails>;

export function getBlogPostTopicDetails(blogPostTopic: BlogPostTopic): BlogPostTopicDetails {
	return blogPostTopicDetailsByTopic[blogPostTopic];
}

export function getBlogPostTopicDetailsBySlug(topicSlug: string): Maybe<BlogPostTopicDetails> {
	const matchingTopicDetails = blogPostTopics.map(getBlogPostTopicDetails).find((availableTopicDetails) => {
		return availableTopicDetails.slug === topicSlug;
	});

	return Maybe.of(matchingTopicDetails);
}

export function groupBlogPostsByTopic(
	blogPosts: readonly CollectionEntry<"blog">[]
): ReadonlyMap<BlogPostTopic, readonly CollectionEntry<"blog">[]> {
	const blogPostsByTopic = new Map<BlogPostTopic, CollectionEntry<"blog">[]>();

	for (const blogPost of blogPosts) {
		const existingBlogPostsForTopic = blogPostsByTopic.get(blogPost.data.topic) ?? [];

		blogPostsByTopic.set(blogPost.data.topic, [...existingBlogPostsForTopic, blogPost]);
	}

	return blogPostsByTopic;
}

export function createBlogPostTopicArchiveEntries(
	blogPosts: readonly CollectionEntry<"blog">[]
): readonly BlogPostTopicArchiveEntry[] {
	const blogPostsByTopic = groupBlogPostsByTopic(blogPosts);

	return blogPostTopics
		.map(getBlogPostTopicDetails)
		.map((topicDetails) => {
			return {
				description: topicDetails.description,
				label: topicDetails.label,
				slug: topicDetails.slug,
				postCount: blogPostsByTopic.get(topicDetails.label)?.length ?? 0
			};
		})
		.filter((topicArchiveEntry) => {
			return topicArchiveEntry.postCount > 0;
		});
}

export function createBlogPostTopicArchiveEntryForSlug(
	blogPosts: readonly CollectionEntry<"blog">[],
	topicSlug: string
): Maybe<BlogPostTopicArchiveEntry> {
	return getBlogPostTopicDetailsBySlug(topicSlug).andThen((topicDetails) => {
		const matchingBlogPosts = blogPosts.filter((blogPost) => {
			return blogPost.data.topic === topicDetails.label;
		});

		if (is.emptyArray(matchingBlogPosts)) {
			return Maybe.nothing();
		}

		return Maybe.just({
			description: topicDetails.description,
			label: topicDetails.label,
			slug: topicDetails.slug,
			postCount: matchingBlogPosts.length
		});
	});
}
