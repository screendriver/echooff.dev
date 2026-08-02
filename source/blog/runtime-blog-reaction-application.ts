import { isDirectInstanceOf, isError } from "@sindresorhus/is";
import { type } from "arktype";
import { just, nothing, type Maybe } from "true-myth/maybe";
import { tryOrElse, type Task } from "true-myth/task";
import {
	createBlogReactionApplicationService,
	type BlogReactionApplicationService,
	type BlogReactionApplicationServiceOptions
} from "./blog-reaction-application.ts";
import type { AnonymousReactorIdentifier } from "./blog-reaction-identity-schema.ts";
import type { BlogReactionRateLimiter } from "./blog-reaction-rate-limiter.ts";
import type { BlogReactionRepository } from "./blog-reaction.ts";
import {
	blogReactionRuntimeEnvironmentSchema,
	type BlogReactionRuntimeEnvironment
} from "./blog-reaction-runtime-configuration-schema.ts";
import type { PublishedBlogPostCatalogue } from "./published-blog-post-catalogue.ts";

export type RuntimeBlogReactionApplicationServiceOptions = {
	readonly blogReactionRateLimiter: BlogReactionRateLimiter;
	readonly createAnonymousReactorIdentifier: () => AnonymousReactorIdentifier;
	readonly loadPublishedBlogPostCatalogue: () => Task<PublishedBlogPostCatalogue, Error>;
	readonly readBlogReactionRepository: () => Task<BlogReactionRepository, Error>;
	readonly readRuntimeEnvironment: () => unknown;
};

function normalizeRuntimeBlogReactionApplicationError(error: unknown): Error {
	if (isError(error)) {
		return error;
	}

	return new Error("The runtime blog reaction application setup failed.");
}

function parseRuntimeBlogReactionEnvironment(runtimeEnvironmentInput: unknown): BlogReactionRuntimeEnvironment {
	const runtimeEnvironment = blogReactionRuntimeEnvironmentSchema(runtimeEnvironmentInput);

	if (isDirectInstanceOf(runtimeEnvironment, type.errors)) {
		throw new Error("The blog reaction runtime configuration is invalid.");
	}

	return runtimeEnvironment;
}

async function loadRuntimeBlogReactionApplicationService(
	runtimeBlogReactionApplicationServiceOptions: RuntimeBlogReactionApplicationServiceOptions
): Promise<BlogReactionApplicationService> {
	const {
		blogReactionRateLimiter,
		createAnonymousReactorIdentifier,
		loadPublishedBlogPostCatalogue,
		readBlogReactionRepository,
		readRuntimeEnvironment
	} = runtimeBlogReactionApplicationServiceOptions;
	const runtimeEnvironment = parseRuntimeBlogReactionEnvironment(readRuntimeEnvironment());
	const [publishedBlogPostCatalogueResult, blogReactionRepositoryResult] = await Promise.all([
		loadPublishedBlogPostCatalogue(),
		readBlogReactionRepository()
	]);

	if (publishedBlogPostCatalogueResult.isErr) {
		throw publishedBlogPostCatalogueResult.error;
	}

	if (blogReactionRepositoryResult.isErr) {
		throw blogReactionRepositoryResult.error;
	}

	const blogReactionApplicationServiceOptions: BlogReactionApplicationServiceOptions = {
		blogReactionHmacSecret: runtimeEnvironment.BLOG_REACTION_HMAC_SECRET,
		blogReactionRateLimiter,
		blogReactionRepository: blogReactionRepositoryResult.value,
		createAnonymousReactorIdentifier,
		publishedBlogPostCatalogue: publishedBlogPostCatalogueResult.value
	};

	return createBlogReactionApplicationService(blogReactionApplicationServiceOptions);
}

export function createRuntimeBlogReactionApplicationServiceTaskReader(
	runtimeBlogReactionApplicationServiceOptions: RuntimeBlogReactionApplicationServiceOptions
): () => Task<BlogReactionApplicationService, Error> {
	let createdBlogReactionApplicationServiceTask: Maybe<Task<BlogReactionApplicationService, Error>> = nothing();

	return () => {
		return createdBlogReactionApplicationServiceTask.match({
			Just(blogReactionApplicationServiceTask) {
				return blogReactionApplicationServiceTask;
			},
			Nothing() {
				const blogReactionApplicationServiceTask = tryOrElse(
					normalizeRuntimeBlogReactionApplicationError,
					async () => {
						return loadRuntimeBlogReactionApplicationService(runtimeBlogReactionApplicationServiceOptions);
					}
				);

				createdBlogReactionApplicationServiceTask = just(blogReactionApplicationServiceTask);

				return blogReactionApplicationServiceTask;
			}
		});
	};
}
