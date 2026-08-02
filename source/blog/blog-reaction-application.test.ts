import assert from "node:assert";
import { isUndefined } from "@sindresorhus/is";
import { suite, test } from "mocha";
import { just, nothing, type Maybe } from "true-myth/maybe";
import { err, ok, type Result } from "true-myth/result";
import { resolve as resolveTask, type Task } from "true-myth/task";
import {
	createBlogReactionApplicationService,
	type BlogReactionApplicationService,
	type BlogReactionApplicationServiceOptions
} from "./blog-reaction-application.ts";
import type { BlogReactionRepository, BlogReactionSnapshot } from "./blog-reaction.ts";
import type { BlogReactionRateLimiter, BlogReactionRateLimitDecision } from "./blog-reaction-rate-limiter.ts";
import type { AnonymousReactorIdentifier } from "./blog-reaction-identity-schema.ts";
import type { PublishedBlogPostCatalogue, PublishedBlogPostSlug } from "./published-blog-post-catalogue.ts";

const validExistingAnonymousReactorIdentifier = "B".repeat(43);
const generatedAnonymousReactorIdentifier = "A".repeat(43);
const blogReactionHmacSecret = "a".repeat(64);

type ReadReactionRepositoryCall = {
	readonly kind: "read";
	readonly postSlug: PublishedBlogPostSlug;
	readonly reactorHash: Maybe<string>;
};

type AddReactionRepositoryCall = {
	readonly kind: "add";
	readonly postSlug: PublishedBlogPostSlug;
	readonly reactorHash: string;
};

type RemoveReactionRepositoryCall = {
	readonly kind: "remove";
	readonly postSlug: PublishedBlogPostSlug;
	readonly reactorHash: string;
};

type BlogReactionRepositoryCall = AddReactionRepositoryCall | ReadReactionRepositoryCall | RemoveReactionRepositoryCall;

type TestEventRecorder = (eventName: string) => void;

type TestBlogReactionRepositoryOptions = {
	readonly error?: Error;
	readonly recordEvent?: TestEventRecorder;
	readonly snapshot?: BlogReactionSnapshot;
};

type TestBlogReactionRepository = BlogReactionRepository & {
	readonly calls: readonly BlogReactionRepositoryCall[];
};

type CreateTestApplicationServiceOptions = {
	readonly blogReactionRepository?: TestBlogReactionRepository;
	readonly createAnonymousReactorIdentifier?: () => AnonymousReactorIdentifier;
	readonly recordEvent?: TestEventRecorder;
	readonly publishedBlogPostSlugs?: readonly string[];
	readonly rateLimitDecision?: BlogReactionRateLimitDecision;
};

type TestApplicationService = {
	readonly blogReactionRepository: TestBlogReactionRepository;
	readonly readAnonymousReactorIdentifierGenerationCount: () => number;
	readonly service: BlogReactionApplicationService;
};

function createTestBlogReactionRepository(
	testBlogReactionRepositoryOptions: TestBlogReactionRepositoryOptions = {}
): TestBlogReactionRepository {
	const { error, recordEvent, snapshot = { count: 0, reacted: false } } = testBlogReactionRepositoryOptions;
	const calls: BlogReactionRepositoryCall[] = [];

	function throwRepositoryError(): void {
		if (!isUndefined(error)) {
			throw error;
		}
	}

	return {
		calls,
		addReactionAndReadSnapshot(postSlug, reactorHash) {
			recordEvent?.("addReactionAndReadSnapshot");

			calls.push({
				kind: "add",
				postSlug,
				reactorHash
			});

			throwRepositoryError();

			return resolveTask(snapshot);
		},
		readSnapshot(postSlug, reactorHash) {
			recordEvent?.("readSnapshot");

			calls.push({
				kind: "read",
				postSlug,
				reactorHash
			});

			throwRepositoryError();

			return resolveTask(snapshot);
		},
		removeReactionAndReadSnapshot(postSlug, reactorHash) {
			recordEvent?.("removeReactionAndReadSnapshot");

			calls.push({
				kind: "remove",
				postSlug,
				reactorHash
			});

			throwRepositoryError();

			return resolveTask(snapshot);
		}
	};
}

function createTestPublishedBlogPostCatalogue(publishedBlogPostSlugs: readonly string[]): PublishedBlogPostCatalogue {
	const knownPublishedBlogPostSlugs = new Set(publishedBlogPostSlugs);

	return {
		hasPublishedBlogPost(postSlug): postSlug is PublishedBlogPostSlug {
			return knownPublishedBlogPostSlugs.has(postSlug);
		}
	};
}

function createDefaultTestBlogReactionRepository(
	recordEvent: TestEventRecorder | undefined
): TestBlogReactionRepository {
	const snapshot = {
		count: 1,
		reacted: true
	};

	if (isUndefined(recordEvent)) {
		return createTestBlogReactionRepository({ snapshot });
	}

	return createTestBlogReactionRepository({ recordEvent, snapshot });
}

