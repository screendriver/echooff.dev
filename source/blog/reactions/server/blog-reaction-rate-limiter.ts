import { isUndefined } from "@sindresorhus/is";
import type { Clock } from "@enormora/clock/clock";
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
	readonly currentUnixEpochMilliseconds: number;
	readonly rateLimiterState: BlogReactionRateLimiterState;
};

function removeExpiredRateLimitBuckets(
	rateLimiterState: BlogReactionRateLimiterState,
	currentUnixEpochMilliseconds: number
): void {
	for (const [clientAddress, rateLimitBucket] of rateLimiterState) {
		const bucketExpiresAtMilliseconds =
			rateLimitBucket.windowStartedAtMilliseconds + blogReactionRateLimitWindowMilliseconds;

		if (currentUnixEpochMilliseconds >= bucketExpiresAtMilliseconds) {
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
	currentUnixEpochMilliseconds: number,
	rateLimitBucket: BlogReactionRateLimitBucket
): BlogReactionRateLimitDecision {
	const bucketExpiresAtMilliseconds =
		rateLimitBucket.windowStartedAtMilliseconds + blogReactionRateLimitWindowMilliseconds;

	return {
		allowed: false,
		retryAfterMilliseconds: bucketExpiresAtMilliseconds - currentUnixEpochMilliseconds
	};
}

function checkMutation(checkMutationOptions: CheckMutationOptions): BlogReactionRateLimitDecision {
	const { clientAddress, currentUnixEpochMilliseconds, rateLimiterState } = checkMutationOptions;
	const clientAddressKey = clientAddress.unwrapOr(unknownReactionClientAddress);
	const currentRateLimitBucket = rateLimiterState.get(clientAddressKey);

	if (isUndefined(currentRateLimitBucket)) {
		rateLimiterState.set(clientAddressKey, {
			requestCount: 1,
			windowStartedAtMilliseconds: currentUnixEpochMilliseconds
		});

		return createAllowedMutationDecision();
	}

	if (currentRateLimitBucket.requestCount >= blogReactionMutationRateLimit) {
		return createRateLimitedMutationDecision(currentUnixEpochMilliseconds, currentRateLimitBucket);
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
	const { rateLimiterState, clock } = blogReactionRateLimiterOptions;

	return {
		checkMutation(clientAddress) {
			const { currentUnixEpochMilliseconds } = clock;
			removeExpiredRateLimitBuckets(rateLimiterState, currentUnixEpochMilliseconds);

			return checkMutation({
				clientAddress,
				currentUnixEpochMilliseconds,
				rateLimiterState
			});
		}
	};
}
