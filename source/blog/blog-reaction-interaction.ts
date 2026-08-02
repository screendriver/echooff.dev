import { just, nothing, type Maybe } from "true-myth/maybe";
import type { BlogReactionClient } from "./blog-reaction-client.ts";
import type { BlogReactionResponse } from "./blog-reaction-schema.ts";

export type BlogPostReactionView = {
	readonly registerActivationListener: (listener: () => void) => void;
	readonly setButtonDisabled: (disabled: boolean) => void;
	readonly writeAriaPressed: (reacted: boolean) => void;
	readonly writeReactionCountLabel: (label: string) => void;
	readonly writeStatus: (status: string) => void;
};

export type InitializeBlogPostReactionOptions = {
	readonly blogReactionClient: BlogReactionClient;
	readonly postSlug: string;
	readonly view: BlogPostReactionView;
};

export const blogReactionUnavailableMessage = "Reactions are temporarily unavailable.";

type BlogReactionInteractionState = {
	currentBlogReactionResponse: Maybe<BlogReactionResponse>;
	requestInFlight: boolean;
};

export function createBlogReactionCountLabel(count: number): string {
	if (count === 0) {
		return "No reactions yet";
	}

	if (count === 1) {
		return "1 reaction";
	}

	return `${count} reactions`;
}

function renderBlogReactionState(view: BlogPostReactionView, blogReactionResponse: BlogReactionResponse): void {
	view.writeReactionCountLabel(createBlogReactionCountLabel(blogReactionResponse.count));
	view.writeAriaPressed(blogReactionResponse.reacted);
	view.writeStatus("");
}

export async function initializeBlogPostReaction(
	initializeBlogPostReactionOptions: InitializeBlogPostReactionOptions
): Promise<void> {
	const { blogReactionClient, postSlug, view } = initializeBlogPostReactionOptions;
	const blogReactionInteractionState: BlogReactionInteractionState = {
		currentBlogReactionResponse: nothing(),
		requestInFlight: false
	};

	function beginBlogReactionRequest(): void {
		blogReactionInteractionState.requestInFlight = true;
		view.setButtonDisabled(true);
	}

	function finishBlogReactionRequest(): void {
		blogReactionInteractionState.requestInFlight = false;
		view.setButtonDisabled(false);
	}

	function recordBlogReactionResponse(blogReactionResponse: BlogReactionResponse): void {
		blogReactionInteractionState.currentBlogReactionResponse = just(blogReactionResponse);
		renderBlogReactionState(view, blogReactionResponse);
	}

	function recordBlogReactionLoadFailure(): void {
		blogReactionInteractionState.currentBlogReactionResponse = nothing();
		view.writeStatus(blogReactionUnavailableMessage);
	}

	async function loadReaction(): Promise<void> {
		if (blogReactionInteractionState.requestInFlight) {
			return;
		}

		beginBlogReactionRequest();

		try {
			const blogReactionResponse = await blogReactionClient.loadReaction(postSlug);
			recordBlogReactionResponse(blogReactionResponse);
		} catch {
			recordBlogReactionLoadFailure();
		} finally {
			finishBlogReactionRequest();
		}
	}

	async function requestReactionMutation(): Promise<BlogReactionResponse> {
		if (blogReactionInteractionState.currentBlogReactionResponse.isNothing) {
			return await blogReactionClient.loadReaction(postSlug);
		}

		if (blogReactionInteractionState.currentBlogReactionResponse.value.reacted) {
			return await blogReactionClient.removeReaction(postSlug);
		}

		return await blogReactionClient.addReaction(postSlug);
	}

	async function handleActivation(): Promise<void> {
		if (blogReactionInteractionState.requestInFlight) {
			return;
		}

		if (blogReactionInteractionState.currentBlogReactionResponse.isNothing) {
			await loadReaction();
			return;
		}

		beginBlogReactionRequest();

		try {
			const blogReactionResponse = await requestReactionMutation();
			recordBlogReactionResponse(blogReactionResponse);
		} catch {
			view.writeStatus(blogReactionUnavailableMessage);
		} finally {
			finishBlogReactionRequest();
		}
	}

	view.setButtonDisabled(true);
	view.registerActivationListener(() => {
		void handleActivation();
	});
	await loadReaction();
}
