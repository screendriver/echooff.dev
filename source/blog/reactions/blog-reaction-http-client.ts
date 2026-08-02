import ky, { isHTTPError, type KyInstance, type Options } from "ky";
import type { BlogReactionClient, BlogReactionClientFailure } from "./blog-reaction-client.ts";
import { blogReactionResponseSchema, type BlogReactionResponse } from "./blog-reaction-schema.ts";

export type CreateKyBlogReactionClientOptions = {
	readonly kyInstance?: KyInstance;
	readonly reactionEndpointPrefix?: string;
};

export const blogReactionRequestTimeoutMilliseconds = 5000;

const defaultReactionEndpointPrefix = "/api/reactions/";

const blogReactionRequestOptions: Options = {
	credentials: "same-origin",
	retry: 0,
	timeout: blogReactionRequestTimeoutMilliseconds
};

type BlogReactionRequestMethod = "DELETE" | "GET" | "PUT";

function createBlogReactionClientFailure(statusCode: number | undefined): BlogReactionClientFailure {
	const failure = Object.assign(new Error("The blog reaction request failed."), {
		kind: "blog_reaction_client_failure" as const
	});

	if (statusCode === undefined) {
		return failure;
	}

	return Object.assign(failure, { statusCode });
}

function createBlogReactionUrl(reactionEndpointPrefix: string, postSlug: string): string {
	return `${reactionEndpointPrefix}${encodeURIComponent(postSlug)}`;
}

async function requestBlogReaction(
	kyInstance: KyInstance,
	method: BlogReactionRequestMethod,
	postSlug: string,
	reactionEndpointPrefix: string
): Promise<BlogReactionResponse> {
	const reactionUrl = createBlogReactionUrl(reactionEndpointPrefix, postSlug);

	try {
		return await kyInstance(reactionUrl, {
			...blogReactionRequestOptions,
			method
		}).json(blogReactionResponseSchema);
	} catch (error) {
		throw createBlogReactionClientFailure(isHTTPError(error) ? error.response.status : undefined);
	}
}

export function createKyBlogReactionClient(
	createKyBlogReactionClientOptions: CreateKyBlogReactionClientOptions = {}
): BlogReactionClient {
	const { kyInstance = ky, reactionEndpointPrefix = defaultReactionEndpointPrefix } =
		createKyBlogReactionClientOptions;

	return {
		async addReaction(postSlug) {
			return requestBlogReaction(kyInstance, "PUT", postSlug, reactionEndpointPrefix);
		},
		async loadReaction(postSlug) {
			return requestBlogReaction(kyInstance, "GET", postSlug, reactionEndpointPrefix);
		},
		async removeReaction(postSlug) {
			return requestBlogReaction(kyInstance, "DELETE", postSlug, reactionEndpointPrefix);
		}
	};
}
