import { isUndefined } from "@sindresorhus/is";
import type { WallClock } from "@enormora/wall-clock";
import type { Maybe } from "true-myth/maybe";

export const blogReactionMutationRateLimit = 30;
export const blogReactionRateLimitWindowMilliseconds = 60 * 1000;
export const unknownReactionClientAddress = "unknown-client";

export type BlogReactionRateLimitBucket = {
	readonly requestCount: number;
	readonly windowStartedAtMilliseconds: number;
};

export type BlogReactionRateLimiterState = Map<string, BlogReactionRateLimitBucket>;

export type BlogReactionRateLimiterOptions = {
	readonly rateLimiterState: BlogReactionRateLimiterState;
	readonly wallClock: WallClock;
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
	readonly currentTimestampInMilliseconds: number;
	readonly rateLimiterState: BlogReactionRateLimiterState;
};

function removeExpiredRateLimitBuckets(
	rateLimiterState: BlogReactionRateLimiterState,
	currentTimestampInMilliseconds: number
): void {
	for (const [clientAddress, rateLimitBucket] of rateLimiterState) {
		const bucketExpiresAtMilliseconds =
			rateLimitBucket.windowStartedAtMilliseconds + blogReactionRateLimitWindowMilliseconds;

		if (currentTimestampInMilliseconds >= bucketExpiresAtMilliseconds) {
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
	currentTimestampInMilliseconds: number,
	rateLimitBucket: BlogReactionRateLimitBucket
): BlogReactionRateLimitDecision {
	const bucketExpiresAtMilliseconds =
		rateLimitBucket.windowStartedAtMilliseconds + blogReactionRateLimitWindowMilliseconds;

	return {
		allowed: false,
		retryAfterMilliseconds: bucketExpiresAtMilliseconds - currentTimestampInMilliseconds
	};
}

function checkMutation(checkMutationOptions: CheckMutationOptions): BlogReactionRateLimitDecision {
	const { clientAddress, currentTimestampInMilliseconds, rateLimiterState } = checkMutationOptions;
	const clientAddressKey = clientAddress.unwrapOr(unknownReactionClientAddress);
	const currentRateLimitBucket = rateLimiterState.get(clientAddressKey);

	if (isUndefined(currentRateLimitBucket)) {
		rateLimiterState.set(clientAddressKey, {
			requestCount: 1,
			windowStartedAtMilliseconds: currentTimestampInMilliseconds
		});

		return createAllowedMutationDecision();
	}

	if (currentRateLimitBucket.requestCount >= blogReactionMutationRateLimit) {
		return createRateLimitedMutationDecision(currentTimestampInMilliseconds, currentRateLimitBucket);
	}

	rateLimiterState.set(clientAddressKey, {
		requestCount: currentRateLimitBucket.requestCount + 1,
		windowStartedAtMilliseconds: currentRateLimitBucket.windowStartedAtMilliseconds
	});

	return createAllowedMutationDecision();
}

export function createBlogReactionRateLimiter(
	blogReactionRateLimiterOptions: BlogReactionRateLimiterOptions
): BlogReactionRateLimiter {
	const { rateLimiterState, wallClock } = blogReactionRateLimiterOptions;

	return {
		checkMutation(clientAddress) {
			const { currentTimestampInMilliseconds } = wallClock;
			removeExpiredRateLimitBuckets(rateLimiterState, currentTimestampInMilliseconds);

			return checkMutation({
				clientAddress,
				currentTimestampInMilliseconds,
				rateLimiterState
			});
		}
	};
}
