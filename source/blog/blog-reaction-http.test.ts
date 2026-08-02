import assert from "node:assert";
import Database from "better-sqlite3";
import { suite, test } from "mocha";
import { just, nothing, type Maybe } from "true-myth/maybe";
import { err, ok } from "true-myth/result";
import { reject as rejectTask, resolve as resolveTask } from "true-myth/task";
import type {
	BlogReactionApplicationService,
	BlogReactionApplicationTaskResult,
	BlogReactionMutationOutcome
} from "./blog-reaction-application.ts";
import { blogReactionErrorResponseSchema, blogReactionResponseSchema } from "./blog-reaction-schema.ts";
import {
	blogReactionBusyRetryAfterSeconds,
	blogReactionCookieMaxAgeSeconds,
	blogReactionCookieName,
	handleBlogReactionRequest,
	type BlogReactionHttpMethod,
	type BlogReactionHttpRequest
} from "./blog-reaction-http.ts";
import { normalizeSqliteDatabaseError } from "./sqlite-database-error.ts";
import type { BlogReactionSnapshot } from "./blog-reaction.ts";

const validPostSlug = "quiet-post";
const validAnonymousReactorIdentifier = "A".repeat(43);

type TestApplicationServiceOptions = {
	readonly addReactionTask?: BlogReactionApplicationTaskResult<BlogReactionMutationOutcome>;
	readonly readReactionTask?: BlogReactionApplicationTaskResult<BlogReactionSnapshot>;
	readonly removeReactionTask?: BlogReactionApplicationTaskResult<BlogReactionMutationOutcome>;
};

type TestApplicationService = BlogReactionApplicationService & {
	readonly calls: readonly BlogReactionHttpMethod[];
};

type CreateTestRequestOptions = {
	readonly anonymousReactorCookieValue?: Maybe<string>;
	readonly clientAddress?: Maybe<string>;
	readonly method: BlogReactionHttpMethod;
	readonly routeParameters?: unknown;
};

type UnexpectedFailureCall = {
	readonly error: Error;
	readonly statusCode: number;
};

type TestUnexpectedFailureRecorder = {
	readonly calls: readonly UnexpectedFailureCall[];
	readonly logUnexpectedFailure: (error: Error, statusCode: number) => void;
};

function createTestApplicationService(
	testApplicationServiceOptions: TestApplicationServiceOptions = {}
): TestApplicationService {
	const {
		addReactionTask = resolveTask(
			ok({
				createdAnonymousReactorIdentifier: just(validAnonymousReactorIdentifier),
				snapshot: {
					count: 1,
					reacted: true
				}
			})
		),
		readReactionTask = resolveTask(ok({ count: 3, reacted: false })),
		removeReactionTask = resolveTask(
			ok({
				createdAnonymousReactorIdentifier: nothing(),
				snapshot: {
					count: 0,
					reacted: false
				}
			})
		)
	} = testApplicationServiceOptions;
	const calls: BlogReactionHttpMethod[] = [];

	return {
		calls,
		addReaction() {
			calls.push("PUT");

			return addReactionTask;
		},
		readReaction() {
			calls.push("GET");

			return readReactionTask;
		},
		removeReaction() {
			calls.push("DELETE");

			return removeReactionTask;
		}
	};
}

function createTestRequest(createTestRequestOptions: CreateTestRequestOptions): BlogReactionHttpRequest {
	const {
		anonymousReactorCookieValue = nothing(),
		clientAddress = just("192.0.2.1"),
		method,
		routeParameters = { slug: validPostSlug }
	} = createTestRequestOptions;

	return {
		anonymousReactorCookieValue,
		clientAddress,
		method,
		routeParameters
	};
}

function createUnexpectedFailureRecorder(): TestUnexpectedFailureRecorder {
	const calls: UnexpectedFailureCall[] = [];

	return {
		calls,
		logUnexpectedFailure(error, statusCode) {
			calls.push({ error, statusCode });
		}
	};
}

type BlogReactionTestHttpResponse = Awaited<ReturnType<typeof handleBlogReactionRequest>>;

function assertNoStoreResponse(response: BlogReactionTestHttpResponse): void {
	assert.strictEqual(response.headers["Cache-Control"], "no-store");
}

function assertSuccessfulResponseBody(
	response: BlogReactionTestHttpResponse,
	expectedSnapshot: BlogReactionSnapshot
): void {
	assert.partialDeepStrictEqual(response, {
		body: expectedSnapshot,
		statusCode: 200
	});
	assert.deepStrictEqual(blogReactionResponseSchema.assert(response.body), expectedSnapshot);
}

