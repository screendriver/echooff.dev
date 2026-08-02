import assert from "node:assert";
import { act, cleanup, fireEvent, waitFor } from "@testing-library/preact";
import { setup, suite, teardown, test } from "mocha";
import { createJsdomTestEnvironment, type JsdomTestEnvironment } from "../../test-support/jsdom-test-environment.ts";
import type { BlogReactionResponse } from "./blog-reaction-schema.ts";
import { blogReactionUnavailableMessage } from "./BlogPostReaction.tsx";

import {
	createExpectedBlogReactionClientFailure,
	createExpectedReactionCountLabel,
	createTestBlogReactionClient,
	createTestFireAndForgetInvoker,
	readReactionButton,
	readReactionCountLabel,
	renderBlogPostReaction,
	renderLoadedReaction,
	type TestBlogReactionClientOptions
} from "./BlogPostReaction.test-support.tsx";

type BlogReactionMutationKind = "add" | "remove";

function createExpectedMutationFailureClientOptions(
	initialReactionResponse: BlogReactionResponse,
	blogReactionMutationKind: BlogReactionMutationKind
): TestBlogReactionClientOptions {
	const loadReaction = async function loadExpectedMutationFailureReaction(): Promise<BlogReactionResponse> {
		return initialReactionResponse;
	};

	if (blogReactionMutationKind === "add") {
		return {
			addReaction: async function failExpectedAddReaction(): Promise<BlogReactionResponse> {
				throw createExpectedBlogReactionClientFailure();
			},
			loadReaction
		};
	}

	return {
		loadReaction,
		removeReaction: async function failExpectedRemoveReaction(): Promise<BlogReactionResponse> {
			throw createExpectedBlogReactionClientFailure();
		}
	};
}

async function exerciseExpectedMutationFailure(
	initialReactionResponse: BlogReactionResponse,
	blogReactionMutationKind: BlogReactionMutationKind
): Promise<void> {
	const testBlogReactionClientOptions = createExpectedMutationFailureClientOptions(
		initialReactionResponse,
		blogReactionMutationKind
	);
	const testBlogReactionClient = createTestBlogReactionClient(testBlogReactionClientOptions);
	const testFireAndForgetInvoker = createTestFireAndForgetInvoker();
	const renderedReaction = renderBlogPostReaction(testBlogReactionClient, testFireAndForgetInvoker);

	await testFireAndForgetInvoker.executeNextOperation();
	await waitFor(() => {
		assert.strictEqual(
			readReactionCountLabel(renderedReaction).textContent,
			createExpectedReactionCountLabel(initialReactionResponse.count)
		);
	});
	await act(() => {
		fireEvent.click(readReactionButton(renderedReaction));
	});
	await testFireAndForgetInvoker.executeNextOperation();
	await waitFor(() => {
		assert.strictEqual(renderedReaction.getByRole("status").textContent, blogReactionUnavailableMessage);
	});

	assert.strictEqual(
		readReactionCountLabel(renderedReaction).textContent,
		createExpectedReactionCountLabel(initialReactionResponse.count)
	);
	assert.strictEqual(
		readReactionButton(renderedReaction).getAttribute("aria-pressed"),
		String(initialReactionResponse.reacted)
	);
	assert.strictEqual(readReactionButton(renderedReaction).disabled, false);
	assert.deepStrictEqual(testFireAndForgetInvoker.escapedFailures, []);
}

async function exerciseUnexpectedMutationFailureRecovery(
	initialReactionResponse: BlogReactionResponse,
	blogReactionMutationKind: BlogReactionMutationKind,
	unexpectedFailure: Error,
	successfulReactionResponse: BlogReactionResponse
): Promise<void> {
	let mutationAttemptCount = 0;
	const mutationOperation = async function attemptReactionMutation(): Promise<BlogReactionResponse> {
		mutationAttemptCount += 1;

		if (mutationAttemptCount === 1) {
			throw unexpectedFailure;
		}

		return successfulReactionResponse;
	};
	const testBlogReactionClientOptions: TestBlogReactionClientOptions = {
		loadReaction: async function loadUnexpectedMutationFailureReaction(): Promise<BlogReactionResponse> {
			return initialReactionResponse;
		},
		...(blogReactionMutationKind === "add"
			? { addReaction: mutationOperation }
			: { removeReaction: mutationOperation })
	};
	const testBlogReactionClient = createTestBlogReactionClient(testBlogReactionClientOptions);
	const testFireAndForgetInvoker = createTestFireAndForgetInvoker();
	const renderedReaction = renderBlogPostReaction(testBlogReactionClient, testFireAndForgetInvoker);

	await testFireAndForgetInvoker.executeNextOperation();
	await waitFor(() => {
		assert.strictEqual(
			readReactionCountLabel(renderedReaction).textContent,
			createExpectedReactionCountLabel(initialReactionResponse.count)
		);
	});
	await act(() => {
		fireEvent.click(readReactionButton(renderedReaction));
	});
	await testFireAndForgetInvoker.executeNextOperation();
	await waitFor(() => {
		assert.strictEqual(readReactionButton(renderedReaction).disabled, false);
	});

	assert.strictEqual(renderedReaction.getByRole("status").textContent, "");
	assert.strictEqual(
		readReactionCountLabel(renderedReaction).textContent,
		createExpectedReactionCountLabel(initialReactionResponse.count)
	);
	assert.strictEqual(
		readReactionButton(renderedReaction).getAttribute("aria-pressed"),
		String(initialReactionResponse.reacted)
	);
	assert.deepStrictEqual(testFireAndForgetInvoker.escapedFailures, [unexpectedFailure]);

	await act(() => {
		fireEvent.click(readReactionButton(renderedReaction));
	});
	await testFireAndForgetInvoker.executeNextOperation();
	await waitFor(() => {
		assert.strictEqual(
			readReactionCountLabel(renderedReaction).textContent,
			createExpectedReactionCountLabel(successfulReactionResponse.count)
		);
	});

	assert.strictEqual(mutationAttemptCount, 2);
	assert.deepStrictEqual(testFireAndForgetInvoker.escapedFailures, [unexpectedFailure]);
}

