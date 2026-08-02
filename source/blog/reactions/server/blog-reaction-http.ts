import { isDirectInstanceOf, isError } from "@sindresorhus/is";
import { type } from "arktype";
import { nothing, type Maybe } from "true-myth/maybe";
import { err, ok, type Result } from "true-myth/result";
import type { Task } from "true-myth/task";
import type { Unit } from "true-myth/unit";
import {
	blogReactionErrorResponseSchema,
	blogReactionResponseSchema,
	blogReactionRouteParametersSchema,
	type BlogReactionErrorResponse,
	type BlogReactionResponse,
	type BlogReactionRouteParameters
} from "../blog-reaction-schema.ts";
import { isSqliteBusyError } from "../../../database/sqlite-database-error.ts";
import type {
	BlogReactionApplicationService,
	BlogReactionFailure,
	BlogReactionMutationOutcome,
	MutateBlogReactionOptions,
	ReadBlogReactionOptions
} from "./blog-reaction-application.ts";
import type { AnonymousReactorIdentifier } from "./blog-reaction-identity-schema.ts";
import type { BlogReactionSnapshot } from "./blog-reaction.ts";

export const blogReactionCookieName = "echooff_blog_reactor";
export const blogReactionCookieMaxAgeSeconds = 31_536_000;
export const blogReactionBusyRetryAfterSeconds = 5;

type BlogReactionErrorCode = BlogReactionErrorResponse["error"];

export type BlogReactionHttpMethod = "DELETE" | "GET" | "PUT";

export type BlogReactionHttpRequest = {
	readonly anonymousReactorCookieValue: Maybe<string>;
	readonly clientAddress: Maybe<string>;
	readonly method: BlogReactionHttpMethod;
	readonly routeParameters: unknown;
};

export type BlogReactionCookieOptions = {
	readonly httpOnly: true;
	readonly maxAge: number;
	readonly path: "/";
	readonly sameSite: "lax";
	readonly secure: boolean;
};

export type BlogReactionCookie = {
	readonly name: typeof blogReactionCookieName;
	readonly options: BlogReactionCookieOptions;
	readonly value: AnonymousReactorIdentifier;
};

export type BlogReactionHttpResponseHeaders = Readonly<Record<string, string>>;

export type LogUnexpectedBlogReactionFailure = (error: Error, statusCode: number) => void;

export type BlogReactionHttpResponse = {
	readonly body: BlogReactionErrorResponse | BlogReactionResponse;
	readonly headers: BlogReactionHttpResponseHeaders;
	readonly setCookie: Maybe<BlogReactionCookie>;
	readonly statusCode: number;
};

export type BlogReactionHttpHandlerOptions = {
	readonly blogReactionApplicationService: BlogReactionApplicationService;
	readonly logUnexpectedFailure: LogUnexpectedBlogReactionFailure;
	readonly request: BlogReactionHttpRequest;
	readonly secureCookies: boolean;
};

type BlogReactionApplicationSuccess = BlogReactionMutationOutcome | BlogReactionSnapshot;

type CreateBlogReactionErrorResponseOptions = {
	readonly errorCode: BlogReactionErrorCode;
	readonly headers?: BlogReactionHttpResponseHeaders;
	readonly statusCode: number;
};

type CreateBlogReactionUnavailableResponseOptions = {
	readonly retryAfterSeconds?: number;
	readonly statusCode: number;
};

type CreateBlogReactionSuccessResponseOptions = {
	readonly blogReactionSnapshot: BlogReactionSnapshot;
	readonly createdAnonymousReactorIdentifier: Maybe<AnonymousReactorIdentifier>;
	readonly secureCookies: boolean;
};

const noStoreResponseHeaders: BlogReactionHttpResponseHeaders = {
	"Cache-Control": "no-store"
};

