import { isError } from "@sindresorhus/is";
import type { BlogReactionResponse } from "./blog-reaction-schema.ts";

export type BlogReactionClient = {
	readonly addReaction: (postSlug: string) => Promise<BlogReactionResponse>;
	readonly loadReaction: (postSlug: string) => Promise<BlogReactionResponse>;
	readonly removeReaction: (postSlug: string) => Promise<BlogReactionResponse>;
};

export type BlogReactionClientFailure = Error & {
	readonly kind: "blog_reaction_client_failure";
};

export function isBlogReactionClientFailure(error: unknown): error is BlogReactionClientFailure {
	if (!isError(error)) {
		return false;
	}

	return Object.getOwnPropertyDescriptor(error, "kind")?.value === "blog_reaction_client_failure";
}
