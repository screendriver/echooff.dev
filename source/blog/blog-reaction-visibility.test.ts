import assert from "node:assert";
import { suite, test } from "mocha";
import {
	blogPostReactionVisibilityRootMargin,
	initializeVisibleBlogPostReaction,
	type BlogPostReactionVisibilityDependencies,
	type BlogPostReactionVisibilityEntry,
	type BlogPostReactionVisibilityObserver
} from "./blog-reaction-visibility.ts";

type TestVisibilityObserver = {
	readonly observer: BlogPostReactionVisibilityObserver;
	readonly trigger: (entries: readonly BlogPostReactionVisibilityEntry[]) => void;
	readonly observedTargets: readonly unknown[];
	readonly disconnectCallCount: () => number;
	readonly readOptions: () => { readonly rootMargin: string } | undefined;
};

type TestVisibilitySetup = TestVisibilityObserver & {
	readonly dependencies: BlogPostReactionVisibilityDependencies;
};

type CreateTestVisibilityDependenciesOptions = {
	readonly supportsIntersectionObserver: boolean;
};

type TestVisibilityState = {
	options: { readonly rootMargin: string } | undefined;
};

function createTestVisibilityDependencies(
	createTestVisibilityDependenciesOptions: CreateTestVisibilityDependenciesOptions
): TestVisibilitySetup {
	let observerCallback: (entries: readonly BlogPostReactionVisibilityEntry[]) => void = function () {
		throw new Error("Expected an intersection observer callback to be initialized.");
	};
	let disconnectCallCount = 0;
	const observedTargets: unknown[] = [];
	const testVisibilityState: TestVisibilityState = { options: undefined };
	const observer: BlogPostReactionVisibilityObserver = {
		disconnect() {
			disconnectCallCount += 1;
		},
		observe(target) {
			observedTargets.push(target);
		}
	};
	const dependencies: BlogPostReactionVisibilityDependencies = {
		createIntersectionObserver(callback, observerOptions) {
			observerCallback = callback;
			testVisibilityState.options = observerOptions;
			return observer;
		},
		supportsIntersectionObserver() {
			return createTestVisibilityDependenciesOptions.supportsIntersectionObserver;
		}
	};

	return {
		dependencies,
		disconnectCallCount() {
			return disconnectCallCount;
		},
		observedTargets,
		readOptions() {
			return testVisibilityState.options;
		},
		observer,
		trigger(entries) {
			observerCallback(entries);
		}
	};
}

async function flushMicrotasks(): Promise<void> {
	await Promise.resolve();
	await Promise.resolve();
}

suite("initializeVisibleBlogPostReaction()", function () {
	test("waits for the reaction root to enter the configured visibility boundary", async function () {
		const reactionRoot = { id: "first" };
		const testVisibility = createTestVisibilityDependencies({ supportsIntersectionObserver: true });
		let initializationCallCount = 0;

		initializeVisibleBlogPostReaction({
			async initializeBlogPostReaction() {
				initializationCallCount += 1;
			},
			reactionRoot,
			visibilityDependencies: testVisibility.dependencies
		});

		assert.deepStrictEqual(testVisibility.observedTargets, [reactionRoot]);
		assert.strictEqual(initializationCallCount, 0);
		assert.deepStrictEqual(testVisibility.readOptions(), { rootMargin: blogPostReactionVisibilityRootMargin });

		testVisibility.trigger([{ isIntersecting: false, target: reactionRoot }]);
		assert.strictEqual(initializationCallCount, 0);

		testVisibility.trigger([{ isIntersecting: true, target: reactionRoot }]);
		await flushMicrotasks();

		assert.strictEqual(initializationCallCount, 1);
		assert.strictEqual(testVisibility.disconnectCallCount(), 1);
	});

	test("initializes exactly once when the component returns to the viewport", async function () {
		const reactionRoot = { id: "first" };
		const testVisibility = createTestVisibilityDependencies({ supportsIntersectionObserver: true });
		let initializationCallCount = 0;

		initializeVisibleBlogPostReaction({
			async initializeBlogPostReaction() {
				initializationCallCount += 1;
			},
			reactionRoot,
			visibilityDependencies: testVisibility.dependencies
		});

		testVisibility.trigger([{ isIntersecting: true, target: reactionRoot }]);
		testVisibility.trigger([{ isIntersecting: true, target: reactionRoot }]);
		testVisibility.trigger([{ isIntersecting: false, target: reactionRoot }]);
		await flushMicrotasks();

		assert.strictEqual(initializationCallCount, 1);
		assert.strictEqual(testVisibility.disconnectCallCount(), 1);
	});

	test("does not initialize when another root becomes visible", async function () {
		const firstReactionRoot = { id: "first" };
		const secondReactionRoot = { id: "second" };
		const firstVisibility = createTestVisibilityDependencies({ supportsIntersectionObserver: true });
		const secondVisibility = createTestVisibilityDependencies({ supportsIntersectionObserver: true });
		let firstInitializationCallCount = 0;
		let secondInitializationCallCount = 0;

		initializeVisibleBlogPostReaction({
			async initializeBlogPostReaction() {
				firstInitializationCallCount += 1;
			},
			reactionRoot: firstReactionRoot,
			visibilityDependencies: firstVisibility.dependencies
		});
		initializeVisibleBlogPostReaction({
			async initializeBlogPostReaction() {
				secondInitializationCallCount += 1;
			},
			reactionRoot: secondReactionRoot,
			visibilityDependencies: secondVisibility.dependencies
		});

		firstVisibility.trigger([{ isIntersecting: true, target: secondReactionRoot }]);
		secondVisibility.trigger([{ isIntersecting: true, target: firstReactionRoot }]);
		await flushMicrotasks();

		assert.strictEqual(firstInitializationCallCount, 0);
		assert.strictEqual(secondInitializationCallCount, 0);
	});

	test("initializes immediately when IntersectionObserver is unavailable", async function () {
		const testVisibility = createTestVisibilityDependencies({ supportsIntersectionObserver: false });
		let initializationCallCount = 0;

		initializeVisibleBlogPostReaction({
			async initializeBlogPostReaction() {
				initializationCallCount += 1;
			},
			reactionRoot: { id: "first" },
			visibilityDependencies: testVisibility.dependencies
		});
		await flushMicrotasks();

		assert.strictEqual(initializationCallCount, 1);
		assert.strictEqual(testVisibility.observedTargets.length, 0);
	});

	test("handles an initialization rejection without propagating it", async function () {
		const testVisibility = createTestVisibilityDependencies({ supportsIntersectionObserver: false });

		initializeVisibleBlogPostReaction({
			async initializeBlogPostReaction() {
				throw new Error("reaction initialization failed");
			},
			reactionRoot: { id: "first" },
			visibilityDependencies: testVisibility.dependencies
		});

		await flushMicrotasks();
		assert.strictEqual(testVisibility.disconnectCallCount(), 0);
	});
});
