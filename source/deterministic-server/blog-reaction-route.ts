import { getCookie, setCookie } from "hono/cookie";
import type { Context, Hono } from "hono";
import { isDirectInstanceOf } from "@sindresorhus/is";
import { type } from "arktype";
import { match } from "ts-pattern";
import { blogReactionCookieName } from "../blog/blog-reaction-http.ts";
import { blogReactionResponseSchema, blogReactionRouteParametersSchema } from "../blog/blog-reaction-schema.ts";

const deterministicBlogReactionCookieValue = "A".repeat(43);
const noStoreHeaderName = "Cache-Control";
const noStoreHeaderValue = "no-store";

type DeterministicBlogReactionState = Set<string>;
type DeterministicBlogReactionSnapshot = {
	readonly count: number;
	readonly reacted: boolean;
};
type CreateNoStoreJsonResponseOptions = {
	readonly context: Context;
	readonly responseBody: unknown;
	readonly statusCode: 200 | 404;
};
type DeterministicBlogReactionOperationOptions = {
	readonly context: Context;
	readonly postSlug: string;
	readonly reactionState: DeterministicBlogReactionState;
};

function createNoStoreJsonResponse(createNoStoreJsonResponseOptions: CreateNoStoreJsonResponseOptions): Response {
	const { context, responseBody, statusCode } = createNoStoreJsonResponseOptions;
	const response = context.json(responseBody, statusCode);
	response.headers.set(noStoreHeaderName, noStoreHeaderValue);

	return response;
}

function createNotFoundResponse(context: Context): Response {
	return createNoStoreJsonResponse({
		context,
		responseBody: { error: "not_found" },
		statusCode: 404
	});
}

function readValidatedPostSlug(context: Context): string | undefined {
	const parsedRouteParameters = blogReactionRouteParametersSchema({
		slug: context.req.param("slug")
	});

	if (isDirectInstanceOf(parsedRouteParameters, type.errors)) {
		return undefined;
	}

	return parsedRouteParameters.slug;
}

function hasDeterministicReactionCookie(context: Context): boolean {
	return getCookie(context, blogReactionCookieName) === deterministicBlogReactionCookieValue;
}

function createReactionResponse(context: Context, reactionState: DeterministicBlogReactionSnapshot): Response {
	const responseBody = blogReactionResponseSchema.assert(reactionState);

	return createNoStoreJsonResponse({
		context,
		responseBody,
		statusCode: 200
	});
}

function createReadReactionResponse(
	deterministicBlogReactionOperationOptions: DeterministicBlogReactionOperationOptions
): Response {
	const { context, postSlug, reactionState } = deterministicBlogReactionOperationOptions;
	const hasReaction = reactionState.has(postSlug);

	return createReactionResponse(context, {
		count: hasReaction ? 1 : 0,
		reacted: hasReaction && hasDeterministicReactionCookie(context)
	});
}

function createAddReactionResponse(
	deterministicBlogReactionOperationOptions: DeterministicBlogReactionOperationOptions
): Response {
	const { context, postSlug, reactionState } = deterministicBlogReactionOperationOptions;
	reactionState.add(postSlug);

	if (!hasDeterministicReactionCookie(context)) {
		setCookie(context, blogReactionCookieName, deterministicBlogReactionCookieValue, {
			httpOnly: true,
			path: "/",
			sameSite: "Lax"
		});
	}

	return createReactionResponse(context, {
		count: 1,
		reacted: true
	});
}

function createRemoveReactionResponse(
	deterministicBlogReactionOperationOptions: DeterministicBlogReactionOperationOptions
): Response {
	const { context, postSlug, reactionState } = deterministicBlogReactionOperationOptions;

	if (hasDeterministicReactionCookie(context)) {
		reactionState.delete(postSlug);
	}

	return createReactionResponse(context, {
		count: reactionState.has(postSlug) ? 1 : 0,
		reacted: false
	});
}

function handleBlogReactionRequest(context: Context, reactionState: DeterministicBlogReactionState): Response {
	const postSlug = readValidatedPostSlug(context);

	if (postSlug === undefined) {
		return createNotFoundResponse(context);
	}

	return match(context.req.method)
		.with("GET", () => {
			return createReadReactionResponse({ context, postSlug, reactionState });
		})
		.with("PUT", () => {
			return createAddReactionResponse({ context, postSlug, reactionState });
		})
		.otherwise(() => {
			return createRemoveReactionResponse({ context, postSlug, reactionState });
		});
}

export function registerBlogReactionRoute(application: Hono): void {
	const reactionState: DeterministicBlogReactionState = new Set();
	const reactionMethods = ["DELETE", "GET", "PUT"];

	application.on(reactionMethods, "/api/reactions/:slug", (context) => {
		return handleBlogReactionRequest(context, reactionState);
	});
	application.on(reactionMethods, "/api/reactions", createNotFoundResponse);
	application.on(reactionMethods, "/api/reactions/*", createNotFoundResponse);
}
