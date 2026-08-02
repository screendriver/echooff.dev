import { type } from "arktype";

export const blogReactionResponseSchema = type({
	"+": "reject",
	count: "number.integer >= 0",
	reacted: "boolean"
});

export type BlogReactionResponse = typeof blogReactionResponseSchema.infer;

export const blogReactionErrorResponseSchema = type({
	"+": "reject",
	error: "'not_found' | 'rate_limited' | 'temporarily_unavailable'"
});

export type BlogReactionErrorResponse = typeof blogReactionErrorResponseSchema.infer;

export const blogReactionRouteParametersSchema = type({
	"+": "reject",
	slug: "/^(?=.{1,200}$)[a-z0-9]+(?:-[a-z0-9]+)*$/"
});

export type BlogReactionRouteParameters = typeof blogReactionRouteParametersSchema.infer;
