import assert from "node:assert";
import { act, cleanup, fireEvent, render, type RenderResult } from "@testing-library/preact";
import { setup, suite, teardown, test } from "mocha";
import { createJsdomTestEnvironment, type JsdomTestEnvironment } from "../test-support/jsdom-test-environment.ts";
import type { BlogReactionClient } from "./blog-reaction-client.ts";
import type { BlogReactionResponse } from "./blog-reaction-schema.ts";
import { BlogPostReaction, blogReactionUnavailableMessage } from "./BlogPostReaction.tsx";

const reactionDisclosure = "Your reaction is remembered in this browser so it can be counted once and removed later.";

type DeferredBlogReactionResponse = {
	readonly promise: Promise<BlogReactionResponse>;
	readonly reject: (error: Error) => void;
	readonly resolve: (response: BlogReactionResponse) => void;
};

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

type LoadedReaction = {
	readonly renderedReaction: RenderResult;
	readonly testBlogReactionClient: TestBlogReactionClient;
};

function createDeferredBlogReactionResponse(): DeferredBlogReactionResponse {
	let rejectResponse: (error: Error) => void = function rejectUninitializedResponse(): never {
		throw new Error("Expected the deferred reaction response to be initialized.");
	};
	let resolveResponse: (response: BlogReactionResponse) => void = function resolveUninitializedResponse(): never {
		throw new Error("Expected the deferred reaction response to be initialized.");
	};
	const promise = new Promise<BlogReactionResponse>((resolve, reject) => {
		resolveResponse = resolve;
		rejectResponse = reject;
	});

	return {
		promise,
		reject(error) {
			rejectResponse(error);
		},
		resolve(response) {
			resolveResponse(response);
		}
	};
}

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
				return await addReaction(postSlug);
			},
			async loadReaction(postSlug) {
				loadedPostSlugs.push(postSlug);
				return await loadReaction(postSlug);
			},
			async removeReaction(postSlug) {
				removedPostSlugs.push(postSlug);
				return await removeReaction(postSlug);
			}
		},
		loadedPostSlugs,
		removedPostSlugs
	};
}

