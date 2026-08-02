import type { BlogReactionResponse } from "./blog-reaction-schema.ts";

export type BlogReactionClient = {
	readonly addReaction: (postSlug: string) => Promise<BlogReactionResponse>;
	readonly loadReaction: (postSlug: string) => Promise<BlogReactionResponse>;
	readonly removeReaction: (postSlug: string) => Promise<BlogReactionResponse>;
};

export type BlogReactionClientFailure = Error & {
	readonly kind: "blog_reaction_client_failure";
};
