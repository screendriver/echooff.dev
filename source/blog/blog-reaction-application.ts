import { isError } from "@sindresorhus/is";
import { err, ok, type Result } from "true-myth/result";
import { just, nothing, type Maybe } from "true-myth/maybe";
import { tryOrElse, type Task } from "true-myth/task";
import {
	parseAnonymousReactorIdentifier,
	type AnonymousReactorIdentifierParseResult
} from "./blog-reaction-identity.ts";
import type { AnonymousReactorIdentifier } from "./blog-reaction-identity-schema.ts";
import { createBlogReactionHash } from "./blog-reaction-hmac.ts";
import type { BlogReactionHmacSecret } from "./blog-reaction-runtime-configuration-schema.ts";
import type { BlogReactionRateLimiter, BlogReactionRateLimitDecision } from "./blog-reaction-rate-limiter.ts";
import type { BlogReactionRepository, BlogReactionSnapshot } from "./blog-reaction.ts";
import type { PublishedBlogPostCatalogue, PublishedBlogPostSlug } from "./published-blog-post-catalogue.ts";

export type BlogReactionNotFoundError = {
	readonly kind: "not_found";
};

export type BlogReactionRateLimitedError = {
	readonly kind: "rate_limited";
	readonly retryAfterMilliseconds: number;
};

export type BlogReactionApplicationError = BlogReactionNotFoundError | BlogReactionRateLimitedError;

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

export type BlogReactionApplicationTaskResult<Value> = Task<Result<Value, BlogReactionApplicationError>, Error>;

export type BlogReactionApplicationService = {
	readonly addReaction: (
		mutateBlogReactionOptions: MutateBlogReactionOptions
	) => BlogReactionApplicationTaskResult<BlogReactionMutationOutcome>;
	readonly readReaction: (
		readBlogReactionOptions: ReadBlogReactionOptions
	) => BlogReactionApplicationTaskResult<BlogReactionSnapshot>;
	readonly removeReaction: (
		mutateBlogReactionOptions: MutateBlogReactionOptions
	) => BlogReactionApplicationTaskResult<BlogReactionMutationOutcome>;
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

function normalizeBlogReactionApplicationError(error: unknown): Error {
	if (isError(error)) {
		return error;
	}

	return new Error("The blog reaction application operation failed.");
}

function resolvePublishedBlogPostSlug(
	publishedBlogPostCatalogue: PublishedBlogPostCatalogue,
	postSlug: string
): Result<PublishedBlogPostSlug, BlogReactionApplicationError> {
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
): Maybe<BlogReactionApplicationError> {
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
			return tryOrElse(normalizeBlogReactionApplicationError, async () => {
				const { anonymousReactorCookieValue, clientAddress, postSlug } = mutateBlogReactionOptions;
				const publishedBlogPostSlugResult = resolvePublishedBlogPostSlug(publishedBlogPostCatalogue, postSlug);

				if (publishedBlogPostSlugResult.isErr) {
					return err(publishedBlogPostSlugResult.error);
				}

				const rateLimitError = readRateLimitError(blogReactionRateLimiter, clientAddress);

				if (rateLimitError.isJust) {
					return err(rateLimitError.value);
				}

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
					throw repositoryResult.error;
				}

				return ok({
					createdAnonymousReactorIdentifier:
						resolvedAnonymousReactorIdentity.createdAnonymousReactorIdentifier,
					snapshot: repositoryResult.value
				});
			});
		},
		readReaction(readBlogReactionOptions) {
			return tryOrElse(normalizeBlogReactionApplicationError, async () => {
				const { anonymousReactorCookieValue, postSlug } = readBlogReactionOptions;
				const publishedBlogPostSlugResult = resolvePublishedBlogPostSlug(publishedBlogPostCatalogue, postSlug);

				if (publishedBlogPostSlugResult.isErr) {
					return err(publishedBlogPostSlugResult.error);
				}

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
					throw repositoryResult.error;
				}

				return ok(repositoryResult.value);
			});
		},
		removeReaction(mutateBlogReactionOptions) {
			return tryOrElse(normalizeBlogReactionApplicationError, async () => {
				const { anonymousReactorCookieValue, clientAddress, postSlug } = mutateBlogReactionOptions;
				const publishedBlogPostSlugResult = resolvePublishedBlogPostSlug(publishedBlogPostCatalogue, postSlug);

				if (publishedBlogPostSlugResult.isErr) {
					return err(publishedBlogPostSlugResult.error);
				}

				const rateLimitError = readRateLimitError(blogReactionRateLimiter, clientAddress);

				if (rateLimitError.isJust) {
					return err(rateLimitError.value);
				}

				const anonymousReactorIdentifier = treatMalformedAnonymousReactorIdentifierAsAbsent(
					parseAnonymousReactorIdentifier(anonymousReactorCookieValue)
				);

				if (anonymousReactorIdentifier.isNothing) {
					const repositoryResult = await blogReactionRepository.readSnapshot(
						publishedBlogPostSlugResult.value,
						nothing()
					);

					if (repositoryResult.isErr) {
						throw repositoryResult.error;
					}

					return ok({
						createdAnonymousReactorIdentifier: nothing(),
						snapshot: repositoryResult.value
					});
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
					throw repositoryResult.error;
				}

				return ok({
					createdAnonymousReactorIdentifier: nothing(),
					snapshot: repositoryResult.value
				});
			});
		}
	};
}
