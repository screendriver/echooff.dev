import assert from "node:assert";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Hono } from "hono";
import { suite, test } from "mocha";
import { blogReactionCookieName } from "../blog/reactions/server/blog-reaction-http.ts";
import { blogReactionErrorResponseSchema, blogReactionResponseSchema } from "../blog/reactions/blog-reaction-schema.ts";
import { registerBlogReactionRoute } from "./blog-reaction-route.ts";

type BlogReactionRequestOptions = {
	readonly cookieHeader?: string;
	readonly method: "DELETE" | "GET" | "PUT";
	readonly postSlug: string;
};

function createBlogReactionTestApplication(): Hono {
	const application = new Hono();

	registerBlogReactionRoute(application);

	return application;
}

function createBlogReactionRequest(blogReactionRequestOptions: BlogReactionRequestOptions): Request {
	const { cookieHeader, method, postSlug } = blogReactionRequestOptions;
	const requestInit: RequestInit = { method };

	if (cookieHeader !== undefined) {
		requestInit.headers = { cookie: cookieHeader };
	}

	return new Request(`http://localhost/api/reactions/${postSlug}`, requestInit);
}

async function requestBlogReaction(
	application: Hono,
	blogReactionRequestOptions: BlogReactionRequestOptions
): Promise<Response> {
	return application.fetch(createBlogReactionRequest(blogReactionRequestOptions));
}

async function readResponseBody(response: Response): Promise<unknown> {
	return response.json();
}

function readCookiePair(response: Response): string {
	const setCookieHeader = response.headers.get("set-cookie");

	if (setCookieHeader === null) {
		throw new Error("The reaction response did not set a cookie.");
	}

	const cookiePair = setCookieHeader.split(";", 1)[0];

	if (cookiePair === undefined) {
		throw new Error("The reaction response contained an empty cookie header.");
	}

	assert.match(cookiePair, new RegExp(`^${blogReactionCookieName}=`, "u"));

	return cookiePair;
}