async function flushReactionEffects(): Promise<void> {
	await act(async function flushEffects(): Promise<void> {
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
	});
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

async function renderLoadedReaction(reactionResponse: BlogReactionResponse): Promise<LoadedReaction> {
	const testBlogReactionClient = createTestBlogReactionClient({
		async loadReaction() {
			return reactionResponse;
		}
	});

	const renderedReaction = render(
		<BlogPostReaction postSlug="first-post" reactionClient={testBlogReactionClient.client} />
	);
	await flushReactionEffects();

	return { renderedReaction, testBlogReactionClient };
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
		const deferredLoadReaction = createDeferredBlogReactionResponse();
		const testBlogReactionClient = createTestBlogReactionClient({
			async loadReaction() {
				return await deferredLoadReaction.promise;
			}
		});

		const renderedReaction = render(
			<BlogPostReaction postSlug="first-post" reactionClient={testBlogReactionClient.client} />
		);

		assert.strictEqual(
			renderedReaction.getByRole("heading", { name: "Did this make you think?" }).textContent,
			"Did this make you think?"
		);
		assert.strictEqual(renderedReaction.getByText("👍").textContent, "👍");
		assert.strictEqual(readReactionButton(renderedReaction).disabled, true);
		assert.strictEqual(readReactionButton(renderedReaction).getAttribute("aria-pressed"), "false");
		assert.strictEqual(renderedReaction.getByText(reactionDisclosure).textContent, reactionDisclosure);
		assert.strictEqual(renderedReaction.getByRole("status").getAttribute("aria-live"), "polite");
	});

	test("loads the current reaction exactly once for the supplied post slug", async function () {
		const testBlogReactionClient = createTestBlogReactionClient();

		render(<BlogPostReaction postSlug="first-post" reactionClient={testBlogReactionClient.client} />);
		await flushReactionEffects();

		assert.deepStrictEqual(testBlogReactionClient.loadedPostSlugs, ["first-post"]);
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

		const renderedReaction = render(
			<BlogPostReaction postSlug="first-post" reactionClient={testBlogReactionClient.client} />
		);
		await flushReactionEffects();

		assert.strictEqual(renderedReaction.getByRole("status").textContent, blogReactionUnavailableMessage);
		assert.strictEqual(readReactionButton(renderedReaction).disabled, true);
	});

	test("adds an unpressed reaction with the supplied post slug", async function () {
		const { renderedReaction, testBlogReactionClient } = await renderLoadedReaction({ count: 0, reacted: false });

		await act(function activateReactionButton(): void {
			fireEvent.click(readReactionButton(renderedReaction));
		});
		await flushReactionEffects();

		assert.deepStrictEqual(testBlogReactionClient.addedPostSlugs, ["first-post"]);
	});

	test("removes a pressed reaction with the supplied post slug", async function () {
		const { renderedReaction, testBlogReactionClient } = await renderLoadedReaction({ count: 2, reacted: true });

		await act(function activateReactionButton(): void {
			fireEvent.click(readReactionButton(renderedReaction));
		});
		await flushReactionEffects();

		assert.deepStrictEqual(testBlogReactionClient.removedPostSlugs, ["first-post"]);
	});

	test("disables repeated activation and preserves the count while mutating", async function () {
		const deferredAddReaction = createDeferredBlogReactionResponse();
		const testBlogReactionClient = createTestBlogReactionClient({
			async addReaction() {
				return await deferredAddReaction.promise;
			},
			async loadReaction() {
				return { count: 4, reacted: false };
			}
		});

		const renderedReaction = render(
			<BlogPostReaction postSlug="first-post" reactionClient={testBlogReactionClient.client} />
		);
		await flushReactionEffects();
		await act(function activateReactionButton(): void {
			fireEvent.click(readReactionButton(renderedReaction));
			fireEvent.click(readReactionButton(renderedReaction));
		});

		assert.strictEqual(testBlogReactionClient.addedPostSlugs.length, 1);
		assert.strictEqual(readReactionButton(renderedReaction).disabled, true);
		assert.strictEqual(readReactionCountLabel(renderedReaction).textContent, "4 reactions");

		deferredAddReaction.resolve({ count: 5, reacted: true });
		await flushReactionEffects();

		assert.strictEqual(readReactionCountLabel(renderedReaction).textContent, "5 reactions");
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

		const renderedReaction = render(
			<BlogPostReaction postSlug="first-post" reactionClient={testBlogReactionClient.client} />
		);
		await flushReactionEffects();
		await act(function activateReactionButton(): void {
			fireEvent.click(readReactionButton(renderedReaction));
		});
		await flushReactionEffects();

		assert.strictEqual(readReactionCountLabel(renderedReaction).textContent, "2 reactions");
		assert.strictEqual(readReactionButton(renderedReaction).getAttribute("aria-pressed"), "true");
		assert.strictEqual(readReactionButton(renderedReaction).disabled, false);
		assert.strictEqual(renderedReaction.getByRole("status").textContent, blogReactionUnavailableMessage);
	});

	test("does not update state after unmount during initial loading", async function () {
		const deferredLoadReaction = createDeferredBlogReactionResponse();
		const testBlogReactionClient = createTestBlogReactionClient({
			async loadReaction() {
				return await deferredLoadReaction.promise;
			}
		});
		const renderedReaction = render(
			<BlogPostReaction postSlug="first-post" reactionClient={testBlogReactionClient.client} />
		);

		renderedReaction.unmount();
		deferredLoadReaction.resolve({ count: 1, reacted: true });
		await flushReactionEffects();

		assert.strictEqual(renderedReaction.container.innerHTML, "");
	});

	test("does not update state after unmount during mutation", async function () {
		const deferredAddReaction = createDeferredBlogReactionResponse();
		const testBlogReactionClient = createTestBlogReactionClient({
			async addReaction() {
				return await deferredAddReaction.promise;
			},
			async loadReaction() {
				return { count: 0, reacted: false };
			}
		});
		const renderedReaction = render(
			<BlogPostReaction postSlug="first-post" reactionClient={testBlogReactionClient.client} />
		);
		await flushReactionEffects();
		await act(function activateReactionButton(): void {
			fireEvent.click(readReactionButton(renderedReaction));
		});

		renderedReaction.unmount();
		deferredAddReaction.resolve({ count: 1, reacted: true });
		await flushReactionEffects();

		assert.strictEqual(renderedReaction.container.innerHTML, "");
	});
});
