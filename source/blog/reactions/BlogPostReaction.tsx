import { useEffect, useRef, useState } from "preact/hooks";
import type { ComponentChildren } from "preact";
import type { FireAndForgetInvoker } from "../../browser/fire-and-forget-invoker.ts";
import { isBlogReactionClientFailure, type BlogReactionClient } from "./blog-reaction-client.ts";
import type { BlogReactionResponse } from "./blog-reaction-schema.ts";

export type Properties = {
	readonly fireAndForgetInvoker: FireAndForgetInvoker;
	readonly postSlug: string;
	readonly reactionClient: BlogReactionClient;
};

type BlogPostReactionLoadingState = {
	readonly status: "loading";
};

type BlogPostReactionMutatingState = {
	readonly snapshot: BlogReactionResponse;
	readonly status: "mutating";
};

type BlogPostReactionReadyState = {
	readonly snapshot: BlogReactionResponse;
	readonly status: "ready";
};

type BlogPostReactionUnavailableState = {
	readonly snapshot?: BlogReactionResponse;
	readonly status: "unavailable";
};

type BlogPostReactionStateByStatus = {
	readonly loading: BlogPostReactionLoadingState;
	readonly mutating: BlogPostReactionMutatingState;
	readonly ready: BlogPostReactionReadyState;
	readonly unavailable: BlogPostReactionUnavailableState;
};

type BlogPostReactionState = BlogPostReactionStateByStatus[keyof BlogPostReactionStateByStatus];

type BlogPostReactionStateSetter = (blogPostReactionState: BlogPostReactionState) => void;

type BlogPostReactionMountReference = {
	readonly current: boolean;
};

type BlogPostReactionView = {
	readonly buttonDisabled: boolean;
	readonly buttonPressed: boolean;
	readonly reactionCountLabel: string;
	readonly statusMessage: string;
};

export const blogReactionUnavailableMessage = "Reactions are temporarily unavailable.";

function createBlogReactionCountLabel(reactionCount: number): string {
	if (reactionCount === 0) {
		return "No reactions yet";
	}

	if (reactionCount === 1) {
		return "1 reaction";
	}

	return `${reactionCount} reactions`;
}

function applyBlogPostReactionMutationResponse(
	componentIsMountedReference: BlogPostReactionMountReference,
	setBlogPostReactionState: BlogPostReactionStateSetter,
	currentReactionSnapshot: BlogReactionResponse,
	blogReactionResponse: BlogReactionResponse | undefined
): boolean {
	if (!componentIsMountedReference.current) {
		return false;
	}

	if (blogReactionResponse === undefined) {
		setBlogPostReactionState({
			snapshot: currentReactionSnapshot,
			status: "unavailable"
		});
		return true;
	}

	setBlogPostReactionState({
		snapshot: blogReactionResponse,
		status: "ready"
	});
	return true;
}

function restoreBlogPostReactionSnapshotAfterUnexpectedFailure(
	componentIsMountedReference: BlogPostReactionMountReference,
	setBlogPostReactionState: BlogPostReactionStateSetter,
	currentReactionSnapshot: BlogReactionResponse,
	hasAppliedExpectedReactionState: boolean
): void {
	if (hasAppliedExpectedReactionState || !componentIsMountedReference.current) {
		return;
	}

	setBlogPostReactionState({
		snapshot: currentReactionSnapshot,
		status: "ready"
	});
}

async function resolveBlogReactionResponse(
	readBlogReactionResponse: () => Promise<BlogReactionResponse>
): Promise<BlogReactionResponse | undefined> {
	try {
		return await readBlogReactionResponse();
	} catch (error) {
		if (isBlogReactionClientFailure(error)) {
			return undefined;
		}

		throw error;
	}
}

async function requestReactionMutation(
	reactionClient: BlogReactionClient,
	currentReactionSnapshot: BlogReactionResponse,
	postSlug: string
): Promise<BlogReactionResponse> {
	if (currentReactionSnapshot.reacted) {
		return reactionClient.removeReaction(postSlug);
	}

	return reactionClient.addReaction(postSlug);
}

