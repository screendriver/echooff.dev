import { isUndefined } from "@sindresorhus/is";
import type { Clock } from "@enormora/clock/clock";
import type { Maybe } from "true-myth/maybe";

export const blogReactionMutationRateLimit = 30;
export const blogReactionRateLimitWindowMilliseconds = 60 * 1000;
export const unknownReactionClientAddress = "unknown-client";

export type BlogReactionRateLimitBucket = {
	readonly requestCount: number;
	readonly windowStartedAtMonotonicMilliseconds: number;
};

export type BlogReactionRateLimiterState = Map<string, BlogReactionRateLimitBucket>;

export type BlogReactionRateLimiterOptions = {
	readonly rateLimiterState: BlogReactionRateLimiterState;
	readonly clock: Clock;
};

export type BlogReactionRateLimitDecision = {
	readonly allowed: boolean;
	readonly retryAfterMilliseconds: number;
};

export type BlogReactionRateLimiter = {
	readonly checkMutation: (clientAddress: Maybe<string>) => BlogReactionRateLimitDecision;
};

type CheckMutationOptions = {
	readonly clientAddress: Maybe<string>;
	readonly currentMonotonicMilliseconds: number;
	readonly rateLimiterState: BlogReactionRateLimiterState;
};

function removeExpiredRateLimitBuckets(
	rateLimiterState: BlogReactionRateLimiterState,
	currentMonotonicMilliseconds: number
): void {
	for (const [clientAddress, rateLimitBucket] of rateLimiterState) {
		const bucketExpiresAtMonotonicMilliseconds =
			rateLimitBucket.windowStartedAtMonotonicMilliseconds + blogReactionRateLimitWindowMilliseconds;

		if (currentMonotonicMilliseconds >= bucketExpiresAtMonotonicMilliseconds) {
			rateLimiterState.delete(clientAddress);
		}
	}
}

function createAllowedMutationDecision(): BlogReactionRateLimitDecision {
	return {
		allowed: true,
		retryAfterMilliseconds: 0
	};
}

function createRateLimitedMutationDecision(
	currentMonotonicMilliseconds: number,
	rateLimitBucket: BlogReactionRateLimitBucket
): BlogReactionRateLimitDecision {
	const bucketExpiresAtMonotonicMilliseconds =
		rateLimitBucket.windowStartedAtMonotonicMilliseconds + blogReactionRateLimitWindowMilliseconds;

	return {
		allowed: false,
		retryAfterMilliseconds: bucketExpiresAtMonotonicMilliseconds - currentMonotonicMilliseconds
	};
}

function checkMutation(checkMutationOptions: CheckMutationOptions): BlogReactionRateLimitDecision {
	const { clientAddress, currentMonotonicMilliseconds, rateLimiterState } = checkMutationOptions;
	const clientAddressKey = clientAddress.unwrapOr(unknownReactionClientAddress);
	const currentRateLimitBucket = rateLimiterState.get(clientAddressKey);

	if (isUndefined(currentRateLimitBucket)) {
		rateLimiterState.set(clientAddressKey, {
			requestCount: 1,
			windowStartedAtMonotonicMilliseconds: currentMonotonicMilliseconds
		});

		return createAllowedMutationDecision();
	}

	if (currentRateLimitBucket.requestCount >= blogReactionMutationRateLimit) {
		return createRateLimitedMutationDecision(currentMonotonicMilliseconds, currentRateLimitBucket);
	}

	rateLimiterState.set(clientAddressKey, {
		requestCount: currentRateLimitBucket.requestCount + 1,
		windowStartedAtMonotonicMilliseconds: currentRateLimitBucket.windowStartedAtMonotonicMilliseconds
	});

	return createAllowedMutationDecision();
}

export function createBlogReactionRateLimiter(
	blogReactionRateLimiterOptions: BlogReactionRateLimiterOptions
): BlogReactionRateLimiter {
	const { rateLimiterState, clock } = blogReactionRateLimiterOptions;

	return {
		checkMutation(clientAddress) {
			const currentMonotonicMilliseconds = Number(clock.currentMonotonicMicroseconds / 1000n);
			removeExpiredRateLimitBuckets(rateLimiterState, currentMonotonicMilliseconds);

			return checkMutation({
				clientAddress,
				currentMonotonicMilliseconds,
				rateLimiterState
			});
		}
	};
}
