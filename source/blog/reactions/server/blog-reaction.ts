import type { Maybe } from "true-myth/maybe";
import type { Task } from "true-myth/task";
import type { PublishedBlogPostSlug } from "../../published-blog-post-catalogue.ts";

export type BlogReactionSnapshot = {
	readonly count: number;
	readonly reacted: boolean;
};

export type BlogReactionRepository = {
	readonly addReactionAndReadSnapshot: (
		postSlug: PublishedBlogPostSlug,
		reactorHash: string
	) => Task<BlogReactionSnapshot, Error>;
	readonly readSnapshot: (
		postSlug: PublishedBlogPostSlug,
		reactorHash: Maybe<string>
	) => Task<BlogReactionSnapshot, Error>;
	readonly removeReactionAndReadSnapshot: (
		postSlug: PublishedBlogPostSlug,
		reactorHash: string
	) => Task<BlogReactionSnapshot, Error>;
};
