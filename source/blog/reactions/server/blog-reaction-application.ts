import { isError } from "@sindresorhus/is";
import { just, nothing, type Maybe } from "true-myth/maybe";
import { err, ok, type Result } from "true-myth/result";
import { reject as rejectTask, tryOrElse, type Task } from "true-myth/task";
import type { PublishedBlogPostCatalogue, PublishedBlogPostSlug } from "../../published-blog-post-catalogue.ts";
import {
	parseAnonymousReactorIdentifier,
	type AnonymousReactorIdentifierParseResult
} from "./blog-reaction-identity.ts";
import type { AnonymousReactorIdentifier } from "./blog-reaction-identity-schema.ts";
import { createBlogReactionHash } from "./blog-reaction-hmac.ts";
import type { BlogReactionHmacSecret } from "./blog-reaction-runtime-configuration-schema.ts";
import type { BlogReactionRateLimiter, BlogReactionRateLimitDecision } from "./blog-reaction-rate-limiter.ts";
import type { BlogReactionRepository, BlogReactionSnapshot } from "./blog-reaction.ts";

type BlogReactionInfrastructureFailure = {
	readonly cause: Error;
	readonly kind: "infrastructure_failure";
};

type BlogReactionNotFoundFailure = {
	readonly kind: "not_found";
};

type BlogReactionRateLimitedFailure = {
	readonly kind: "rate_limited";
	readonly retryAfterMilliseconds: number;
};

type BlogReactionFailureByKind = {
	readonly infrastructure_failure: BlogReactionInfrastructureFailure;
	readonly not_found: BlogReactionNotFoundFailure;
	readonly rate_limited: BlogReactionRateLimitedFailure;
};

export type BlogReactionFailure = BlogReactionFailureByKind[keyof BlogReactionFailureByKind];

export type BlogReactionMutationOutcome = {
	readonly createdAnonymousReactorIdentifier: Maybe<AnonymousReactorIdentifier>;
	readonly snapshot: BlogReactionSnapshot;
};

export type ReadBlogReactionOptions = {
	readonly anonymousReactorCookieValue: Maybe<string>;
	readonly postSlug: string;
};

export type MutateBlogReactionOptions = {
	readonly anonymousReactorCookieValue: Maybe<string>;
	readonly clientAddress: Maybe<string>;
	readonly postSlug: string;
};

export type BlogReactionApplicationService = {
	readonly addReaction: (
		mutateBlogReactionOptions: MutateBlogReactionOptions
	) => Task<BlogReactionMutationOutcome, BlogReactionFailure>;
	readonly readReaction: (
		readBlogReactionOptions: ReadBlogReactionOptions
	) => Task<BlogReactionSnapshot, BlogReactionFailure>;
	readonly removeReaction: (
		mutateBlogReactionOptions: MutateBlogReactionOptions
	) => Task<BlogReactionMutationOutcome, BlogReactionFailure>;
};

export type BlogReactionApplicationServiceOptions = {
	readonly blogReactionHmacSecret: BlogReactionHmacSecret;
	readonly blogReactionRateLimiter: BlogReactionRateLimiter;
	readonly blogReactionRepository: BlogReactionRepository;
	readonly createAnonymousReactorIdentifier: () => AnonymousReactorIdentifier;
	readonly publishedBlogPostCatalogue: PublishedBlogPostCatalogue;
};

type ResolvedAnonymousReactorIdentity = {
	readonly anonymousReactorIdentifier: AnonymousReactorIdentifier;
	readonly createdAnonymousReactorIdentifier: Maybe<AnonymousReactorIdentifier>;
};

function normalizeBlogReactionError(error: unknown): Error {
	if (isError(error)) {
		return error;
	}

	return new Error("The blog reaction application operation failed.");
}

function normalizeBlogReactionInfrastructureFailure(error: unknown): BlogReactionFailure {
	return {
		cause: normalizeBlogReactionError(error),
		kind: "infrastructure_failure"
	};
}

