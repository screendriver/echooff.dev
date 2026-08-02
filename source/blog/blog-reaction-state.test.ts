import assert from "node:assert";
import { suite, test } from "mocha";
import {
	createBlogReactionCountLabel,
	createInitialBlogPostReactionState,
	reduceBlogPostReactionState,
	type BlogPostReactionState
} from "./blog-reaction-state.ts";

const loadedReactionResponse = { count: 3, reacted: false } as const;
const updatedReactionResponse = { count: 4, reacted: true } as const;

function createReadyState(): BlogPostReactionState {
	return {
		snapshot: {
			count: loadedReactionResponse.count,
			reacted: loadedReactionResponse.reacted
		},
		status: "ready"
	};
}

suite("createBlogReactionCountLabel()", function () {
	test("creates a zero-reaction label", function () {
		assert.strictEqual(createBlogReactionCountLabel(0), "No reactions yet");
	});

	test("creates a singular-reaction label", function () {
		assert.strictEqual(createBlogReactionCountLabel(1), "1 reaction");
	});

	test("creates a plural-reaction label", function () {
		assert.strictEqual(createBlogReactionCountLabel(3), "3 reactions");
	});
});

suite("reduceBlogPostReactionState()", function () {
	test("starts in the loading state", function () {
		assert.deepStrictEqual(createInitialBlogPostReactionState(), { status: "loading" });
	});

	test("transitions loading to ready on a successful load", function () {
		const actualState = reduceBlogPostReactionState(createInitialBlogPostReactionState(), {
			response: loadedReactionResponse,
			type: "load_succeeded"
		});

		assert.deepStrictEqual(actualState, {
			snapshot: loadedReactionResponse,
			status: "ready"
		});
	});

	test("transitions loading to unavailable on a failed load", function () {
		const actualState = reduceBlogPostReactionState(createInitialBlogPostReactionState(), {
			type: "load_failed"
		});

		assert.deepStrictEqual(actualState, { status: "unavailable" });
	});

	test("transitions ready to mutating when a mutation starts", function () {
		const actualState = reduceBlogPostReactionState(createReadyState(), { type: "mutation_started" });

		assert.deepStrictEqual(actualState, {
			snapshot: loadedReactionResponse,
			status: "mutating"
		});
	});

	test("transitions mutating to ready with the complete server response", function () {
		const mutatingState = reduceBlogPostReactionState(createReadyState(), { type: "mutation_started" });
		const actualState = reduceBlogPostReactionState(mutatingState, {
			response: updatedReactionResponse,
			type: "mutation_succeeded"
		});

		assert.deepStrictEqual(actualState, {
			snapshot: updatedReactionResponse,
			status: "ready"
		});
	});

	test("preserves the last valid snapshot after mutation failure", function () {
		const mutatingState = reduceBlogPostReactionState(createReadyState(), { type: "mutation_started" });
		const actualState = reduceBlogPostReactionState(mutatingState, { type: "mutation_failed" });

		assert.deepStrictEqual(actualState, {
			snapshot: loadedReactionResponse,
			status: "unavailable"
		});
	});

	test("ignores stale loading and mutation actions", function () {
		const readyState = createReadyState();
		const actualStateAfterLoad = reduceBlogPostReactionState(readyState, {
			response: updatedReactionResponse,
			type: "load_succeeded"
		});
		const actualStateAfterMutation = reduceBlogPostReactionState(createInitialBlogPostReactionState(), {
			response: updatedReactionResponse,
			type: "mutation_succeeded"
		});

		assert.strictEqual(actualStateAfterLoad, readyState);
		assert.deepStrictEqual(actualStateAfterMutation, { status: "loading" });
	});
});
