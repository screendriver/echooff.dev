import assert from "node:assert";
import { render, type RenderResult, waitFor } from "@testing-library/preact";
import type { FireAndForgetInvoker, FireAndForgetOperation } from "../../browser/fire-and-forget-invoker.ts";
import type { BlogReactionClient, BlogReactionClientFailure } from "./blog-reaction-client.ts";
import type { BlogReactionResponse } from "./blog-reaction-schema.ts";
import { BlogPostReaction } from "./BlogPostReaction.tsx";

export type TestBlogReactionClientOptions = {
	readonly addReaction?: BlogReactionClient["addReaction"];
	readonly loadReaction?: BlogReactionClient["loadReaction"];
	readonly removeReaction?: BlogReactionClient["removeReaction"];
};

export type TestBlogReactionClient = {
	readonly client: BlogReactionClient;
	readonly addedPostSlugs: readonly string[];
	readonly loadedPostSlugs: readonly string[];
	readonly removedPostSlugs: readonly string[];
};

export type TestFireAndForgetInvoker = {
	readonly escapedFailures: readonly unknown[];
	readonly executeNextOperation: () => Promise<void>;
	readonly invocationCount: number;
	readonly invoker: FireAndForgetInvoker;
	readonly invokedOperations: readonly FireAndForgetOperation[];
};

export type LoadedReaction = {
	readonly renderedReaction: RenderResult;
	readonly testBlogReactionClient: TestBlogReactionClient;
	readonly testFireAndForgetInvoker: TestFireAndForgetInvoker;
};

export async function createDefaultAddedReaction(): Promise<BlogReactionResponse> {
	return { count: 1, reacted: true };
}

export async function createDefaultLoadedReaction(): Promise<BlogReactionResponse> {
	return { count: 0, reacted: false };
}

export async function createDefaultRemovedReaction(): Promise<BlogReactionResponse> {
	return { count: 0, reacted: false };
}

export function createExpectedBlogReactionClientFailure(statusCode?: number): BlogReactionClientFailure {
	const failure = Object.assign(new Error("expected blog reaction client failure"), {
		kind: "blog_reaction_client_failure" as const
	});

	if (statusCode === undefined) {
		return failure;
	}

	return Object.assign(failure, { statusCode });
}

export function createTestBlogReactionClient(
	testBlogReactionClientOptions: TestBlogReactionClientOptions = {}
): TestBlogReactionClient {
	const {
		addReaction = createDefaultAddedReaction,
		loadReaction = createDefaultLoadedReaction,
		removeReaction = createDefaultRemovedReaction
	} = testBlogReactionClientOptions;
	const addedPostSlugs: string[] = [];
	const loadedPostSlugs: string[] = [];
	const removedPostSlugs: string[] = [];

	return {
		addedPostSlugs,
		client: {
			async addReaction(postSlug) {
				addedPostSlugs.push(postSlug);
				return addReaction(postSlug);
			},
			async loadReaction(postSlug) {
				loadedPostSlugs.push(postSlug);
				return loadReaction(postSlug);
			},
			async removeReaction(postSlug) {
				removedPostSlugs.push(postSlug);
				return removeReaction(postSlug);
			}
		},
		loadedPostSlugs,
		removedPostSlugs
	};
}

export function createTestFireAndForgetInvoker(): TestFireAndForgetInvoker {
	const escapedFailures: unknown[] = [];
	const invokedOperations: FireAndForgetOperation[] = [];
	let nextOperationIndex = 0;

	return {
		escapedFailures,
		async executeNextOperation(): Promise<void> {
			const operation = invokedOperations[nextOperationIndex];

			if (operation === undefined) {
				throw new Error("Expected a recorded fire-and-forget operation.");
			}

			nextOperationIndex += 1;

			try {
				await operation();
			} catch (error) {
				escapedFailures.push(error);
			}
		},
		get invocationCount(): number {
			return invokedOperations.length;
		},
		invokedOperations,
		invoker: {
			invoke(operation): void {
				invokedOperations.push(operation);
			}
		}
	};
}

export function renderBlogPostReaction(
	testBlogReactionClient: TestBlogReactionClient,
	testFireAndForgetInvoker: TestFireAndForgetInvoker
): RenderResult {
	return render(
		<BlogPostReaction
			fireAndForgetInvoker={testFireAndForgetInvoker.invoker}
			postSlug="first-post"
			reactionClient={testBlogReactionClient.client}
		/>
	);
}

export function readReactionButton(renderedReaction: RenderResult): HTMLButtonElement {
	const reactionButton = renderedReaction.getByRole("button", { name: "Yes" });

	if (!(reactionButton instanceof HTMLButtonElement)) {
		throw new TypeError("Expected the reaction control to be a button.");
	}

	return reactionButton;
}

export function readReactionCountLabel(renderedReaction: RenderResult): HTMLElement {
	const reactionCountLabel = renderedReaction.getByText(/^(?:No reactions yet|\d+ reactions?)$/u);

	if (!(reactionCountLabel instanceof HTMLElement)) {
		throw new TypeError("Expected the reaction count label to be an HTML element.");
	}

	return reactionCountLabel;
}

export function createExpectedReactionCountLabel(reactionCount: number): string {
	if (reactionCount === 0) {
		return "No reactions yet";
	}

	if (reactionCount === 1) {
		return "1 reaction";
	}

	return `${reactionCount} reactions`;
}

export async function renderLoadedReaction(reactionResponse: BlogReactionResponse): Promise<LoadedReaction> {
	const testBlogReactionClient = createTestBlogReactionClient({
		async loadReaction() {
			return reactionResponse;
		}
	});
	const testFireAndForgetInvoker = createTestFireAndForgetInvoker();

	const renderedReaction = renderBlogPostReaction(testBlogReactionClient, testFireAndForgetInvoker);
	await testFireAndForgetInvoker.executeNextOperation();
	await waitFor(() => {
		assert.deepStrictEqual(testBlogReactionClient.loadedPostSlugs, ["first-post"]);
		const expectedReactionCountLabel = createExpectedReactionCountLabel(reactionResponse.count);

		assert.strictEqual(readReactionCountLabel(renderedReaction).textContent, expectedReactionCountLabel);
	});

	return { renderedReaction, testBlogReactionClient, testFireAndForgetInvoker };
}
