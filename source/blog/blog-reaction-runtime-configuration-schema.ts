import { type } from "arktype";

export const blogReactionHmacSecretSchema = type("/^(?:[A-Fa-f0-9]{2}){32,}$/");

export const blogReactionRuntimeEnvironmentSchema = type({
	BLOG_REACTION_HMAC_SECRET: blogReactionHmacSecretSchema
});

export type BlogReactionRuntimeEnvironment = typeof blogReactionRuntimeEnvironmentSchema.infer;
export type BlogReactionHmacSecret = typeof blogReactionHmacSecretSchema.infer;