function createTestApplicationService(
	createTestApplicationServiceOptions: CreateTestApplicationServiceOptions = {}
): TestApplicationService {
	const {
		createAnonymousReactorIdentifier,
		recordEvent,
		publishedBlogPostSlugs = ["quiet-post"],
		rateLimitDecision = {
			allowed: true,
			retryAfterMilliseconds: 0
		}
	} = createTestApplicationServiceOptions;

	const blogReactionRepository =
		createTestApplicationServiceOptions.blogReactionRepository ??
		createDefaultTestBlogReactionRepository(recordEvent);
	let anonymousReactorIdentifierGenerationCount = 0;
	const generateAnonymousReactorIdentifier =
		createAnonymousReactorIdentifier ??
		(() => {
			anonymousReactorIdentifierGenerationCount += 1;

			recordEvent?.("createAnonymousReactorIdentifier");

			return generatedAnonymousReactorIdentifier;
		});
	const blogReactionRateLimiter: BlogReactionRateLimiter = {
		checkMutation() {
			return rateLimitDecision;
		}
	};
	const blogReactionApplicationServiceOptions: BlogReactionApplicationServiceOptions = {
		blogReactionHmacSecret,
		blogReactionRateLimiter,
		blogReactionRepository,
		createAnonymousReactorIdentifier: generateAnonymousReactorIdentifier,
		publishedBlogPostCatalogue: createTestPublishedBlogPostCatalogue(publishedBlogPostSlugs)
	};

	return {
		blogReactionRepository,
		readAnonymousReactorIdentifierGenerationCount() {
			return anonymousReactorIdentifierGenerationCount;
		},
		service: createBlogReactionApplicationService(blogReactionApplicationServiceOptions)
	};
}

function readFirstRepositoryCall(blogReactionRepository: TestBlogReactionRepository): BlogReactionRepositoryCall {
	const [firstRepositoryCall] = blogReactionRepository.calls;

	if (isUndefined(firstRepositoryCall)) {
		throw new Error("Expected the repository to receive a call.");
	}

	return firstRepositoryCall;
}

async function unwrapTestTask<Value>(task: Task<Value, Error>): Promise<Value> {
	const taskResult = await task;

	if (taskResult.isErr) {
		throw taskResult.error;
	}

	return taskResult.value;
}

function unwrapApplicationResult<Value, ErrorType>(result: Result<Value, ErrorType>): Value {
	if (result.isErr) {
		throw new Error("Expected a successful application result.");
	}

	return result.value;
}

