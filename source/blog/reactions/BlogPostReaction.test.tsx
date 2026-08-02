import assert from "node:assert";
import { act, cleanup, fireEvent, render, type RenderResult, waitFor } from "@testing-library/preact";
import { setup, suite, teardown, test } from "mocha";
import type { FireAndForgetInvoker, FireAndForgetOperation } from "../../browser/fire-and-forget-invoker.ts";
import { createJsdomTestEnvironment, type JsdomTestEnvironment } from "../../test-support/jsdom-test-environment.ts";
import type { BlogReactionClient } from "./blog-reaction-client.ts";
import type { BlogReactionResponse } from "./blog-reaction-schema.ts";
import { BlogPostReaction, blogReactionUnavailableMessage } from "./BlogPostReaction.tsx";

type TestBlogReactionClientOptions = {
	readonly addReaction?: BlogReactionClient["addReaction"];
	readonly loadReaction?: BlogReactionClient["loadReaction"];
	readonly removeReaction?: BlogReactionClient["removeReaction"];
};

type TestBlogReactionClient = {
	readonly client: BlogReactionClient;
	readonly addedPostSlugs: readonly string[];
	readonly loadedPostSlugs: readonly string[];
	readonly removedPostSlugs: readonly string[];
};

type TestFireAndForgetInvoker = {
	readonly escapedFailures: readonly unknown[];
	readonly executeNextOperation: () => Promise<void>;
	readonly invocationCount: number;
	readonly invoker: FireAndForgetInvoker;
	readonly invokedOperations: readonly FireAndForgetOperation[];
};

type LoadedReaction = {
	readonly renderedReaction: RenderResult;
	readonly testBlogReactionClient: TestBlogReactionClient;
	readonly testFireAndForgetInvoker: TestFireAndForgetInvoker;
};

async function createDefaultAddedReaction(): Promise<BlogReactionResponse> {
	return { count: 1, reacted: true };
}

async function createDefaultLoadedReaction(): Promise<BlogReactionResponse> {
	return { count: 0, reacted: false };
}

async function createDefaultRemovedReaction(): Promise<BlogReactionResponse> {
	return { count: 0, reacted: false };
}