function resolvePublishedBlogPostSlug(
	publishedBlogPostCatalogue: PublishedBlogPostCatalogue,
	postSlug: string
): Result<PublishedBlogPostSlug, Extract<BlogReactionFailure, { readonly kind: "not_found" }>> {
	if (!publishedBlogPostCatalogue.hasPublishedBlogPost(postSlug)) {
		return err({
			kind: "not_found"
		});
	}

	return ok(postSlug);
}

function readRateLimitError(
	blogReactionRateLimiter: BlogReactionRateLimiter,
	clientAddress: Maybe<string>
): Maybe<Extract<BlogReactionFailure, { readonly kind: "rate_limited" }>> {
	const rateLimitDecision: BlogReactionRateLimitDecision = blogReactionRateLimiter.checkMutation(clientAddress);

	if (rateLimitDecision.allowed) {
		return nothing();
	}

	return just({
		kind: "rate_limited",
		retryAfterMilliseconds: rateLimitDecision.retryAfterMilliseconds
	});
}

function treatMalformedAnonymousReactorIdentifierAsAbsent(
	anonymousReactorIdentifierParseResult: AnonymousReactorIdentifierParseResult
): Maybe<AnonymousReactorIdentifier> {
	return anonymousReactorIdentifierParseResult.match({
		Ok(anonymousReactorIdentifier) {
			return anonymousReactorIdentifier;
		},
		Err() {
			return nothing<AnonymousReactorIdentifier>();
		}
	});
}

function resolveAnonymousReactorIdentity(
	anonymousReactorCookieValue: Maybe<string>,
	createAnonymousReactorIdentifier: () => AnonymousReactorIdentifier
): ResolvedAnonymousReactorIdentity {
	const existingAnonymousReactorIdentifier = treatMalformedAnonymousReactorIdentifierAsAbsent(
		parseAnonymousReactorIdentifier(anonymousReactorCookieValue)
	);

	return existingAnonymousReactorIdentifier.match({
		Just(anonymousReactorIdentifier) {
			return {
				anonymousReactorIdentifier,
				createdAnonymousReactorIdentifier: nothing()
			};
		},
		Nothing() {
			const anonymousReactorIdentifier = createAnonymousReactorIdentifier();

			return {
				anonymousReactorIdentifier,
				createdAnonymousReactorIdentifier: just(anonymousReactorIdentifier)
			};
		}
	});
}