async function exerciseInitialUnmountFailure(
	failure: unknown,
	expectedEscapedFailures: readonly unknown[]
): Promise<void> {
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
		deferredLoadReaction.reject(failure);
		await loadingOperation;
	});

	assert.strictEqual(renderedReaction.container.innerHTML, "");
	assert.deepStrictEqual(testFireAndForgetInvoker.escapedFailures, expectedEscapedFailures);
}

async function exerciseMutationUnmountFailure(
	failure: unknown,
	expectedEscapedFailures: readonly unknown[]
): Promise<void> {
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
		deferredAddReaction.reject(failure);
		await mutationOperation;
	});

	assert.strictEqual(renderedReaction.container.innerHTML, "");
	assert.deepStrictEqual(testFireAndForgetInvoker.escapedFailures, expectedEscapedFailures);
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

	test("renders the unavailable state for an expected initial loading failure", async function () {
		const testBlogReactionClient = createTestBlogReactionClient({
			async loadReaction() {
				throw createExpectedBlogReactionClientFailure();
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

	test("escapes an unexpected initial loading failure to the invoker", async function () {
		const unexpectedFailure = new Error("unexpected initial loading failure");
		const testBlogReactionClient = createTestBlogReactionClient({
			async loadReaction() {
				throw unexpectedFailure;
			}
		});
		const testFireAndForgetInvoker = createTestFireAndForgetInvoker();

		const renderedReaction = renderBlogPostReaction(testBlogReactionClient, testFireAndForgetInvoker);
		await testFireAndForgetInvoker.executeNextOperation();

		assert.deepStrictEqual(testBlogReactionClient.loadedPostSlugs, ["first-post"]);
		assert.strictEqual(renderedReaction.getByRole("status").textContent, "");
		assert.strictEqual(readReactionButton(renderedReaction).disabled, true);
		assert.deepStrictEqual(testFireAndForgetInvoker.escapedFailures, [unexpectedFailure]);
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

	test("preserves the valid snapshot after an expected add failure", async function () {
		await exerciseExpectedMutationFailure({ count: 3, reacted: false }, "add");
	});

	test("preserves the valid snapshot after an expected remove failure", async function () {
		await exerciseExpectedMutationFailure({ count: 2, reacted: true }, "remove");
	});

	test("escapes an unexpected add failure and permits a later activation", async function () {
		await exerciseUnexpectedMutationFailureRecovery(
			{ count: 3, reacted: false },
			"add",
			new Error("unexpected add failure"),
			{ count: 4, reacted: true }
		);
	});

	test("escapes an unexpected remove failure and permits a later activation", async function () {
		await exerciseUnexpectedMutationFailureRecovery(
			{ count: 3, reacted: true },
			"remove",
			new Error("unexpected remove failure"),
			{ count: 2, reacted: false }
		);
	});

	test("does not update state after unmount during an expected initial loading failure", async function () {
		await exerciseInitialUnmountFailure(createExpectedBlogReactionClientFailure(), []);
	});

	test("does not update state after unmount during an unexpected initial loading failure", async function () {
		const unexpectedFailure = new Error("unexpected initial loading failure after unmount");
		await exerciseInitialUnmountFailure(unexpectedFailure, [unexpectedFailure]);
	});

	test("does not update state after unmount during an expected mutation failure", async function () {
		await exerciseMutationUnmountFailure(createExpectedBlogReactionClientFailure(), []);
	});

	test("does not update state after unmount during an unexpected mutation failure", async function () {
		const unexpectedFailure = new Error("unexpected mutation failure after unmount");
		await exerciseMutationUnmountFailure(unexpectedFailure, [unexpectedFailure]);
	});
});