function createTestBlogReactionClient(
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

function createTestFireAndForgetInvoker(): TestFireAndForgetInvoker {
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

function renderBlogPostReaction(
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

function readReactionButton(renderedReaction: RenderResult): HTMLButtonElement {
	const reactionButton = renderedReaction.getByRole("button", { name: "Yes" });

	if (!(reactionButton instanceof HTMLButtonElement)) {
		throw new TypeError("Expected the reaction control to be a button.");
	}

	return reactionButton;
}

function readReactionCountLabel(renderedReaction: RenderResult): HTMLElement {
	const reactionCountLabel = renderedReaction.getByText(/^(?:No reactions yet|\d+ reactions?)$/u);

	if (!(reactionCountLabel instanceof HTMLElement)) {
		throw new TypeError("Expected the reaction count label to be an HTML element.");
	}

	return reactionCountLabel;
}

function createExpectedReactionCountLabel(reactionCount: number): string {
	if (reactionCount === 0) {
		return "No reactions yet";
	}

	if (reactionCount === 1) {
		return "1 reaction";
	}

	return `${reactionCount} reactions`;
}

async function renderLoadedReaction(reactionResponse: BlogReactionResponse): Promise<LoadedReaction> {
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

const jsdomTestEnvironment: JsdomTestEnvironment = createJsdomTestEnvironment();

suite("BlogPostReaction component integration", function () {
	setup(function () {
		jsdomTestEnvironment.install();
	});

	teardown(function () {
		cleanup();
		jsdomTestEnvironment.restore();
	});

	test("renders useful server-compatible initial markup before loading", function () {
		const deferredLoadReaction = Promise.withResolvers<BlogReactionResponse>();
		const testBlogReactionClient = createTestBlogReactionClient({
			async loadReaction() {
				return deferredLoadReaction.promise;
			}
		});
		const testFireAndForgetInvoker = createTestFireAndForgetInvoker();

		const renderedReaction = renderBlogPostReaction(testBlogReactionClient, testFireAndForgetInvoker);

		assert.strictEqual(testFireAndForgetInvoker.invocationCount, 1);
		assert.deepStrictEqual(testBlogReactionClient.loadedPostSlugs, []);

		assert.strictEqual(
			renderedReaction.getByRole("heading", { name: "Did this make you think?" }).textContent,
			"Did this make you think?"
		);
		assert.strictEqual(renderedReaction.getByText("👍").textContent, "👍");
		assert.strictEqual(renderedReaction.getByText("No reactions yet").textContent, "No reactions yet");
		assert.strictEqual(readReactionButton(renderedReaction).disabled, true);
		assert.strictEqual(readReactionButton(renderedReaction).getAttribute("aria-pressed"), "false");
		assert.strictEqual(renderedReaction.getByRole("status").getAttribute("role"), "status");
		assert.strictEqual(renderedReaction.queryByText(/remembered in this browser/u), null);
	});

	test("loads the current reaction exactly once for the supplied post slug", async function () {
		const testBlogReactionClient = createTestBlogReactionClient();
		const testFireAndForgetInvoker = createTestFireAndForgetInvoker();

		renderBlogPostReaction(testBlogReactionClient, testFireAndForgetInvoker);
		await testFireAndForgetInvoker.executeNextOperation();
		await waitFor(() => {
			assert.deepStrictEqual(testBlogReactionClient.loadedPostSlugs, ["first-post"]);
		});

		assert.deepStrictEqual(testBlogReactionClient.loadedPostSlugs, ["first-post"]);
		assert.strictEqual(testFireAndForgetInvoker.invocationCount, 1);
	});

	test("renders zero reactions and enables the button after loading", async function () {
		const { renderedReaction } = await renderLoadedReaction({ count: 0, reacted: false });

		assert.strictEqual(readReactionCountLabel(renderedReaction).textContent, "No reactions yet");
		assert.strictEqual(readReactionButton(renderedReaction).disabled, false);
		assert.strictEqual(readReactionButton(renderedReaction).getAttribute("aria-pressed"), "false");
	});

	test("renders one reaction with singular wording", async function () {
		const { renderedReaction } = await renderLoadedReaction({ count: 1, reacted: true });

		assert.strictEqual(readReactionCountLabel(renderedReaction).textContent, "1 reaction");
		assert.strictEqual(readReactionButton(renderedReaction).getAttribute("aria-pressed"), "true");
	});

	test("renders several reactions with plural wording", async function () {
		const { renderedReaction } = await renderLoadedReaction({ count: 7, reacted: false });

		assert.strictEqual(readReactionCountLabel(renderedReaction).textContent, "7 reactions");
	});

	test("renders the unavailable state when initial loading fails", async function () {
		const testBlogReactionClient = createTestBlogReactionClient({
			async loadReaction() {
				throw new Error("network failure");
			}
		});
		const testFireAndForgetInvoker = createTestFireAndForgetInvoker();

		const renderedReaction = renderBlogPostReaction(testBlogReactionClient, testFireAndForgetInvoker);
		await testFireAndForgetInvoker.executeNextOperation();
		await waitFor(() => {
			assert.strictEqual(renderedReaction.getByRole("status").textContent, blogReactionUnavailableMessage);
		});

		assert.strictEqual(readReactionButton(renderedReaction).disabled, true);
		assert.deepStrictEqual(testFireAndForgetInvoker.escapedFailures, []);
	});

	test("adds an unpressed reaction with the supplied post slug", async function () {
		const { renderedReaction, testBlogReactionClient, testFireAndForgetInvoker } = await renderLoadedReaction({
			count: 0,
			reacted: false
		});

		await act(() => {
			fireEvent.click(readReactionButton(renderedReaction));
		});
		await testFireAndForgetInvoker.executeNextOperation();
		await waitFor(() => {
			assert.deepStrictEqual(testBlogReactionClient.addedPostSlugs, ["first-post"]);
		});
		assert.strictEqual(testFireAndForgetInvoker.invocationCount, 2);
	});

	test("removes a pressed reaction with the supplied post slug", async function () {
		const { renderedReaction, testBlogReactionClient, testFireAndForgetInvoker } = await renderLoadedReaction({
			count: 2,
			reacted: true
		});

		await act(() => {
			fireEvent.click(readReactionButton(renderedReaction));
		});
		await testFireAndForgetInvoker.executeNextOperation();
		await waitFor(() => {
			assert.deepStrictEqual(testBlogReactionClient.removedPostSlugs, ["first-post"]);
		});
		assert.strictEqual(testFireAndForgetInvoker.invocationCount, 2);
	});

	test("disables repeated activation and preserves the count while mutating", async function () {
		const deferredAddReaction = Promise.withResolvers<BlogReactionResponse>();
		const testBlogReactionClient = createTestBlogReactionClient({
			async addReaction() {
				return deferredAddReaction.promise;
			},
			async loadReaction() {
				return { count: 4, reacted: false };
			}
		});
		const testFireAndForgetInvoker = createTestFireAndForgetInvoker();

		const renderedReaction = renderBlogPostReaction(testBlogReactionClient, testFireAndForgetInvoker);
		await testFireAndForgetInvoker.executeNextOperation();
		await waitFor(() => {
			assert.strictEqual(readReactionCountLabel(renderedReaction).textContent, "4 reactions");
		});
		await act(() => {
			fireEvent.click(readReactionButton(renderedReaction));
		});
		const mutationOperation = testFireAndForgetInvoker.executeNextOperation();
		await waitFor(() => {
			assert.deepStrictEqual(testBlogReactionClient.addedPostSlugs, ["first-post"]);
		});
		await act(() => {
			fireEvent.click(readReactionButton(renderedReaction));
		});

		assert.strictEqual(testBlogReactionClient.addedPostSlugs.length, 1);
		assert.strictEqual(readReactionButton(renderedReaction).disabled, true);
		assert.strictEqual(readReactionCountLabel(renderedReaction).textContent, "4 reactions");

		deferredAddReaction.resolve({ count: 5, reacted: true });
		await mutationOperation;
		await waitFor(() => {
			assert.strictEqual(readReactionCountLabel(renderedReaction).textContent, "5 reactions");
		});

		assert.strictEqual(readReactionButton(renderedReaction).getAttribute("aria-pressed"), "true");
		assert.strictEqual(readReactionButton(renderedReaction).disabled, false);
	});

	test("preserves the valid snapshot and re-enables the button after mutation failure", async function () {
		const testBlogReactionClient = createTestBlogReactionClient({
			async loadReaction() {
				return { count: 2, reacted: true };
			},
			async removeReaction() {
				throw new Error("network failure");
			}
		});
		const testFireAndForgetInvoker = createTestFireAndForgetInvoker();

		const renderedReaction = renderBlogPostReaction(testBlogReactionClient, testFireAndForgetInvoker);
		await testFireAndForgetInvoker.executeNextOperation();
		await waitFor(() => {
			assert.strictEqual(readReactionCountLabel(renderedReaction).textContent, "2 reactions");
		});
		await act(() => {
			fireEvent.click(readReactionButton(renderedReaction));
		});
		await testFireAndForgetInvoker.executeNextOperation();
		await waitFor(() => {
			assert.strictEqual(renderedReaction.getByRole("status").textContent, blogReactionUnavailableMessage);
		});

		assert.strictEqual(readReactionCountLabel(renderedReaction).textContent, "2 reactions");
		assert.strictEqual(readReactionButton(renderedReaction).getAttribute("aria-pressed"), "true");
		assert.strictEqual(readReactionButton(renderedReaction).disabled, false);
		assert.strictEqual(renderedReaction.getByRole("status").textContent, blogReactionUnavailableMessage);
		assert.deepStrictEqual(testFireAndForgetInvoker.escapedFailures, []);
	});

	test("does not update state after unmount during initial loading", async function () {
		const deferredLoadReaction = Promise.withResolvers<BlogReactionResponse>();
		const testBlogReactionClient = createTestBlogReactionClient({
			async loadReaction() {
				return deferredLoadReaction.promise;
			}
		});
		const testFireAndForgetInvoker = createTestFireAndForgetInvoker();
		const renderedReaction = renderBlogPostReaction(testBlogReactionClient, testFireAndForgetInvoker);
		const loadingOperation = testFireAndForgetInvoker.executeNextOperation();

		renderedReaction.unmount();
		await act(async () => {
			deferredLoadReaction.resolve({ count: 1, reacted: true });
			await loadingOperation;
		});

		assert.strictEqual(renderedReaction.container.innerHTML, "");
	});

	test("does not update state after unmount during mutation", async function () {
		const deferredAddReaction = Promise.withResolvers<BlogReactionResponse>();
		const testBlogReactionClient = createTestBlogReactionClient({
			async addReaction() {
				return deferredAddReaction.promise;
			},
			async loadReaction() {
				return { count: 0, reacted: false };
			}
		});
		const testFireAndForgetInvoker = createTestFireAndForgetInvoker();
		const renderedReaction = renderBlogPostReaction(testBlogReactionClient, testFireAndForgetInvoker);
		await testFireAndForgetInvoker.executeNextOperation();
		await waitFor(() => {
			assert.strictEqual(readReactionCountLabel(renderedReaction).textContent, "No reactions yet");
		});
		await act(() => {
			fireEvent.click(readReactionButton(renderedReaction));
		});
		const mutationOperation = testFireAndForgetInvoker.executeNextOperation();

		renderedReaction.unmount();
		await act(async () => {
			deferredAddReaction.resolve({ count: 1, reacted: true });
			await mutationOperation;
		});

		assert.strictEqual(renderedReaction.container.innerHTML, "");
	});
});