suite("registerBlogReactionRoute()", function () {
	test("returns an unreacted no-store snapshot without creating a cookie", async function () {
		const application = createBlogReactionTestApplication();
		const response = await requestBlogReaction(application, {
			method: "GET",
			postSlug: "example-post"
		});
		const actualResponseBody = blogReactionResponseSchema.assert(await readResponseBody(response));

		assert.strictEqual(response.status, 200);
		assert.strictEqual(response.headers.get("cache-control"), "no-store");
		assert.match(response.headers.get("content-type") ?? "", /application\/json/u);
		assert.strictEqual(response.headers.get("set-cookie"), null);
		assert.deepStrictEqual(actualResponseBody, {
			count: 0,
			reacted: false
		});
	});

	test("sets a local cookie after the first idempotent addition", async function () {
		const application = createBlogReactionTestApplication();
		const firstPutResponse = await requestBlogReaction(application, {
			method: "PUT",
			postSlug: "example-post"
		});
		const cookiePair = readCookiePair(firstPutResponse);
		const repeatedPutResponse = await requestBlogReaction(application, {
			cookieHeader: cookiePair,
			method: "PUT",
			postSlug: "example-post"
		});
		const actualFirstResponseBody = blogReactionResponseSchema.assert(await readResponseBody(firstPutResponse));
		const actualRepeatedResponseBody = blogReactionResponseSchema.assert(
			await readResponseBody(repeatedPutResponse)
		);
		const setCookieHeader = firstPutResponse.headers.get("set-cookie") ?? "";

		assert.deepStrictEqual(actualFirstResponseBody, {
			count: 1,
			reacted: true
		});
		assert.deepStrictEqual(actualRepeatedResponseBody, {
			count: 1,
			reacted: true
		});
		assert.match(setCookieHeader, /HttpOnly/u);
		assert.match(setCookieHeader, /SameSite=Lax/u);
		assert.match(setCookieHeader, /Path=\//u);
		assert.doesNotMatch(setCookieHeader, /Secure/u);
		assert.strictEqual(repeatedPutResponse.headers.get("set-cookie"), null);
	});

	test("retains the cookie and removes the reaction idempotently", async function () {
		const application = createBlogReactionTestApplication();
		const putResponse = await requestBlogReaction(application, {
			method: "PUT",
			postSlug: "example-post"
		});
		const cookiePair = readCookiePair(putResponse);
		const getResponse = await requestBlogReaction(application, {
			cookieHeader: cookiePair,
			method: "GET",
			postSlug: "example-post"
		});
		const deleteResponse = await requestBlogReaction(application, {
			cookieHeader: cookiePair,
			method: "DELETE",
			postSlug: "example-post"
		});
		const repeatedDeleteResponse = await requestBlogReaction(application, {
			cookieHeader: cookiePair,
			method: "DELETE",
			postSlug: "example-post"
		});
		const actualGetResponseBody = blogReactionResponseSchema.assert(await readResponseBody(getResponse));
		const actualDeleteResponseBody = blogReactionResponseSchema.assert(await readResponseBody(deleteResponse));
		const actualRepeatedDeleteResponseBody = blogReactionResponseSchema.assert(
			await readResponseBody(repeatedDeleteResponse)
		);

		assert.deepStrictEqual(actualGetResponseBody, {
			count: 1,
			reacted: true
		});
		assert.deepStrictEqual(actualDeleteResponseBody, {
			count: 0,
			reacted: false
		});
		assert.deepStrictEqual(actualRepeatedDeleteResponseBody, {
			count: 0,
			reacted: false
		});
		assert.strictEqual(deleteResponse.headers.get("set-cookie"), null);
		assert.strictEqual(repeatedDeleteResponse.headers.get("set-cookie"), null);
	});

	test("keeps reaction state isolated by post and application instance", async function () {
		const firstApplication = createBlogReactionTestApplication();
		const secondApplication = createBlogReactionTestApplication();
		const firstPutResponse = await requestBlogReaction(firstApplication, {
			method: "PUT",
			postSlug: "first-post"
		});
		const cookiePair = readCookiePair(firstPutResponse);
		const differentPostResponse = await requestBlogReaction(firstApplication, {
			cookieHeader: cookiePair,
			method: "GET",
			postSlug: "second-post"
		});
		const differentApplicationResponse = await requestBlogReaction(secondApplication, {
			cookieHeader: cookiePair,
			method: "GET",
			postSlug: "first-post"
		});
		const actualDifferentPostBody = blogReactionResponseSchema.assert(
			await readResponseBody(differentPostResponse)
		);
		const actualDifferentApplicationBody = blogReactionResponseSchema.assert(
			await readResponseBody(differentApplicationResponse)
		);

		assert.deepStrictEqual(actualDifferentPostBody, {
			count: 0,
			reacted: false
		});
		assert.deepStrictEqual(actualDifferentApplicationBody, {
			count: 0,
			reacted: false
		});
	});

	test("rejects missing and malformed route parameters", async function () {
		const application = createBlogReactionTestApplication();
		const missingSlugResponse = await application.request("http://localhost/api/reactions");
		const malformedSlugResponse = await requestBlogReaction(application, {
			method: "GET",
			postSlug: "Not_A_Valid_Slug"
		});
		const actualMissingSlugBody = blogReactionErrorResponseSchema.assert(
			await readResponseBody(missingSlugResponse)
		);
		const actualMalformedSlugBody = blogReactionErrorResponseSchema.assert(
			await readResponseBody(malformedSlugResponse)
		);

		assert.strictEqual(missingSlugResponse.status, 404);
		assert.strictEqual(malformedSlugResponse.status, 404);
		assert.strictEqual(missingSlugResponse.headers.get("cache-control"), "no-store");
		assert.strictEqual(malformedSlugResponse.headers.get("cache-control"), "no-store");
		assert.deepStrictEqual(actualMissingSlugBody, { error: "not_found" });
		assert.deepStrictEqual(actualMalformedSlugBody, { error: "not_found" });
	});

	test("does not depend on production runtime or database infrastructure", async function () {
		const routeModulePath = fileURLToPath(new URL("./blog-reaction-route.ts", import.meta.url));
		const routeModuleSource = await readFile(routeModulePath, "utf8");

		assert.doesNotMatch(
			routeModuleSource,
			/better-sqlite3|kysely|BLOG_REACTION_HMAC_SECRET|runtime-blog-reaction/u
		);
	});
});