function createBlogReactionErrorResponse(
	createBlogReactionErrorResponseOptions: CreateBlogReactionErrorResponseOptions
): BlogReactionHttpResponse {
	const { errorCode, headers = noStoreResponseHeaders, statusCode } = createBlogReactionErrorResponseOptions;

	return {
		body: blogReactionErrorResponseSchema.assert({ error: errorCode }),
		headers,
		setCookie: nothing(),
		statusCode
	};
}

function createNotFoundResponse(): BlogReactionHttpResponse {
	return createBlogReactionErrorResponse({
		errorCode: "not_found",
		statusCode: 404
	});
}

function createBlogReactionUnavailableResponse(
	createBlogReactionUnavailableResponseOptions: CreateBlogReactionUnavailableResponseOptions
): BlogReactionHttpResponse {
	const { retryAfterSeconds, statusCode } = createBlogReactionUnavailableResponseOptions;
	const headers: BlogReactionHttpResponseHeaders = {
		...noStoreResponseHeaders,
		...(retryAfterSeconds === undefined ? {} : { "Retry-After": String(retryAfterSeconds) })
	};

	return createBlogReactionErrorResponse({
		errorCode: "temporarily_unavailable",
		headers,
		statusCode
	});
}

function normalizeUnexpectedBlogReactionHttpError(error: unknown): Error {
	if (isError(error)) {
		return error;
	}

	return new Error("The blog reaction HTTP operation failed.");
}

function createUnexpectedBlogReactionHttpResponse(error: unknown): BlogReactionHttpResponse {
	if (isSqliteBusyError(error)) {
		return createBlogReactionUnavailableResponse({
			retryAfterSeconds: blogReactionBusyRetryAfterSeconds,
			statusCode: 503
		});
	}

	return createBlogReactionUnavailableResponse({ statusCode: 500 });
}

function createRateLimitedResponse(retryAfterMilliseconds: number): BlogReactionHttpResponse {
	return createBlogReactionErrorResponse({
		errorCode: "rate_limited",
		headers: {
			...noStoreResponseHeaders,
			"Retry-After": String(Math.ceil(retryAfterMilliseconds / 1000))
		},
		statusCode: 429
	});
}

function createBlogReactionCookie(
	anonymousReactorIdentifier: AnonymousReactorIdentifier,
	secureCookies: boolean
): BlogReactionCookie {
	return {
		name: blogReactionCookieName,
		options: {
			httpOnly: true,
			maxAge: blogReactionCookieMaxAgeSeconds,
			path: "/",
			sameSite: "lax",
			secure: secureCookies
		},
		value: anonymousReactorIdentifier
	};
}

function createBlogReactionSuccessResponse(
	createBlogReactionSuccessResponseOptions: CreateBlogReactionSuccessResponseOptions
): BlogReactionHttpResponse {
	const { blogReactionSnapshot, createdAnonymousReactorIdentifier, secureCookies } =
		createBlogReactionSuccessResponseOptions;

	return {
		body: blogReactionResponseSchema.assert(blogReactionSnapshot),
		headers: noStoreResponseHeaders,
		setCookie: createdAnonymousReactorIdentifier.map((anonymousReactorIdentifier) => {
			return createBlogReactionCookie(anonymousReactorIdentifier, secureCookies);
		}),
		statusCode: 200
	};
}

function parseBlogReactionRouteParameters(routeParameters: unknown): Result<BlogReactionRouteParameters, Unit> {
	const parsedRouteParameters = blogReactionRouteParametersSchema(routeParameters);

	if (isDirectInstanceOf(parsedRouteParameters, type.errors)) {
		return err();
	}

	return ok(parsedRouteParameters);
}

