import assert from "node:assert";
import { suite, test } from "mocha";
import { reject as rejectTask, resolve as resolveTask, type Task } from "true-myth/task";
import {
	createRuntimeBlogReactionApplicationServiceTaskReader,
	type RuntimeBlogReactionApplicationServiceOptions
} from "./runtime-blog-reaction-application.ts";
import type { BlogReactionRepository } from "./blog-reaction.ts";
import type { PublishedBlogPostCatalogue, PublishedBlogPostSlug } from "./published-blog-post-catalogue.ts";

const validBlogReactionHmacSecret = "a".repeat(64);

type TestRuntimeApplicationDependencies = {
	loadPublishedBlogPostCatalogue: () => Task<PublishedBlogPostCatalogue, Error>;
	readBlogReactionRepository: () => Task<BlogReactionRepository, Error>;
	readRuntimeEnvironment: () => unknown;
};

function createTestPublishedBlogPostCatalogue(): PublishedBlogPostCatalogue {
	return {
		hasPublishedBlogPost(postSlug): postSlug is PublishedBlogPostSlug {
			return postSlug === "quiet-post";
		}
	};
}

function createTestBlogReactionRepository(): BlogReactionRepository {
	return {
		addReactionAndReadSnapshot() {
			return resolveTask({ count: 1, reacted: true });
		},
		readSnapshot() {
			return resolveTask({ count: 0, reacted: false });
		},
		removeReactionAndReadSnapshot() {
			return resolveTask({ count: 0, reacted: false });
		}
	};
}

function createTestRuntimeApplicationDependencies(
	readEnvironment: () => unknown = () => {
		return { BLOG_REACTION_HMAC_SECRET: validBlogReactionHmacSecret };
	}
): TestRuntimeApplicationDependencies {
	return {
		loadPublishedBlogPostCatalogue() {
			return resolveTask(createTestPublishedBlogPostCatalogue());
		},
		readBlogReactionRepository() {
			return resolveTask(createTestBlogReactionRepository());
		},
		readRuntimeEnvironment: readEnvironment
	};
}

function createTestRuntimeApplicationOptions(
	testRuntimeApplicationDependencies: TestRuntimeApplicationDependencies
): RuntimeBlogReactionApplicationServiceOptions {
	return {
		blogReactionRateLimiter: {
			checkMutation() {
				return {
					allowed: true,
					retryAfterMilliseconds: 0
				};
			}
		},
		createAnonymousReactorIdentifier() {
			return "A".repeat(43);
		},
		loadPublishedBlogPostCatalogue: testRuntimeApplicationDependencies.loadPublishedBlogPostCatalogue,
		readBlogReactionRepository: testRuntimeApplicationDependencies.readBlogReactionRepository,
		readRuntimeEnvironment: testRuntimeApplicationDependencies.readRuntimeEnvironment
	};
}

suite("createRuntimeBlogReactionApplicationServiceTaskReader()", function () {
	test("does not initialize dependencies until the reader is called", function () {
		let environmentReadCount = 0;
		let catalogueLoadCount = 0;
		let repositoryReadCount = 0;
		const runtimeApplicationDependencies = createTestRuntimeApplicationDependencies(() => {
			environmentReadCount += 1;

			return { BLOG_REACTION_HMAC_SECRET: validBlogReactionHmacSecret };
		});
		runtimeApplicationDependencies.loadPublishedBlogPostCatalogue = () => {
			catalogueLoadCount += 1;

			return resolveTask(createTestPublishedBlogPostCatalogue());
		};
		runtimeApplicationDependencies.readBlogReactionRepository = () => {
			repositoryReadCount += 1;

			return resolveTask(createTestBlogReactionRepository());
		};

		createRuntimeBlogReactionApplicationServiceTaskReader(
			createTestRuntimeApplicationOptions(runtimeApplicationDependencies)
		);

		assert.strictEqual(environmentReadCount, 0);
		assert.strictEqual(catalogueLoadCount, 0);
		assert.strictEqual(repositoryReadCount, 0);
	});

	test("shares one initialization task across repeated readers", async function () {
		let environmentReadCount = 0;
		let catalogueLoadCount = 0;
		let repositoryReadCount = 0;
		const runtimeApplicationDependencies = createTestRuntimeApplicationDependencies(() => {
			environmentReadCount += 1;

			return { BLOG_REACTION_HMAC_SECRET: validBlogReactionHmacSecret };
		});
		runtimeApplicationDependencies.loadPublishedBlogPostCatalogue = () => {
			catalogueLoadCount += 1;

			return resolveTask(createTestPublishedBlogPostCatalogue());
		};
		runtimeApplicationDependencies.readBlogReactionRepository = () => {
			repositoryReadCount += 1;

			return resolveTask(createTestBlogReactionRepository());
		};
		const reader = createRuntimeBlogReactionApplicationServiceTaskReader(
			createTestRuntimeApplicationOptions(runtimeApplicationDependencies)
		);
		const firstTask = reader();
		const secondTask = reader();

		assert.strictEqual(firstTask, secondTask);
		const firstResult = await firstTask;
		const secondResult = await secondTask;

		assert.strictEqual(firstResult.isOk, true);
		assert.strictEqual(secondResult.isOk, true);
		assert.strictEqual(environmentReadCount, 1);
		assert.strictEqual(catalogueLoadCount, 1);
		assert.strictEqual(repositoryReadCount, 1);
	});

	test("rejects invalid runtime configuration before opening application dependencies", async function () {
		let catalogueLoadCount = 0;
		let repositoryReadCount = 0;
		const runtimeApplicationDependencies = createTestRuntimeApplicationDependencies(() => {
			return {};
		});
		runtimeApplicationDependencies.loadPublishedBlogPostCatalogue = () => {
			catalogueLoadCount += 1;

			return resolveTask(createTestPublishedBlogPostCatalogue());
		};
		runtimeApplicationDependencies.readBlogReactionRepository = () => {
			repositoryReadCount += 1;

			return resolveTask(createTestBlogReactionRepository());
		};
		const reader = createRuntimeBlogReactionApplicationServiceTaskReader(
			createTestRuntimeApplicationOptions(runtimeApplicationDependencies)
		);

		const result = await reader();

		assert.strictEqual(result.isErr, true);
		assert.strictEqual(catalogueLoadCount, 0);
		assert.strictEqual(repositoryReadCount, 0);
	});

	test("shares an initialization failure instead of retrying it implicitly", async function () {
		const expectedError = new Error("repository unavailable");
		let repositoryReadCount = 0;
		const runtimeApplicationDependencies = createTestRuntimeApplicationDependencies();
		runtimeApplicationDependencies.readBlogReactionRepository = () => {
			repositoryReadCount += 1;

			return rejectTask(expectedError);
		};
		const reader = createRuntimeBlogReactionApplicationServiceTaskReader(
			createTestRuntimeApplicationOptions(runtimeApplicationDependencies)
		);

		const firstResult = await reader();
		const secondResult = await reader();

		assert.strictEqual(firstResult.isErr, true);
		assert.strictEqual(secondResult.isErr, true);
		assert.strictEqual(repositoryReadCount, 1);
		assert.strictEqual(firstResult.error, expectedError);
		assert.strictEqual(secondResult.error, expectedError);
	});
});
