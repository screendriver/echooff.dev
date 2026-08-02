import assert from "node:assert";
import { createDeterministicWallClock } from "@enormora/wall-clock";
import { suite, test } from "mocha";
import { just, nothing, type Maybe } from "true-myth/maybe";
import {
	blogReactionMutationRateLimit,
	blogReactionRateLimitWindowMilliseconds,
	createBlogReactionRateLimiter,
	type BlogReactionRateLimitDecision,
	type BlogReactionRateLimiterState
} from "./blog-reaction-rate-limiter.ts";

function createTestRateLimiterState(): BlogReactionRateLimiterState {
	return new Map();
}

type TestRateLimiter = {
	readonly checkMutation: (clientAddress: Maybe<string>) => BlogReactionRateLimitDecision;
	readonly rateLimiterState: BlogReactionRateLimiterState;
	readonly wallClock: ReturnType<typeof createDeterministicWallClock>;
};

function createTestRateLimiter(
	rateLimiterState: BlogReactionRateLimiterState = createTestRateLimiterState()
): TestRateLimiter {
	const wallClock = createDeterministicWallClock({
		initialCurrentTimestampInMilliseconds: 1000
	});
	const blogReactionRateLimiter = createBlogReactionRateLimiter({
		rateLimiterState,
		wallClock
	});

	return {
		checkMutation: blogReactionRateLimiter.checkMutation,
		rateLimiterState,
		wallClock
	};
}

suite("createBlogReactionRateLimiter()", function () {
	test("accepts requests below the mutation limit", function () {
		const { checkMutation } = createTestRateLimiter();
		const actualDecisions: BlogReactionRateLimitDecision[] = [];

		for (let requestNumber = 0; requestNumber < blogReactionMutationRateLimit; requestNumber += 1) {
			actualDecisions.push(checkMutation(just("192.0.2.1")));
		}

		assert.strictEqual(
			actualDecisions.every((decision) => {
				return decision.allowed;
			}),
			true
		);
	});

	test("rejects the request crossing the mutation limit", function () {
		const { checkMutation } = createTestRateLimiter();

		for (let requestNumber = 0; requestNumber < blogReactionMutationRateLimit; requestNumber += 1) {
			checkMutation(just("192.0.2.1"));
		}

		const actualDecision = checkMutation(just("192.0.2.1"));
		const expectedDecision = {
			allowed: false,
			retryAfterMilliseconds: blogReactionRateLimitWindowMilliseconds
		};

		assert.deepStrictEqual(actualDecision, expectedDecision);
	});

	test("returns the remaining duration of the current window", function () {
		const { checkMutation, wallClock } = createTestRateLimiter();

		for (let requestNumber = 0; requestNumber < blogReactionMutationRateLimit; requestNumber += 1) {
			checkMutation(just("192.0.2.1"));
		}
		wallClock.advanceByMilliseconds(12_345);

		const actualDecision = checkMutation(just("192.0.2.1"));
		const expectedRetryAfterMilliseconds = blogReactionRateLimitWindowMilliseconds - 12_345;
		const expectedDecision = {
			allowed: false,
			retryAfterMilliseconds: expectedRetryAfterMilliseconds
		};

		assert.deepStrictEqual(actualDecision, expectedDecision);
	});

	test("resets a bucket after the fixed window", function () {
		const { checkMutation, wallClock } = createTestRateLimiter();

		for (let requestNumber = 0; requestNumber < blogReactionMutationRateLimit; requestNumber += 1) {
			checkMutation(just("192.0.2.1"));
		}
		wallClock.advanceByMilliseconds(blogReactionRateLimitWindowMilliseconds);

		const actualDecision = checkMutation(just("192.0.2.1"));

		assert.deepStrictEqual(actualDecision, {
			allowed: true,
			retryAfterMilliseconds: 0
		});
	});

	test("keeps different client addresses in independent buckets", function () {
		const { checkMutation } = createTestRateLimiter();

		for (let requestNumber = 0; requestNumber < blogReactionMutationRateLimit; requestNumber += 1) {
			checkMutation(just("192.0.2.1"));
		}

		const actualDecisionForDifferentAddress = checkMutation(just("192.0.2.2"));

		assert.deepStrictEqual(actualDecisionForDifferentAddress, {
			allowed: true,
			retryAfterMilliseconds: 0
		});
	});

	test("uses one conservative bucket when the client address is unknown", function () {
		const { checkMutation } = createTestRateLimiter();

		for (let requestNumber = 0; requestNumber < blogReactionMutationRateLimit; requestNumber += 1) {
			checkMutation(nothing());
		}

		const actualDecision = checkMutation(nothing());

		assert.strictEqual(actualDecision.allowed, false);
	});

	test("removes expired buckets when a later mutation is checked", function () {
		const rateLimiterState = createTestRateLimiterState();
		const { checkMutation, wallClock } = createTestRateLimiter(rateLimiterState);

		checkMutation(just("192.0.2.1"));
		assert.strictEqual(rateLimiterState.size, 1);

		wallClock.advanceByMilliseconds(blogReactionRateLimitWindowMilliseconds);
		checkMutation(just("192.0.2.2"));

		assert.strictEqual(rateLimiterState.size, 1);
		assert.strictEqual(rateLimiterState.has("192.0.2.1"), false);
		assert.strictEqual(rateLimiterState.has("192.0.2.2"), true);
	});
});
