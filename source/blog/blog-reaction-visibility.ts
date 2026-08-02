import { just, nothing, type Maybe } from "true-myth/maybe";

export type BlogPostReactionVisibilityEntry = {
	readonly isIntersecting: boolean;
	readonly target: unknown;
};

export type BlogPostReactionVisibilityObserver = {
	readonly disconnect: () => void;
	readonly observe: (target: unknown) => void;
};

export type BlogPostReactionVisibilityOptions = {
	readonly rootMargin: string;
};

export type BlogPostReactionVisibilityDependencies = {
	readonly createIntersectionObserver: (
		callback: (entries: readonly BlogPostReactionVisibilityEntry[]) => void,
		options: BlogPostReactionVisibilityOptions
	) => BlogPostReactionVisibilityObserver;
	readonly supportsIntersectionObserver: () => boolean;
};

export type InitializeVisibleBlogPostReactionOptions = {
	readonly initializeBlogPostReaction: () => Promise<void>;
	readonly reactionRoot: unknown;
	readonly visibilityDependencies: BlogPostReactionVisibilityDependencies;
};

export const blogPostReactionVisibilityRootMargin = "300px 0px";

export function initializeVisibleBlogPostReaction(
	initializeVisibleBlogPostReactionOptions: InitializeVisibleBlogPostReactionOptions
): void {
	const { initializeBlogPostReaction, reactionRoot, visibilityDependencies } =
		initializeVisibleBlogPostReactionOptions;
	let hasInitialized = false;
	let visibilityObserver: Maybe<BlogPostReactionVisibilityObserver> = nothing();

	async function startBlogPostReactionInitialization(): Promise<void> {
		try {
			await initializeBlogPostReaction();
		} catch {
			// The reaction initializer owns the user-facing unavailable state.
		}
	}

	function initializeOnce(): void {
		if (hasInitialized) {
			return;
		}

		hasInitialized = true;
		if (visibilityObserver.isJust) {
			visibilityObserver.value.disconnect();
		}
		void startBlogPostReactionInitialization();
	}

	if (!visibilityDependencies.supportsIntersectionObserver()) {
		initializeOnce();
		return;
	}

	const createdVisibilityObserver = visibilityDependencies.createIntersectionObserver(
		(entries) => {
			const hasMatchingVisibleEntry = entries.some((entry) => {
				return entry.target === reactionRoot && entry.isIntersecting;
			});

			if (hasMatchingVisibleEntry) {
				initializeOnce();
			}
		},
		{ rootMargin: blogPostReactionVisibilityRootMargin }
	);
	visibilityObserver = just(createdVisibilityObserver);

	createdVisibilityObserver.observe(reactionRoot);
}