suite("createBlogReactionApplicationService()", function () {
	test("gets the total count without an identity and does not generate one", async function () {
		const { blogReactionRepository, readAnonymousReactorIdentifierGenerationCount, service } =
			createTestApplicationService();

		const actualResult = await unwrapTestTask(
			service.readReaction({
				anonymousReactorCookieValue: nothing(),
				postSlug: "quiet-post"
			})
		);

		assert.deepStrictEqual(actualResult, ok({ count: 1, reacted: true }));
		assert.strictEqual(readAnonymousReactorIdentifierGenerationCount(), 0);
		assert.partialDeepStrictEqual(readFirstRepositoryCall(blogReactionRepository), {
			kind: "read",
			reactorHash: nothing()
		});
	});

	test("passes a matching identity hash to GET", async function () {
		const { blogReactionRepository, service } = createTestApplicationService();

		await unwrapTestTask(
			service.readReaction({
				anonymousReactorCookieValue: just(validExistingAnonymousReactorIdentifier),
				postSlug: "quiet-post"
			})
		);

		const actualRepositoryCall = readFirstRepositoryCall(blogReactionRepository);

		if (actualRepositoryCall.kind !== "read") {
			throw new Error("Expected the repository read operation.");
		}

		assert.strictEqual(actualRepositoryCall.reactorHash.isJust, true);
		assert.notStrictEqual(actualRepositoryCall.reactorHash.value, validExistingAnonymousReactorIdentifier);
	});

	test("returns not_found without reaching the repository for an unknown post", async function () {
		const { blogReactionRepository, service } = createTestApplicationService();

		const actualResult = await unwrapTestTask(
			service.readReaction({
				anonymousReactorCookieValue: nothing(),
				postSlug: "unknown-post"
			})
		);

		assert.deepStrictEqual(actualResult, err({ kind: "not_found" }));
		assert.strictEqual(blogReactionRepository.calls.length, 0);
	});

	test("creates an identity only for a successful first PUT", async function () {
		const { blogReactionRepository, readAnonymousReactorIdentifierGenerationCount, service } =
			createTestApplicationService();

		const actualResult = await unwrapTestTask(
			service.addReaction({
				anonymousReactorCookieValue: nothing(),
				clientAddress: just("192.0.2.1"),
				postSlug: "quiet-post"
			})
		);

		assert.deepStrictEqual(
			actualResult,
			ok({
				createdAnonymousReactorIdentifier: just(generatedAnonymousReactorIdentifier),
				snapshot: {
					count: 1,
					reacted: true
				}
			})
		);
		assert.strictEqual(readAnonymousReactorIdentifierGenerationCount(), 1);
		assert.strictEqual(blogReactionRepository.calls.length, 1);
	});

	test("does not generate a replacement identity for a repeated PUT", async function () {
		const { readAnonymousReactorIdentifierGenerationCount, service } = createTestApplicationService();

		const actualResult = await unwrapTestTask(
			service.addReaction({
				anonymousReactorCookieValue: just(validExistingAnonymousReactorIdentifier),
				clientAddress: just("192.0.2.1"),
				postSlug: "quiet-post"
			})
		);

		const actualOutcome = unwrapApplicationResult(actualResult);

		assert.strictEqual(readAnonymousReactorIdentifierGenerationCount(), 0);
		assert.strictEqual(actualOutcome.createdAnonymousReactorIdentifier.isNothing, true);
	});

	test("treats malformed cookies as absent and replaces them on successful PUT", async function () {
		const { service } = createTestApplicationService();

		const actualResult = await unwrapTestTask(
			service.addReaction({
				anonymousReactorCookieValue: just("malformed-cookie"),
				clientAddress: just("192.0.2.1"),
				postSlug: "quiet-post"
			})
		);

		const actualOutcome = unwrapApplicationResult(actualResult);

		assert.deepStrictEqual(
			actualOutcome.createdAnonymousReactorIdentifier,
			just(generatedAnonymousReactorIdentifier)
		);
	});

	test("removes a reaction with a valid identity without rotating the cookie", async function () {
		const { blogReactionRepository, readAnonymousReactorIdentifierGenerationCount, service } =
			createTestApplicationService();

		const actualResult = await unwrapTestTask(
			service.removeReaction({
				anonymousReactorCookieValue: just(validExistingAnonymousReactorIdentifier),
				clientAddress: just("192.0.2.1"),
				postSlug: "quiet-post"
			})
		);

		const actualOutcome = unwrapApplicationResult(actualResult);

		assert.strictEqual(actualOutcome.createdAnonymousReactorIdentifier.isNothing, true);
		assert.strictEqual(readAnonymousReactorIdentifierGenerationCount(), 0);
		assert.partialDeepStrictEqual(readFirstRepositoryCall(blogReactionRepository), { kind: "remove" });
	});

	test("removes without an identity by reading the current count", async function () {
		const { blogReactionRepository, readAnonymousReactorIdentifierGenerationCount, service } =
			createTestApplicationService();

		const actualResult = await unwrapTestTask(
			service.removeReaction({
				anonymousReactorCookieValue: nothing(),
				clientAddress: just("192.0.2.1"),
				postSlug: "quiet-post"
			})
		);

		const actualOutcome = unwrapApplicationResult(actualResult);

		assert.strictEqual(actualOutcome.createdAnonymousReactorIdentifier.isNothing, true);
		assert.strictEqual(readAnonymousReactorIdentifierGenerationCount(), 0);
		assert.partialDeepStrictEqual(readFirstRepositoryCall(blogReactionRepository), { kind: "read" });
	});

	test("returns rate_limited without generating an identity or reaching the repository", async function () {
		const blogReactionRepository = createTestBlogReactionRepository();
		const { service, readAnonymousReactorIdentifierGenerationCount } = createTestApplicationService({
			blogReactionRepository,
			rateLimitDecision: {
				allowed: false,
				retryAfterMilliseconds: 12_345
			}
		});

		const actualResult = await unwrapTestTask(
			service.addReaction({
				anonymousReactorCookieValue: nothing(),
				clientAddress: just("192.0.2.1"),
				postSlug: "quiet-post"
			})
		);

		assert.deepStrictEqual(
			actualResult,
			err({
				kind: "rate_limited",
				retryAfterMilliseconds: 12_345
			})
		);
		assert.strictEqual(blogReactionRepository.calls.length, 0);
		assert.strictEqual(readAnonymousReactorIdentifierGenerationCount(), 0);
	});

	test("normalizes repository failures as rejected tasks", async function () {
		const expectedError = new Error("database unavailable");
		const blogReactionRepository = createTestBlogReactionRepository({ error: expectedError });
		const { service } = createTestApplicationService({ blogReactionRepository });

		const actualTaskResult = await service.readReaction({
			anonymousReactorCookieValue: nothing(),
			postSlug: "quiet-post"
		});
		const actualError = actualTaskResult.match({
			Err(error) {
				return error;
			},
			Ok() {
				throw new Error("Expected the application task to reject.");
			}
		});

		assert.strictEqual(actualError, expectedError);
	});

	test("generates the identity before reaching the repository", async function () {
		const eventLog: string[] = [];
		const { service } = createTestApplicationService({
			recordEvent(eventName) {
				eventLog.push(eventName);
			}
		});

		await unwrapTestTask(
			service.addReaction({
				anonymousReactorCookieValue: nothing(),
				clientAddress: just("192.0.2.1"),
				postSlug: "quiet-post"
			})
		);

		assert.deepStrictEqual(eventLog, ["createAnonymousReactorIdentifier", "addReactionAndReadSnapshot"]);
	});
});
