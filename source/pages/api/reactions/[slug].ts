import { isNonEmptyString, isUndefined } from "@sindresorhus/is";
import type { APIContext } from "astro";
import { just, nothing, type Maybe } from "true-myth/maybe";
import {
	blogReactionBusyRetryAfterSeconds,
	blogReactionCookieName,
	handleBlogReactionRequest,
	type BlogReactionHttpMethod,
	type BlogReactionHttpResponse
} from "../../../blog/blog-reaction-http.ts";
import { blogReactionErrorResponseSchema } from "../../../blog/blog-reaction-schema.ts";
import { isSqliteBusyError } from "../../../blog/sqlite-database-error.ts";
import { standardStreamRuntimeLogger } from "../../../blog/runtime-logger.ts";
import { readRuntimeBlogReactionApplicationServiceTask } from "../../../blog/runtime-blog-reaction-composition.ts";

export const prerender = false;

type HandleAstroBlogReactionRequestOptions = {
	readonly context: APIContext;
	readonly method: BlogReactionHttpMethod;
};

type CreateAstroBlogReactionResponseOptions = {
	readonly context: APIContext;
	readonly blogReactionHttpResponse: BlogReactionHttpResponse;
};

function readAnonymousReactorCookieValue(context: APIContext): Maybe<string> {
	const anonymousReactorCookie = context.cookies.get(blogReactionCookieName);

	if (isUndefined(anonymousReactorCookie)) {
		return nothing();
	}

	return just(anonymousReactorCookie.value);
}

function readClientAddress(context: APIContext): Maybe<string> {
	if (!isNonEmptyString(context.clientAddress)) {
		return nothing();
	}

	return just(context.clientAddress);
}

function createAstroBlogReactionResponse(
	createAstroBlogReactionResponseOptions: CreateAstroBlogReactionResponseOptions
): Response {
	const { blogReactionHttpResponse, context } = createAstroBlogReactionResponseOptions;

	if (blogReactionHttpResponse.setCookie.isJust) {
		const blogReactionCookie = blogReactionHttpResponse.setCookie.value;

		context.cookies.set(blogReactionCookie.name, blogReactionCookie.value, blogReactionCookie.options);
	}

	const responseHeaders = new Headers(blogReactionHttpResponse.headers);
	responseHeaders.set("Content-Type", "application/json; charset=utf-8");

	return Response.json(blogReactionHttpResponse.body, {
		headers: responseHeaders,
		status: blogReactionHttpResponse.statusCode
	});
}

function createRuntimeUnavailableResponse(error: unknown): Response {
	const statusCode = isSqliteBusyError(error) ? 503 : 500;
	const responseHeaders = new Headers({
		"Cache-Control": "no-store",
		"Content-Type": "application/json; charset=utf-8"
	});

	if (statusCode === 503) {
		responseHeaders.set("Retry-After", String(blogReactionBusyRetryAfterSeconds));
	}

	standardStreamRuntimeLogger.warn("Unable to initialize blog reaction service", error, {
		event: "blog_reaction_runtime_initialization_failed",
		statusCode
	});

	return Response.json(blogReactionErrorResponseSchema.assert({ error: "temporarily_unavailable" }), {
		headers: responseHeaders,
		status: statusCode
	});
}

async function handleAstroBlogReactionRequest(
	handleAstroBlogReactionRequestOptions: HandleAstroBlogReactionRequestOptions
): Promise<Response> {
	const { context, method } = handleAstroBlogReactionRequestOptions;
	const applicationServiceResult = await readRuntimeBlogReactionApplicationServiceTask();

	if (applicationServiceResult.isErr) {
		return createRuntimeUnavailableResponse(applicationServiceResult.error);
	}

	const blogReactionHttpResponse = await handleBlogReactionRequest({
		blogReactionApplicationService: applicationServiceResult.value,
		logUnexpectedFailure(error, statusCode) {
			standardStreamRuntimeLogger.warn("Unable to handle blog reaction request", error, {
				event: "blog_reaction_request_failed",
				method,
				statusCode
			});
		},
		request: {
			anonymousReactorCookieValue: readAnonymousReactorCookieValue(context),
			clientAddress: readClientAddress(context),
			method,
			routeParameters: context.params
		},
		secureCookies: import.meta.env.PROD
	});

	return createAstroBlogReactionResponse({
		blogReactionHttpResponse,
		context
	});
}

export async function GET(context: APIContext): Promise<Response> {
	return handleAstroBlogReactionRequest({ context, method: "GET" });
}

export async function PUT(context: APIContext): Promise<Response> {
	return handleAstroBlogReactionRequest({ context, method: "PUT" });
}

export async function DELETE(context: APIContext): Promise<Response> {
	return handleAstroBlogReactionRequest({ context, method: "DELETE" });
}
