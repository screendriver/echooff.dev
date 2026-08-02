import ky from "ky";
import { match } from "ts-pattern";
import { just, nothing, type Maybe } from "true-myth/maybe";
import { err, ok, type Result } from "true-myth/result";
import { useEffect, useReducer, useRef } from "preact/hooks";
import type { FunctionComponent } from "preact";
import { createKyBlogReactionClient, type BlogReactionClient } from "./blog-reaction-client.ts";
import {
	createBlogReactionCountLabel,
	createInitialBlogPostReactionState,
	reduceBlogPostReactionState,
	type BlogReactionSnapshot,
	type BlogPostReactionState
} from "./blog-reaction-state.ts";
import type { BlogReactionResponse } from "./blog-reaction-schema.ts";
import styles from "./BlogPostReaction.module.scss";

export type Properties = {
	readonly postSlug: string;
	readonly reactionClient?: BlogReactionClient;
};

type BlogReactionOperationResult = Result<BlogReactionResponse, unknown>;

type BlogReactionMutationRequest = () => Promise<BlogReactionResponse>;

type MutationInFlightReference = {
	current: boolean;
};

export const blogReactionUnavailableMessage = "Reactions are temporarily unavailable.";

async function resolveBlogReactionOperation(
	blogReactionOperation: BlogReactionMutationRequest
): Promise<BlogReactionOperationResult> {
	try {
		return ok(await blogReactionOperation());
	} catch (error: unknown) {
		return err(error);
	}
}

function readReactionSnapshot(blogPostReactionState: BlogPostReactionState): Maybe<BlogReactionSnapshot> {
	if (blogPostReactionState.status === "loading") {
		return nothing();
	}

	if (blogPostReactionState.snapshot === undefined) {
		return nothing();
	}

	return just(blogPostReactionState.snapshot);
}

function createBlogReactionMutationRequest(
	blogPostReactionState: BlogPostReactionState,
	blogReactionClient: BlogReactionClient,
	postSlug: string
): Maybe<BlogReactionMutationRequest> {
	return match(blogPostReactionState)
		.with({ status: "ready" }, (currentState) => {
			return just(async function requestReadyReactionMutation(): Promise<BlogReactionResponse> {
				return await (currentState.snapshot.reacted
					? blogReactionClient.removeReaction(postSlug)
					: blogReactionClient.addReaction(postSlug));
			});
		})
		.with({ status: "unavailable" }, (currentState) => {
			const reactionSnapshot = currentState.snapshot;

			if (reactionSnapshot === undefined) {
				return nothing<BlogReactionMutationRequest>();
			}

			return just(async function requestUnavailableReactionMutation(): Promise<BlogReactionResponse> {
				return await (reactionSnapshot.reacted
					? blogReactionClient.removeReaction(postSlug)
					: blogReactionClient.addReaction(postSlug));
			});
		})
		.otherwise(() => {
			return nothing<BlogReactionMutationRequest>();
		});
}

function setMutationInFlight(reference: MutationInFlightReference, value: boolean): void {
	Object.assign(reference, { current: value });
}

export const BlogPostReaction: FunctionComponent<Properties> = (properties) => {
	const { postSlug, reactionClient } = properties;
	const [blogPostReactionState, dispatch] = useReducer(
		reduceBlogPostReactionState,
		undefined,
		createInitialBlogPostReactionState
	);
	const blogReactionClientReference = useRef<BlogReactionClient | undefined>(reactionClient);
	const componentIsMountedReference = useRef(false);
	const mutationInFlightReference = useRef(false);
	const reactionSnapshot = readReactionSnapshot(blogPostReactionState);
	const reactionCountLabel = reactionSnapshot
		.map(function createReactionCountLabel(reactionSnapshotValue) {
			return createBlogReactionCountLabel(reactionSnapshotValue.count);
		})
		.unwrapOr("No reactions yet");
	const buttonPressed = reactionSnapshot
		.map(function readReactedState(reactionSnapshotValue) {
			return reactionSnapshotValue.reacted;
		})
		.unwrapOr(false);
	const buttonDisabled = reactionSnapshot.isNothing || blogPostReactionState.status === "mutating";
	const unavailableStatus = blogPostReactionState.status === "unavailable" ? blogReactionUnavailableMessage : "";

	useEffect(() => {
		componentIsMountedReference.current = true;
		const currentBlogReactionClient = reactionClient ?? createKyBlogReactionClient({ kyInstance: ky });
		blogReactionClientReference.current = currentBlogReactionClient;

		async function loadReaction(): Promise<void> {
			const operationResult = await resolveBlogReactionOperation(async function loadReactionFromClient() {
				return await currentBlogReactionClient.loadReaction(postSlug);
			});

			if (!componentIsMountedReference.current) {
				return;
			}

			operationResult.match({
				Err() {
					dispatch({ type: "load_failed" });
				},
				Ok(blogReactionResponse) {
					dispatch({ response: blogReactionResponse, type: "load_succeeded" });
				}
			});
		}

		void loadReaction();

		return function cleanupReactionEffect(): void {
			componentIsMountedReference.current = false;
			setMutationInFlight(mutationInFlightReference, false);
		};
	}, [postSlug, reactionClient]);

	async function updateReaction(): Promise<void> {
		if (mutationInFlightReference.current || blogReactionClientReference.current === undefined) {
			return;
		}

		const mutationRequest = createBlogReactionMutationRequest(
			blogPostReactionState,
			blogReactionClientReference.current,
			postSlug
		);

		if (mutationRequest.isNothing) {
			return;
		}

		setMutationInFlight(mutationInFlightReference, true);
		dispatch({ type: "mutation_started" });
		const operationResult = await resolveBlogReactionOperation(mutationRequest.value);

		if (componentIsMountedReference.current) {
			operationResult.match({
				Err() {
					dispatch({ type: "mutation_failed" });
				},
				Ok(blogReactionResponse) {
					dispatch({ response: blogReactionResponse, type: "mutation_succeeded" });
				}
			});
		}

		setMutationInFlight(mutationInFlightReference, false);
	}

	function handleReactionButtonActivation(): void {
		void updateReaction();
	}

	return (
		<section
			aria-labelledby="blog-post-reaction-question"
			className={styles.blogPostReaction}
			data-pagefind-ignore="all"
		>
			<h2 id="blog-post-reaction-question">Did this make you think?</h2>
			<div className={styles.blogPostReactionControlRow}>
				<button
					aria-pressed={buttonPressed}
					className={styles.blogPostReactionButton}
					disabled={buttonDisabled}
					onClick={handleReactionButtonActivation}
					type="button"
				>
					<span aria-hidden="true">👍</span>
					{" Yes"}
				</button>
				<span className={styles.blogPostReactionCount}>{reactionCountLabel}</span>
			</div>
			<p aria-live="polite" className={styles.blogPostReactionStatus} role="status">
				{unavailableStatus}
			</p>
			<p className={styles.blogPostReactionDisclosure}>
				Your reaction is remembered in this browser so it can be counted once and removed later.
			</p>
		</section>
	);
};
