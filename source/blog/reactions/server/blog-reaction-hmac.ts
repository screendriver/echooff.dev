import { createHmac } from "node:crypto";
import type { PublishedBlogPostSlug } from "../../published-blog-post-catalogue.ts";
import type { AnonymousReactorIdentifier } from "./blog-reaction-identity-schema.ts";
import type { BlogReactionHmacSecret } from "./blog-reaction-runtime-configuration-schema.ts";

export type CreateBlogReactionHashOptions = {
	readonly anonymousReactorIdentifier: AnonymousReactorIdentifier;
	readonly postSlug: PublishedBlogPostSlug;
	readonly secret: BlogReactionHmacSecret;
};

export function createBlogReactionHash(createBlogReactionHashOptions: CreateBlogReactionHashOptions): string {
	const { anonymousReactorIdentifier, postSlug, secret } = createBlogReactionHashOptions;

	return createHmac("sha256", secret).update(anonymousReactorIdentifier).update("\0").update(postSlug).digest("hex");
}
