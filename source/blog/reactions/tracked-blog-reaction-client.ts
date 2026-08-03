import type { BlogReactionAnalytics } from "./blog-reaction-analytics.ts";
import type { BlogReactionClient } from "./blog-reaction-client.ts";
import type { BlogReactionResponse } from "./blog-reaction-schema.ts";

export type CreateTrackedBlogReactionClientOptions = {
	readonly analytics: BlogReactionAnalytics;
	readonly client: BlogReactionClient;
};

type ExecuteTrackedReactionMutationOptions = {
	readonly executeReactionMutation: () => Promise<BlogReactionResponse>;
	readonly trackSuccessfulReaction: () => void;
};

function safelyTrackSuccessfulReaction(trackSuccessfulReaction: () => void): void {
	try {
		trackSuccessfulReaction();
	} catch {}
}

async function executeTrackedReactionMutation(
	executeTrackedReactionMutationOptions: ExecuteTrackedReactionMutationOptions
): Promise<BlogReactionResponse> {
	const { executeReactionMutation, trackSuccessfulReaction } = executeTrackedReactionMutationOptions;
	const blogReactionResponse = await executeReactionMutation();

	safelyTrackSuccessfulReaction(trackSuccessfulReaction);
	return blogReactionResponse;
}

export function createTrackedBlogReactionClient(
	createTrackedBlogReactionClientOptions: CreateTrackedBlogReactionClientOptions
): BlogReactionClient {
	const { analytics, client } = createTrackedBlogReactionClientOptions;

	return {
		async addReaction(postSlug: string): Promise<BlogReactionResponse> {
			return executeTrackedReactionMutation({
				async executeReactionMutation() {
					return client.addReaction(postSlug);
				},
				trackSuccessfulReaction() {
					analytics.trackReactionAdded(postSlug);
				}
			});
		},
		async loadReaction(postSlug: string): Promise<BlogReactionResponse> {
			return client.loadReaction(postSlug);
		},
		async removeReaction(postSlug: string): Promise<BlogReactionResponse> {
			return executeTrackedReactionMutation({
				async executeReactionMutation() {
					return client.removeReaction(postSlug);
				},
				trackSuccessfulReaction() {
					analytics.trackReactionRemoved(postSlug);
				}
			});
		}
	};
}