export function createBlogReactionApplicationService(
	blogReactionApplicationServiceOptions: BlogReactionApplicationServiceOptions
): BlogReactionApplicationService {
	const {
		blogReactionHmacSecret,
		blogReactionRateLimiter,
		blogReactionRepository,
		createAnonymousReactorIdentifier,
		publishedBlogPostCatalogue
	} = blogReactionApplicationServiceOptions;

	return {
		addReaction(mutateBlogReactionOptions) {
			const { anonymousReactorCookieValue, clientAddress, postSlug } = mutateBlogReactionOptions;
			const publishedBlogPostSlugResult = resolvePublishedBlogPostSlug(publishedBlogPostCatalogue, postSlug);

			if (publishedBlogPostSlugResult.isErr) {
				return rejectTask<BlogReactionMutationOutcome, BlogReactionFailure>(publishedBlogPostSlugResult.error);
			}

			const rateLimitError = readRateLimitError(blogReactionRateLimiter, clientAddress);

			if (rateLimitError.isJust) {
				return rejectTask<BlogReactionMutationOutcome, BlogReactionFailure>(rateLimitError.value);
			}

			return tryOrElse(normalizeBlogReactionInfrastructureFailure, async () => {
				const resolvedAnonymousReactorIdentity = resolveAnonymousReactorIdentity(
					anonymousReactorCookieValue,
					createAnonymousReactorIdentifier
				);
				const reactorHash = createBlogReactionHash({
					anonymousReactorIdentifier: resolvedAnonymousReactorIdentity.anonymousReactorIdentifier,
					postSlug: publishedBlogPostSlugResult.value,
					secret: blogReactionHmacSecret
				});
				const repositoryResult = await blogReactionRepository.addReactionAndReadSnapshot(
					publishedBlogPostSlugResult.value,
					reactorHash
				);

				if (repositoryResult.isErr) {
					throw normalizeBlogReactionError(repositoryResult.error);
				}

				return {
					createdAnonymousReactorIdentifier:
						resolvedAnonymousReactorIdentity.createdAnonymousReactorIdentifier,
					snapshot: repositoryResult.value
				};
			});
		},
		readReaction(readBlogReactionOptions) {
			const { anonymousReactorCookieValue, postSlug } = readBlogReactionOptions;
			const publishedBlogPostSlugResult = resolvePublishedBlogPostSlug(publishedBlogPostCatalogue, postSlug);

			if (publishedBlogPostSlugResult.isErr) {
				return rejectTask<BlogReactionSnapshot, BlogReactionFailure>(publishedBlogPostSlugResult.error);
			}

			return tryOrElse(normalizeBlogReactionInfrastructureFailure, async () => {
				const anonymousReactorIdentifier = treatMalformedAnonymousReactorIdentifierAsAbsent(
					parseAnonymousReactorIdentifier(anonymousReactorCookieValue)
				);
				const reactorHash = anonymousReactorIdentifier.map((resolvedAnonymousReactorIdentifier) => {
					return createBlogReactionHash({
						anonymousReactorIdentifier: resolvedAnonymousReactorIdentifier,
						postSlug: publishedBlogPostSlugResult.value,
						secret: blogReactionHmacSecret
					});
				});
				const repositoryResult = await blogReactionRepository.readSnapshot(
					publishedBlogPostSlugResult.value,
					reactorHash
				);

				if (repositoryResult.isErr) {
					throw normalizeBlogReactionError(repositoryResult.error);
				}

				return repositoryResult.value;
			});
		},
		removeReaction(mutateBlogReactionOptions) {
			const { anonymousReactorCookieValue, clientAddress, postSlug } = mutateBlogReactionOptions;
			const publishedBlogPostSlugResult = resolvePublishedBlogPostSlug(publishedBlogPostCatalogue, postSlug);

			if (publishedBlogPostSlugResult.isErr) {
				return rejectTask<BlogReactionMutationOutcome, BlogReactionFailure>(publishedBlogPostSlugResult.error);
			}

			const rateLimitError = readRateLimitError(blogReactionRateLimiter, clientAddress);

			if (rateLimitError.isJust) {
				return rejectTask<BlogReactionMutationOutcome, BlogReactionFailure>(rateLimitError.value);
			}

			return tryOrElse(normalizeBlogReactionInfrastructureFailure, async () => {
				const anonymousReactorIdentifier = treatMalformedAnonymousReactorIdentifierAsAbsent(
					parseAnonymousReactorIdentifier(anonymousReactorCookieValue)
				);

				if (anonymousReactorIdentifier.isNothing) {
					const repositoryResult = await blogReactionRepository.readSnapshot(
						publishedBlogPostSlugResult.value,
						nothing()
					);

					if (repositoryResult.isErr) {
						throw normalizeBlogReactionError(repositoryResult.error);
					}

					return {
						createdAnonymousReactorIdentifier: nothing(),
						snapshot: repositoryResult.value
					};
				}

				const reactorHash = createBlogReactionHash({
					anonymousReactorIdentifier: anonymousReactorIdentifier.value,
					postSlug: publishedBlogPostSlugResult.value,
					secret: blogReactionHmacSecret
				});
				const repositoryResult = await blogReactionRepository.removeReactionAndReadSnapshot(
					publishedBlogPostSlugResult.value,
					reactorHash
				);

				if (repositoryResult.isErr) {
					throw normalizeBlogReactionError(repositoryResult.error);
				}

				return {
					createdAnonymousReactorIdentifier: nothing(),
					snapshot: repositoryResult.value
				};
			});
		}
	};
}
