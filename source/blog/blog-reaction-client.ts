import ky, { type Input, type KyInstance, type Options } from "ky";
import { match } from "ts-pattern";
import { blogReactionResponseSchema, type BlogReactionResponse } from "./blog-reaction-schema.ts";

export type BlogReactionClient = {
	readonly addReaction: (postSlug: string) => Promise<BlogReactionResponse>;
	readonly loadReaction: (postSlug: string) => Promise<BlogReactionResponse>;
	readonly removeReaction: (postSlug: string) => Promise<BlogReactionResponse>;
};

export type CreateKyBlogReactionClientOptions = {
	readonly kyInstance?: KyInstance;
	readonly reactionEndpointPrefix?: string;
};

export type BlogReactionClientFailure = Error & {
	readonly kind: "blog_reaction_client_failure";
};

export const blogReactionRequestTimeoutMilliseconds = 5000;

const defaultReactionEndpointPrefix = "/api/reactions/";

const blogReactionRequestOptions: Options = {
	credentials: "same-origin",
	retry: 0,
	timeout: blogReactionRequestTimeoutMilliseconds
};

function createBlogReactionClientFailure(): BlogReactionClientFailure {
	return Object.assign(new Error("The blog reaction request failed."), {
		kind: "blog_reaction_client_failure" as const
	});
}

function createBlogReactionUrl(reactionEndpointPrefix: string, postSlug: string): string {
	return `${reactionEndpointPrefix}${encodeURIComponent(postSlug)}`;
}

type BlogReactionRequestMethod = "DELETE" | "GET" | "PUT";

type BlogReactionRequestOptions = {
	readonly kyInstance: KyInstance;
	readonly method: BlogReactionRequestMethod;
	readonly postSlug: string;
	readonly reactionEndpointPrefix: string;
};

async function requestBlogReaction(
	blogReactionRequestOptionsInput: BlogReactionRequestOptions
): Promise<BlogReactionResponse> {
	const { kyInstance, method, postSlug, reactionEndpointPrefix } = blogReactionRequestOptionsInput;
	const reactionUrl = createBlogReactionUrl(reactionEndpointPrefix, postSlug);
	try {
		return await match(method)
			.with("DELETE", async () => {
				return await kyInstance
					.delete(reactionUrl, blogReactionRequestOptions)
					.json(blogReactionResponseSchema);
			})
			.with("GET", async () => {
				return await kyInstance.get(reactionUrl, blogReactionRequestOptions).json(blogReactionResponseSchema);
			})
			.with("PUT", async () => {
				return await kyInstance.put(reactionUrl, blogReactionRequestOptions).json(blogReactionResponseSchema);
			})
			.exhaustive();
	} catch {
		throw createBlogReactionClientFailure();
	}
}

export function createKyBlogReactionClient(
	createKyBlogReactionClientOptions: CreateKyBlogReactionClientOptions = {}
): BlogReactionClient {
	const { kyInstance = ky, reactionEndpointPrefix = defaultReactionEndpointPrefix } =
		createKyBlogReactionClientOptions;

	return {
		async addReaction(postSlug) {
			return await requestBlogReaction({
				kyInstance,
				method: "PUT",
				postSlug,
				reactionEndpointPrefix
			});
		},
		async loadReaction(postSlug) {
			return await requestBlogReaction({
				kyInstance,
				method: "GET",
				postSlug,
				reactionEndpointPrefix
			});
		},
		async removeReaction(postSlug) {
			return await requestBlogReaction({
				kyInstance,
				method: "DELETE",
				postSlug,
				reactionEndpointPrefix
			});
		}
	};
}

export type BlogReactionClientFetch = (input: Input, init?: RequestInit) => Promise<Response>;
