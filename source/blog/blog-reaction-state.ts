import { match } from "ts-pattern";
import type { BlogReactionResponse } from "./blog-reaction-schema.ts";

export type BlogReactionSnapshot = {
	readonly count: number;
	readonly reacted: boolean;
};

type BlogPostReactionLoadingState = {
	readonly status: "loading";
};

type BlogPostReactionReadyState = {
	readonly snapshot: BlogReactionSnapshot;
	readonly status: "ready";
};

type BlogPostReactionMutatingState = {
	readonly snapshot: BlogReactionSnapshot;
	readonly status: "mutating";
};

type BlogPostReactionUnavailableState = {
	readonly snapshot?: BlogReactionSnapshot;
	readonly status: "unavailable";
};

type BlogPostReactionStateByStatus = {
	readonly loading: BlogPostReactionLoadingState;
	readonly mutating: BlogPostReactionMutatingState;
	readonly ready: BlogPostReactionReadyState;
	readonly unavailable: BlogPostReactionUnavailableState;
};

export type BlogPostReactionState = BlogPostReactionStateByStatus[keyof BlogPostReactionStateByStatus];

type BlogPostReactionLoadSucceededAction = {
	readonly response: BlogReactionResponse;
	readonly type: "load_succeeded";
};

type BlogPostReactionLoadFailedAction = {
	readonly type: "load_failed";
};

type BlogPostReactionMutationStartedAction = {
	readonly type: "mutation_started";
};

type BlogPostReactionMutationSucceededAction = {
	readonly response: BlogReactionResponse;
	readonly type: "mutation_succeeded";
};

type BlogPostReactionMutationFailedAction = {
	readonly type: "mutation_failed";
};

type BlogPostReactionActionByType = {
	readonly load_failed: BlogPostReactionLoadFailedAction;
	readonly load_succeeded: BlogPostReactionLoadSucceededAction;
	readonly mutation_failed: BlogPostReactionMutationFailedAction;
	readonly mutation_started: BlogPostReactionMutationStartedAction;
	readonly mutation_succeeded: BlogPostReactionMutationSucceededAction;
};

export type BlogPostReactionAction = BlogPostReactionActionByType[keyof BlogPostReactionActionByType];

export function createInitialBlogPostReactionState(): BlogPostReactionState {
	return { status: "loading" };
}

function createBlogReactionSnapshot(blogReactionResponse: BlogReactionResponse): BlogReactionSnapshot {
	return {
		count: blogReactionResponse.count,
		reacted: blogReactionResponse.reacted
	};
}

function reduceBlogReactionLoadSucceeded(
	blogPostReactionState: BlogPostReactionState,
	blogReactionResponse: BlogReactionResponse
): BlogPostReactionState {
	return match(blogPostReactionState)
		.with({ status: "loading" }, () => {
			return {
				snapshot: createBlogReactionSnapshot(blogReactionResponse),
				status: "ready" as const
			};
		})
		.otherwise((currentState) => {
			return currentState;
		});
}

function reduceBlogReactionLoadFailed(blogPostReactionState: BlogPostReactionState): BlogPostReactionState {
	return match(blogPostReactionState)
		.with({ status: "loading" }, () => {
			return { status: "unavailable" as const };
		})
		.otherwise((currentState) => {
			return currentState;
		});
}

function reduceBlogReactionMutationStarted(blogPostReactionState: BlogPostReactionState): BlogPostReactionState {
	return match(blogPostReactionState)
		.with({ status: "ready" }, (currentState) => {
			return {
				snapshot: currentState.snapshot,
				status: "mutating" as const
			};
		})
		.with({ status: "unavailable" }, (currentState) => {
			if (currentState.snapshot === undefined) {
				return currentState;
			}

			return {
				snapshot: currentState.snapshot,
				status: "mutating" as const
			};
		})
		.otherwise((currentState) => {
			return currentState;
		});
}

function reduceBlogReactionMutationSucceeded(
	blogPostReactionState: BlogPostReactionState,
	blogReactionResponse: BlogReactionResponse
): BlogPostReactionState {
	return match(blogPostReactionState)
		.with({ status: "mutating" }, () => {
			return {
				snapshot: createBlogReactionSnapshot(blogReactionResponse),
				status: "ready" as const
			};
		})
		.otherwise((currentState) => {
			return currentState;
		});
}

function reduceBlogReactionMutationFailed(blogPostReactionState: BlogPostReactionState): BlogPostReactionState {
	return match(blogPostReactionState)
		.with({ status: "mutating" }, (currentState) => {
			return {
				snapshot: currentState.snapshot,
				status: "unavailable" as const
			};
		})
		.otherwise((currentState) => {
			return currentState;
		});
}

export function reduceBlogPostReactionState(
	blogPostReactionState: BlogPostReactionState,
	blogPostReactionAction: BlogPostReactionAction
): BlogPostReactionState {
	return match(blogPostReactionAction)
		.with({ type: "load_succeeded" }, (action) => {
			return reduceBlogReactionLoadSucceeded(blogPostReactionState, action.response);
		})
		.with({ type: "load_failed" }, () => {
			return reduceBlogReactionLoadFailed(blogPostReactionState);
		})
		.with({ type: "mutation_started" }, () => {
			return reduceBlogReactionMutationStarted(blogPostReactionState);
		})
		.with({ type: "mutation_succeeded" }, (action) => {
			return reduceBlogReactionMutationSucceeded(blogPostReactionState, action.response);
		})
		.with({ type: "mutation_failed" }, () => {
			return reduceBlogReactionMutationFailed(blogPostReactionState);
		})
		.exhaustive();
}

export function createBlogReactionCountLabel(reactionCount: number): string {
	if (reactionCount === 0) {
		return "No reactions yet";
	}

	if (reactionCount === 1) {
		return "1 reaction";
	}

	return `${reactionCount} reactions`;
}
