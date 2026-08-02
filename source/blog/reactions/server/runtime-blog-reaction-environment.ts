import { isDirectInstanceOf, isUndefined } from "@sindresorhus/is";
import { type } from "arktype";
import { tryOrElse, type Task } from "true-myth/task";
import {
	blogReactionHmacSecretFilePathSchema,
	type BlogReactionHmacSecretFilePath
} from "./blog-reaction-runtime-configuration-schema.ts";

export type RuntimeEnvironmentVariableReader = (environmentVariableName: string) => string | undefined;

export type RuntimeSecretFileReader = (secretFilePath: BlogReactionHmacSecretFilePath) => Task<string, Error>;

export type RuntimeBlogReactionEnvironmentReaderOptions = {
	readonly readEnvironmentVariable: RuntimeEnvironmentVariableReader;
	readonly readSecretFile: RuntimeSecretFileReader;
};

function normalizeRuntimeBlogReactionEnvironmentError(): Error {
	return new Error("The runtime blog reaction environment could not be read.");
}

function parseBlogReactionHmacSecretFilePath(secretFilePathInput: unknown): BlogReactionHmacSecretFilePath {
	const secretFilePath = blogReactionHmacSecretFilePathSchema(secretFilePathInput);

	if (isDirectInstanceOf(secretFilePath, type.errors)) {
		throw new TypeError("The blog reaction HMAC secret file path is invalid.");
	}

	return secretFilePath;
}

export function createRuntimeBlogReactionEnvironmentReader(
	runtimeBlogReactionEnvironmentReaderOptions: RuntimeBlogReactionEnvironmentReaderOptions
): () => Task<unknown, Error> {
	const { readEnvironmentVariable, readSecretFile } = runtimeBlogReactionEnvironmentReaderOptions;

	return () => {
		return tryOrElse(normalizeRuntimeBlogReactionEnvironmentError, async () => {
			const secretFilePathInput = readEnvironmentVariable("BLOG_REACTION_HMAC_SECRET_FILE");

			if (isUndefined(secretFilePathInput)) {
				return {
					BLOG_REACTION_HMAC_SECRET: readEnvironmentVariable("BLOG_REACTION_HMAC_SECRET")
				};
			}

			const secretFilePath = parseBlogReactionHmacSecretFilePath(secretFilePathInput);
			const secretFileResult = await readSecretFile(secretFilePath);

			if (secretFileResult.isErr) {
				throw secretFileResult.error;
			}

			return {
				BLOG_REACTION_HMAC_SECRET: secretFileResult.value.trim()
			};
		});
	};
}
