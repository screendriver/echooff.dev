import {
	isBlogReactionClientFailure,
	type BlogReactionClient,
	type BlogReactionClientFailure
} from "../blog/reactions/blog-reaction-client.ts";
import type { BlogReactionResponse } from "../blog/reactions/blog-reaction-schema.ts";
import type { UnexpectedFailureReporter } from "./report-unexpected-browser-failure.ts";

export type CreateReportingBlogReactionClientOptions = {
	readonly client: BlogReactionClient;
	readonly reporter: UnexpectedFailureReporter;
};

function reportForbiddenBlogReactionFailure(
	reporter: UnexpectedFailureReporter,
	error: unknown,
	operation: string
): void {
	if (!isBlogReactionClientFailure(error) || error.statusCode !== 403) {
		return;
	}

	reporter.report(error, {
		feature: "blog_reactions",
		operation,
		properties: {
			statusCode: error.statusCode
		},
		runtime: "browser"
	});
}

function rethrowBlogReactionFailure(reporter: UnexpectedFailureReporter, error: unknown, operation: string): never {
	reportForbiddenBlogReactionFailure(reporter, error, operation);
	throw error;
}

export function createReportingBlogReactionClient(
	createReportingBlogReactionClientOptions: CreateReportingBlogReactionClientOptions
): BlogReactionClient {
	const { client, reporter } = createReportingBlogReactionClientOptions;

	return {
		async addReaction(postSlug: string): Promise<BlogReactionResponse> {
			try {
				return await client.addReaction(postSlug);
			} catch (error) {
				return rethrowBlogReactionFailure(reporter, error, "blog_reaction.add");
			}
		},
		async loadReaction(postSlug: string): Promise<BlogReactionResponse> {
			try {
				return await client.loadReaction(postSlug);
			} catch (error) {
				return rethrowBlogReactionFailure(reporter, error, "blog_reaction.load");
			}
		},
		async removeReaction(postSlug: string): Promise<BlogReactionResponse> {
			try {
				return await client.removeReaction(postSlug);
			} catch (error) {
				return rethrowBlogReactionFailure(reporter, error, "blog_reaction.remove");
			}
		}
	};
}

export function isReportableBlogReactionClientFailure(error: unknown): error is BlogReactionClientFailure {
	return isBlogReactionClientFailure(error) && error.statusCode === 403;
}
