import assert from "node:assert";
import { suite, test } from "mocha";
import {
	blogReactionUnavailableMessage,
	createBlogReactionCountLabel,
	initializeBlogPostReaction,
	type BlogPostReactionView
} from "./blog-reaction-interaction.ts";
import type { BlogReactionClient } from "./blog-reaction-client.ts";
import type { BlogReactionResponse } from "./blog-reaction-schema.ts";

type TestReactionViewState = {
	ariaPressed: boolean;
	buttonDisabled: boolean;
	countLabel: string;
	reactionStatus: string;
	activationListener: (() => void) | undefined;
};

type TestReactionView = {
	readonly state: TestReactionViewState;
	readonly view: BlogPostReactionView;
};

type CreateTestBlogReactionClientOptions = {
	readonly addReaction?: BlogReactionClient["addReaction"];
	readonly loadReaction?: BlogReactionClient["loadReaction"];
	readonly removeReaction?: BlogReactionClient["removeReaction"];
};

type DeferredBlogReactionResponse = {
	readonly promise: Promise<BlogReactionResponse>;
	readonly resolve: (response: BlogReactionResponse) => void;
};

function failToResolveBlogReactionResponse(): never {
	throw new Error("Expected the deferred reaction response to be initialized.");
}

function createDeferredBlogReactionResponse(): DeferredBlogReactionResponse {
	let resolveResponse: (response: BlogReactionResponse) => void = failToResolveBlogReactionResponse;
	const promise = new Promise<BlogReactionResponse>((resolve) => {
		resolveResponse = resolve;
	});

	return {
		promise,
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

function createTestReactionView(): TestReactionView {
	const state: TestReactionViewState = {
		activationListener: undefined,
		ariaPressed: false,
		buttonDisabled: false,
		countLabel: "No reactions yet",
		reactionStatus: ""
	};
	const view: BlogPostReactionView = {
		registerActivationListener(listener) {
			state.activationListener = listener;
		},
		setButtonDisabled(disabled) {
			state.buttonDisabled = disabled;
		},
		writeAriaPressed(reacted) {
			state.ariaPressed = reacted;
		},
		writeReactionCountLabel(label) {
			state.countLabel = label;
		},
		writeStatus(reactionStatus) {
			state.reactionStatus = reactionStatus;
		}
	};

	return { state, view };
}

function createTestBlogReactionClient(
	createTestBlogReactionClientOptions: CreateTestBlogReactionClientOptions
): BlogReactionClient {
	const {
		addReaction = createDefaultAddedReaction,
		loadReaction = createDefaultLoadedReaction,
		removeReaction = createDefaultRemovedReaction
	} = createTestBlogReactionClientOptions;

	return {
		addReaction,
		loadReaction,
		removeReaction
	};
}

async function flushMicrotasks(): Promise<void> {
	await Promise.resolve();
	await Promise.resolve();
}

function readActivationListener(testReactionViewState: TestReactionViewState): () => void {
	const { activationListener } = testReactionViewState;

	if (activationListener === undefined) {
		throw new Error("Expected the reaction activation listener to be registered.");
	}

	return activationListener;
}

suite("createBlogReactionCountLabel()", function () {
	test("uses unobtrusive zero, singular, and plural labels", function () {
		assert.strictEqual(createBlogReactionCountLabel(0), "No reactions yet");
		assert.strictEqual(createBlogReactionCountLabel(1), "1 reaction");
		assert.strictEqual(createBlogReactionCountLabel(2), "2 reactions");
	});
});

suite("initializeBlogPostReaction()", function () {
	test("loads and renders the initial state before enabling activation", async function () {
		const deferredLoadReaction = createDeferredBlogReactionResponse();
		const { state, view } = createTestReactionView();
		const blogReactionClient = createTestBlogReactionClient({
			async loadReaction() {
				return await deferredLoadReaction.promise;
			}
		});

		void initializeBlogPostReaction({ blogReactionClient, postSlug: "first-post", view });

		assert.strictEqual(state.buttonDisabled, true);
		deferredLoadReaction.resolve({ count: 1, reacted: true });
		await flushMicrotasks();

		assert.partialDeepStrictEqual(state, {
			ariaPressed: true,
			buttonDisabled: false,
			countLabel: "1 reaction"
		});
	});

	test("adds an unpressed reaction and uses the complete server response", async function () {
		let addReactionCallCount = 0;
		const { state, view } = createTestReactionView();
		const blogReactionClient = createTestBlogReactionClient({
			addReaction: async () => {
				addReactionCallCount += 1;
				return { count: 7, reacted: true };
			},
			loadReaction: async () => {
				return { count: 6, reacted: false };
			}
		});

		void initializeBlogPostReaction({ blogReactionClient, postSlug: "first-post", view });
		await flushMicrotasks();
		const activationListener = readActivationListener(state);
		activationListener();
		await flushMicrotasks();

		assert.strictEqual(addReactionCallCount, 1);
		assert.partialDeepStrictEqual(state, {
			ariaPressed: true,
			countLabel: "7 reactions"
		});
	});

	test("removes a pressed reaction", async function () {
		let removeReactionCallCount = 0;
		const { state, view } = createTestReactionView();
		const blogReactionClient = createTestBlogReactionClient({
			loadReaction: async () => {
				return { count: 1, reacted: true };
			},
			removeReaction: async () => {
				removeReactionCallCount += 1;
				return { count: 0, reacted: false };
			}
		});

		void initializeBlogPostReaction({ blogReactionClient, postSlug: "first-post", view });
		await flushMicrotasks();
		const activationListener = readActivationListener(state);
		activationListener();
		await flushMicrotasks();

		assert.strictEqual(removeReactionCallCount, 1);
		assert.partialDeepStrictEqual(state, {
			ariaPressed: false,
			countLabel: "No reactions yet"
		});
	});

	test("ignores activation while a mutation is pending", async function () {
		const deferredAddReaction = createDeferredBlogReactionResponse();
		let addReactionCallCount = 0;
		const { state, view } = createTestReactionView();
		const blogReactionClient = createTestBlogReactionClient({
			async addReaction() {
				addReactionCallCount += 1;
				return await deferredAddReaction.promise;
			},
			loadReaction: async () => {
				return { count: 0, reacted: false };
			}
		});

		void initializeBlogPostReaction({ blogReactionClient, postSlug: "first-post", view });
		await flushMicrotasks();
		const activationListener = readActivationListener(state);
		activationListener();
		activationListener();

		assert.strictEqual(addReactionCallCount, 1);
		assert.strictEqual(state.buttonDisabled, true);
		deferredAddReaction.resolve({ count: 1, reacted: true });
		await flushMicrotasks();

		assert.strictEqual(state.buttonDisabled, false);
	});

	test("shows an unavailable status and leaves activation recoverable after loading fails", async function () {
		let loadReactionCallCount = 0;
		const { state, view } = createTestReactionView();
		const blogReactionClient = createTestBlogReactionClient({
			loadReaction: async () => {
				loadReactionCallCount += 1;
				throw new Error("timeout");
			}
		});

		void initializeBlogPostReaction({ blogReactionClient, postSlug: "first-post", view });
		await flushMicrotasks();
		const activationListener = readActivationListener(state);
		activationListener();
		await flushMicrotasks();

		assert.strictEqual(loadReactionCallCount, 2);
		assert.partialDeepStrictEqual(state, {
			buttonDisabled: false,
			reactionStatus: blogReactionUnavailableMessage
		});
	});

	test("shows an unavailable status and re-enables activation after mutation fails", async function () {
		const { state, view } = createTestReactionView();
		const blogReactionClient = createTestBlogReactionClient({
			addReaction: async () => {
				throw new Error("network failure");
			},
			loadReaction: async () => {
				return { count: 0, reacted: false };
			}
		});

		void initializeBlogPostReaction({ blogReactionClient, postSlug: "first-post", view });
		await flushMicrotasks();
		const activationListener = readActivationListener(state);
		activationListener();
		await flushMicrotasks();

		assert.partialDeepStrictEqual(state, {
			buttonDisabled: false,
			countLabel: "No reactions yet",
			reactionStatus: blogReactionUnavailableMessage
		});
	});
});