function createApplicationTask(
	blogReactionHttpHandlerOptions: BlogReactionHttpHandlerOptions,
	postSlug: string
): Task<BlogReactionApplicationSuccess, BlogReactionFailure> {
	const { blogReactionApplicationService, request } = blogReactionHttpHandlerOptions;

	if (request.method === "GET") {
		const readBlogReactionOptions: ReadBlogReactionOptions = {
			anonymousReactorCookieValue: request.anonymousReactorCookieValue,
			postSlug
		};

		return blogReactionApplicationService.readReaction(readBlogReactionOptions).map((snapshot) => {
			return snapshot;
		});
	}

	const mutateBlogReactionOptions: MutateBlogReactionOptions = {
		anonymousReactorCookieValue: request.anonymousReactorCookieValue,
		clientAddress: request.clientAddress,
		postSlug
	};

	if (request.method === "PUT") {
		return blogReactionApplicationService.addReaction(mutateBlogReactionOptions);
	}

	return blogReactionApplicationService.removeReaction(mutateBlogReactionOptions);
}

function isBlogReactionMutationOutcome(
	blogReactionApplicationSuccess: BlogReactionApplicationSuccess
): blogReactionApplicationSuccess is BlogReactionMutationOutcome {
	return Object.hasOwn(blogReactionApplicationSuccess, "snapshot");
}

function createResponseForApplicationFailure(
	blogReactionFailure: BlogReactionFailure,
	logUnexpectedFailure: LogUnexpectedBlogReactionFailure
): BlogReactionHttpResponse {
	if (blogReactionFailure.kind === "not_found") {
		return createNotFoundResponse();
	}

	if (blogReactionFailure.kind === "rate_limited") {
		return createRateLimitedResponse(blogReactionFailure.retryAfterMilliseconds);
	}

	const statusCode = isSqliteBusyError(blogReactionFailure.cause) ? 503 : 500;
	logUnexpectedFailure(blogReactionFailure.cause, statusCode);

	return createUnexpectedBlogReactionHttpResponse(blogReactionFailure.cause);
}

function createResponseForApplicationResult(
	applicationResult: Result<BlogReactionApplicationSuccess, BlogReactionFailure>,
	secureCookies: boolean,
	logUnexpectedFailure: LogUnexpectedBlogReactionFailure
): BlogReactionHttpResponse {
	if (applicationResult.isErr) {
		return createResponseForApplicationFailure(applicationResult.error, logUnexpectedFailure);
	}

	const successValue = applicationResult.value;
	const mutationOutcome = isBlogReactionMutationOutcome(successValue);

	return createBlogReactionSuccessResponse({
		blogReactionSnapshot: mutationOutcome ? successValue.snapshot : successValue,
		createdAnonymousReactorIdentifier: mutationOutcome ? successValue.createdAnonymousReactorIdentifier : nothing(),
		secureCookies
	});
}

async function handleBlogReactionRequestWithoutUnexpectedFailure(
	blogReactionHttpHandlerOptions: BlogReactionHttpHandlerOptions
): Promise<BlogReactionHttpResponse> {
	const { request } = blogReactionHttpHandlerOptions;
	const routeParametersResult = parseBlogReactionRouteParameters(request.routeParameters);

	if (routeParametersResult.isErr) {
		return createNotFoundResponse();
	}

	const applicationTask = createApplicationTask(blogReactionHttpHandlerOptions, routeParametersResult.value.slug);
	const applicationResult = await applicationTask;

	return createResponseForApplicationResult(
		applicationResult,
		blogReactionHttpHandlerOptions.secureCookies,
		blogReactionHttpHandlerOptions.logUnexpectedFailure
	);
}

export async function handleBlogReactionRequest(
	blogReactionHttpHandlerOptions: BlogReactionHttpHandlerOptions
): Promise<BlogReactionHttpResponse> {
	try {
		return await handleBlogReactionRequestWithoutUnexpectedFailure(blogReactionHttpHandlerOptions);
	} catch (error) {
		const normalizedError = normalizeUnexpectedBlogReactionHttpError(error);
		const statusCode = isSqliteBusyError(error) ? 503 : 500;

		blogReactionHttpHandlerOptions.logUnexpectedFailure(normalizedError, statusCode);

		return createUnexpectedBlogReactionHttpResponse(error);
	}
}