function toBlogPostReactionView(blogPostReactionState: BlogPostReactionState): BlogPostReactionView {
	if (blogPostReactionState.status === "loading") {
		return {
			buttonDisabled: true,
			buttonPressed: false,
			reactionCountLabel: createBlogReactionCountLabel(0),
			statusMessage: ""
		};
	}

	const reactionSnapshot = blogPostReactionState.snapshot;

	if (reactionSnapshot === undefined) {
		return {
			buttonDisabled: true,
			buttonPressed: false,
			reactionCountLabel: createBlogReactionCountLabel(0),
			statusMessage: blogReactionUnavailableMessage
		};
	}

	return {
		buttonDisabled: blogPostReactionState.status === "mutating",
		buttonPressed: reactionSnapshot.reacted,
		reactionCountLabel: createBlogReactionCountLabel(reactionSnapshot.count),
		statusMessage: blogPostReactionState.status === "unavailable" ? blogReactionUnavailableMessage : ""
	};
}

export function BlogPostReaction(properties: Properties): ComponentChildren {
	const { fireAndForgetInvoker, postSlug, reactionClient } = properties;
	const [blogPostReactionState, setBlogPostReactionState] = useState<BlogPostReactionState>({ status: "loading" });
	const componentIsMountedReference = useRef(false);
	const mutationInFlightReference = useRef(false);
	const { buttonDisabled, buttonPressed, reactionCountLabel, statusMessage } =
		toBlogPostReactionView(blogPostReactionState);

	useEffect(() => {
		componentIsMountedReference.current = true;

		async function loadReaction(): Promise<void> {
			const blogReactionResponse = await resolveBlogReactionResponse(
				async function readBlogReactionResponse(): Promise<BlogReactionResponse> {
					return reactionClient.loadReaction(postSlug);
				}
			);

			if (!componentIsMountedReference.current) {
				return;
			}

			if (blogReactionResponse === undefined) {
				setBlogPostReactionState({ status: "unavailable" });
				return;
			}

			setBlogPostReactionState({
				snapshot: blogReactionResponse,
				status: "ready"
			});
		}

		fireAndForgetInvoker.invoke(loadReaction);

		return function cleanupBlogPostReactionEffect(): void {
			componentIsMountedReference.current = false;
			mutationInFlightReference.current = false;
		};
	}, [fireAndForgetInvoker, postSlug, reactionClient]);

	async function updateReaction(): Promise<void> {
		if (mutationInFlightReference.current) {
			return;
		}

		if (blogPostReactionState.status === "loading") {
			return;
		}

		const currentReactionSnapshot = blogPostReactionState.snapshot;

		if (currentReactionSnapshot === undefined) {
			return;
		}

		mutationInFlightReference.current = true;
		setBlogPostReactionState({
			snapshot: currentReactionSnapshot,
			status: "mutating"
		});

		let hasAppliedExpectedReactionState = false;

		try {
			const blogReactionResponse = await resolveBlogReactionResponse(
				async function readBlogReactionResponse(): Promise<BlogReactionResponse> {
					return requestReactionMutation(reactionClient, currentReactionSnapshot, postSlug);
				}
			);
			hasAppliedExpectedReactionState = applyBlogPostReactionMutationResponse(
				componentIsMountedReference,
				setBlogPostReactionState,
				currentReactionSnapshot,
				blogReactionResponse
			);
		} finally {
			// Preact refs are the intentional mutable seam for this in-flight guard.
			// eslint-disable-next-line require-atomic-updates -- Preact refs are the intentional mutable seam for this in-flight guard.
			mutationInFlightReference.current = false;
			restoreBlogPostReactionSnapshotAfterUnexpectedFailure(
				componentIsMountedReference,
				setBlogPostReactionState,
				currentReactionSnapshot,
				hasAppliedExpectedReactionState
			);
		}
	}

	function handleReactionButtonActivation(): void {
		fireAndForgetInvoker.invoke(updateReaction);
	}

	return (
		<section
			aria-labelledby="blog-post-reaction-question"
			className="blog-post-reaction"
			data-pagefind-ignore="all"
		>
			<h2 id="blog-post-reaction-question">Did this make you think?</h2>
			<div className="blog-post-reaction-control-row">
				<button
					aria-pressed={buttonPressed}
					className="blog-post-reaction-button"
					disabled={buttonDisabled}
					onClick={handleReactionButtonActivation}
					type="button"
				>
					<span aria-hidden="true">👍</span>
					{" Yes"}
				</button>
				<span className="blog-post-reaction-count">{reactionCountLabel}</span>
			</div>
			<p className="blog-post-reaction-status" role="status">
				{statusMessage}
			</p>
		</section>
	);
}
