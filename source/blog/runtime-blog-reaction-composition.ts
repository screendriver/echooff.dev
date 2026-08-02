import { readFile } from "node:fs/promises";
import process from "node:process";
import { isError } from "@sindresorhus/is";
import { createWallClock } from "@enormora/wall-clock";
import { getCollection } from "astro:content";
import { tryOrElse, type Task } from "true-myth/task";
import { createBlogReactionRepository } from "./blog-reaction-database.ts";
import {
	createAnonymousReactorIdentifier,
	productionAnonymousReactorIdentityOptions
} from "./blog-reaction-identity.ts";
import { createBlogReactionRateLimiter, type BlogReactionRateLimiter } from "./blog-reaction-rate-limiter.ts";
import type { BlogReactionRepository } from "./blog-reaction.ts";
import { createRuntimeBlogReactionEnvironmentReader } from "./runtime-blog-reaction-environment.ts";
import { readRuntimeApplicationDatabaseTask } from "./runtime-application-database.ts";
import { createRuntimeBlogReactionApplicationServiceTaskReader } from "./runtime-blog-reaction-application.ts";
import { createPublishedBlogPostCatalogue, type PublishedBlogPostCatalogue } from "./published-blog-post-catalogue.ts";

function normalizeRuntimeBlogReactionApplicationError(error: unknown): Error {
	if (isError(error)) {
		return error;
	}

	return new Error("The runtime blog reaction application setup failed.");
}

function loadRuntimePublishedBlogPostCatalogue(): Task<PublishedBlogPostCatalogue, Error> {
	return tryOrElse(normalizeRuntimeBlogReactionApplicationError, async () => {
		return createPublishedBlogPostCatalogue(await getCollection("blog"));
	});
}

function readRuntimeBlogReactionRepository(): Task<BlogReactionRepository, Error> {
	return readRuntimeApplicationDatabaseTask().map((applicationDatabaseConnection) => {
		return createBlogReactionRepository(applicationDatabaseConnection.database);
	});
}

const readRuntimeEnvironment = createRuntimeBlogReactionEnvironmentReader({
	readEnvironmentVariable(environmentVariableName) {
		return process.env[environmentVariableName];
	},
	readSecretFile(secretFilePath) {
		return tryOrElse(normalizeRuntimeBlogReactionApplicationError, async () => {
			return readFile(secretFilePath, "utf8");
		});
	}
});

function createRuntimeBlogReactionRateLimiter(): BlogReactionRateLimiter {
	return createBlogReactionRateLimiter({
		rateLimiterState: new Map(),
		wallClock: createWallClock()
	});
}

export const readRuntimeBlogReactionApplicationServiceTask = createRuntimeBlogReactionApplicationServiceTaskReader({
	blogReactionRateLimiter: createRuntimeBlogReactionRateLimiter(),
	createAnonymousReactorIdentifier() {
		return createAnonymousReactorIdentifier(productionAnonymousReactorIdentityOptions);
	},
	loadPublishedBlogPostCatalogue: loadRuntimePublishedBlogPostCatalogue,
	readBlogReactionRepository: readRuntimeBlogReactionRepository,
	readRuntimeEnvironment
});