suite("handleBlogReactionRequest()", function () {
	test("rejects malformed route parameters without reaching the application service", async function () {
		const testApplicationService = createTestApplicationService();
		const unexpectedFailureRecorder = createUnexpectedFailureRecorder();
		const response = await handleBlogReactionRequest({
			blogReactionApplicationService: testApplicationService,
			logUnexpectedFailure: unexpectedFailureRecorder.logUnexpectedFailure,
			request: createTestRequest({
				method: "GET",
				routeParameters: { slug: "malformed_slug" }
			}),
			secureCookies: false
		});

		assert.partialDeepStrictEqual(response, {
			body: { error: "not_found" },
			statusCode: 404
		});
		assert.deepStrictEqual(blogReactionErrorResponseSchema.assert(response.body), { error: "not_found" });
		assert.strictEqual(testApplicationService.calls.length, 0);
		assert.strictEqual(unexpectedFailureRecorder.calls.length, 0);
		assertNoStoreResponse(response);
	});

	test("maps an unknown published post to 404", async function () {
		const testApplicationService = createTestApplicationService({
			readReactionTask: resolveTask(err({ kind: "not_found" }))
		});
		const unexpectedFailureRecorder = createUnexpectedFailureRecorder();
		const response = await handleBlogReactionRequest({
			blogReactionApplicationService: testApplicationService,
			logUnexpectedFailure: unexpectedFailureRecorder.logUnexpectedFailure,
			request: createTestRequest({ method: "GET" }),
			secureCookies: false
		});

		assert.partialDeepStrictEqual(response, {
			body: { error: "not_found" },
			statusCode: 404
		});
		assert.strictEqual(unexpectedFailureRecorder.calls.length, 0);
		assertNoStoreResponse(response);
	});

	test("returns a validated GET response without creating a cookie", async function () {
		const testApplicationService = createTestApplicationService({
			readReactionTask: resolveTask(ok({ count: 0, reacted: false }))
		});
		const unexpectedFailureRecorder = createUnexpectedFailureRecorder();
		const response = await handleBlogReactionRequest({
			blogReactionApplicationService: testApplicationService,
			logUnexpectedFailure: unexpectedFailureRecorder.logUnexpectedFailure,
			request: createTestRequest({ method: "GET" }),
			secureCookies: true
		});

		assertSuccessfulResponseBody(response, { count: 0, reacted: false });
		assert.strictEqual(response.setCookie.isNothing, true);
		assert.deepStrictEqual(testApplicationService.calls, ["GET"]);
		assert.strictEqual(unexpectedFailureRecorder.calls.length, 0);
		assertNoStoreResponse(response);
	});

	test("returns a first PUT response and its secure production cookie", async function () {
		const testApplicationService = createTestApplicationService();
		const unexpectedFailureRecorder = createUnexpectedFailureRecorder();
		const response = await handleBlogReactionRequest({
			blogReactionApplicationService: testApplicationService,
			logUnexpectedFailure: unexpectedFailureRecorder.logUnexpectedFailure,
			request: createTestRequest({ method: "PUT" }),
			secureCookies: true
		});

		assertSuccessfulResponseBody(response, { count: 1, reacted: true });
		if (response.setCookie.isNothing) {
			throw new Error("Expected the first PUT to set a cookie.");
		}

		assert.deepStrictEqual(response.setCookie.value, {
			name: blogReactionCookieName,
			options: {
				httpOnly: true,
				maxAge: blogReactionCookieMaxAgeSeconds,
				path: "/",
				sameSite: "lax",
				secure: true
			},
			value: validAnonymousReactorIdentifier
		});
		assert.strictEqual(unexpectedFailureRecorder.calls.length, 0);
		assertNoStoreResponse(response);
	});

	test("keeps development cookie behavior testable without Secure", async function () {
		const unexpectedFailureRecorder = createUnexpectedFailureRecorder();
		const response = await handleBlogReactionRequest({
			blogReactionApplicationService: createTestApplicationService(),
			logUnexpectedFailure: unexpectedFailureRecorder.logUnexpectedFailure,
			request: createTestRequest({ method: "PUT" }),
			secureCookies: false
		});

		if (response.setCookie.isNothing) {
			throw new Error("Expected the first PUT to set a cookie.");
		}

		assert.strictEqual(response.setCookie.value.options.secure, false);
		assert.strictEqual(unexpectedFailureRecorder.calls.length, 0);
	});

	test("does not rotate the cookie for a repeated PUT", async function () {
		const unexpectedFailureRecorder = createUnexpectedFailureRecorder();
		const response = await handleBlogReactionRequest({
			blogReactionApplicationService: createTestApplicationService({
				addReactionTask: resolveTask(
					ok({
						createdAnonymousReactorIdentifier: nothing(),
						snapshot: {
							count: 1,
							reacted: true
						}
					})
				)
			}),
			logUnexpectedFailure: unexpectedFailureRecorder.logUnexpectedFailure,
			request: createTestRequest({
				anonymousReactorCookieValue: just(validAnonymousReactorIdentifier),
				method: "PUT"
			}),
			secureCookies: true
		});

		assertSuccessfulResponseBody(response, { count: 1, reacted: true });
		assert.strictEqual(response.setCookie.isNothing, true);
		assert.strictEqual(unexpectedFailureRecorder.calls.length, 0);
	});

	test("returns a DELETE response without replacing the identity cookie", async function () {
		const testApplicationService = createTestApplicationService();
		const unexpectedFailureRecorder = createUnexpectedFailureRecorder();
		const response = await handleBlogReactionRequest({
			blogReactionApplicationService: testApplicationService,
			logUnexpectedFailure: unexpectedFailureRecorder.logUnexpectedFailure,
			request: createTestRequest({
				anonymousReactorCookieValue: just(validAnonymousReactorIdentifier),
				method: "DELETE"
			}),
			secureCookies: true
		});

		assertSuccessfulResponseBody(response, { count: 0, reacted: false });
		assert.strictEqual(response.setCookie.isNothing, true);
		assert.deepStrictEqual(testApplicationService.calls, ["DELETE"]);
		assert.strictEqual(unexpectedFailureRecorder.calls.length, 0);
	});

	test("maps rate limiting to 429 with Retry-After", async function () {
		const testApplicationService = createTestApplicationService({
			addReactionTask: resolveTask(
				err({
					kind: "rate_limited",
					retryAfterMilliseconds: 12_345
				})
			)
		});
		const unexpectedFailureRecorder = createUnexpectedFailureRecorder();
		const response = await handleBlogReactionRequest({
			blogReactionApplicationService: testApplicationService,
			logUnexpectedFailure: unexpectedFailureRecorder.logUnexpectedFailure,
			request: createTestRequest({ method: "PUT" }),
			secureCookies: true
		});

		assert.partialDeepStrictEqual(response, {
			body: { error: "rate_limited" },
			headers: { "Retry-After": "13" },
			setCookie: nothing(),
			statusCode: 429
		});
		assert.strictEqual(unexpectedFailureRecorder.calls.length, 0);
		assertNoStoreResponse(response);
	});

	test("maps SQLITE_BUSY to 503 with a conservative Retry-After and logs once", async function () {
		const sqliteBusyError = normalizeSqliteDatabaseError(new Database.SqliteError("database busy", "SQLITE_BUSY"));
		const testApplicationService = createTestApplicationService({
			addReactionTask: rejectTask(sqliteBusyError)
		});
		const unexpectedFailureRecorder = createUnexpectedFailureRecorder();
		const response = await handleBlogReactionRequest({
			blogReactionApplicationService: testApplicationService,
			logUnexpectedFailure: unexpectedFailureRecorder.logUnexpectedFailure,
			request: createTestRequest({ method: "PUT" }),
			secureCookies: true
		});

		assert.partialDeepStrictEqual(response, {
			body: { error: "temporarily_unavailable" },
			headers: { "Retry-After": String(blogReactionBusyRetryAfterSeconds) },
			setCookie: nothing(),
			statusCode: 503
		});
		assert.deepStrictEqual(unexpectedFailureRecorder.calls, [
			{
				error: sqliteBusyError,
				statusCode: 503
			}
		]);
		assertNoStoreResponse(response);
	});

	test("maps unexpected failures to generic 500 without exposing details", async function () {
		const unexpectedError = new Error("SQL statement and filesystem path must remain private");
		const testApplicationService = createTestApplicationService({
			readReactionTask: rejectTask(unexpectedError)
		});
		const unexpectedFailureRecorder = createUnexpectedFailureRecorder();
		const response = await handleBlogReactionRequest({
			blogReactionApplicationService: testApplicationService,
			logUnexpectedFailure: unexpectedFailureRecorder.logUnexpectedFailure,
			request: createTestRequest({ method: "GET" }),
			secureCookies: true
		});

		assert.partialDeepStrictEqual(response, {
			body: { error: "temporarily_unavailable" },
			statusCode: 500
		});
		assert.strictEqual(JSON.stringify(response.body).includes(unexpectedError.message), false);
		assert.deepStrictEqual(unexpectedFailureRecorder.calls, [
			{
				error: unexpectedError,
				statusCode: 500
			}
		]);
		assertNoStoreResponse(response);
	});
});
