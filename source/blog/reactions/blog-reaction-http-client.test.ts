import assert from "node:assert";
import { isError } from "@sindresorhus/is";
import { suite, test } from "mocha";
import ky from "ky";
import type { BlogReactionClient, BlogReactionClientFailure } from "./blog-reaction-client.ts";
import { blogReactionRequestTimeoutMilliseconds, createKyBlogReactionClient } from "./blog-reaction-http-client.ts";

type RecordedFetchRequest = {
	readonly request: Request;
	readonly init: RequestInit | undefined;
};

type CreateTestFetchOptions = {
	readonly response: Response | (() => Response);
	readonly throwError?: Error;
};

type TestFetch = {
	readonly fetch: typeof fetch;
	readonly requests: readonly RecordedFetchRequest[];
};

type TestClient = TestFetch & {
	readonly client: BlogReactionClient;
};

function createTestFetch(createTestFetchOptions: CreateTestFetchOptions): TestFetch {
	const { response, throwError } = createTestFetchOptions;
	const requests: RecordedFetchRequest[] = [];

	const testFetchImplementation: typeof fetch = async function (
		input: RequestInfo | URL,
		init?: RequestInit
	): Promise<Response> {
		const request = new Request(input, init);
		requests.push({ init, request });

		if (throwError !== undefined) {
			throw throwError;
		}

		return typeof response === "function" ? response() : response.clone();
	};

	return { fetch: testFetchImplementation, requests };
}

function createClientWithResponse(response: Response): TestClient {
	const testFetch = createTestFetch({ response });

	return {
		...testFetch,
		client: createKyBlogReactionClient({
			kyInstance: ky.create({ baseUrl: "http://localhost/", fetch: testFetch.fetch }),
			reactionEndpointPrefix: "/api/reactions/"
		})
	};
}

function isBlogReactionClientFailure(error: unknown): error is BlogReactionClientFailure {
	if (!isError(error)) {
		return false;
	}

	const kindPropertyDescriptor = Object.getOwnPropertyDescriptor(error, "kind");

	if (kindPropertyDescriptor === undefined) {
		return false;
	}

	return kindPropertyDescriptor.value === "blog_reaction_client_failure";
}

suite("createKyBlogReactionClient()", function () {
	test("uses GET with same-origin credentials and a finite timeout", async function () {
		const { client, requests } = createClientWithResponse(Response.json({ count: 0, reacted: false }));

		await client.loadReaction("a post");
		const firstRecordedRequest = requests[0];

		if (firstRecordedRequest === undefined) {
			throw new Error("Expected Ky to issue one request.");
		}

		assert.strictEqual(requests.length, 1);
		assert.deepStrictEqual(
			{
				credentials: firstRecordedRequest.request.credentials,
				method: firstRecordedRequest.request.method,
				requestHasAbortSignal: firstRecordedRequest.request.signal instanceof AbortSignal,
				url: firstRecordedRequest.request.url
			},
			{
				credentials: "same-origin",
				method: "GET",
				requestHasAbortSignal: true,
				url: "http://localhost/api/reactions/a%20post"
			}
		);
		assert.strictEqual(firstRecordedRequest.request.body, null);
		assert.strictEqual(blogReactionRequestTimeoutMilliseconds, 5000);
	});

	test("uses bodyless PUT and DELETE requests", async function () {
		const testFetch = createTestFetch({ response: Response.json({ count: 1, reacted: true }) });
		const client = createKyBlogReactionClient({
			kyInstance: ky.create({ baseUrl: "http://localhost/", fetch: testFetch.fetch }),
			reactionEndpointPrefix: "/api/reactions/"
		});

		await client.addReaction("first-post");
		await client.removeReaction("first-post");

		assert.deepStrictEqual(
			testFetch.requests.map((recordedRequest) => {
				return {
					method: recordedRequest.request.method,
					url: recordedRequest.request.url,
					body: recordedRequest.request.body
				};
			}),
			[
				{
					method: "PUT",
					url: "http://localhost/api/reactions/first-post",
					body: null
				},
				{
					method: "DELETE",
					url: "http://localhost/api/reactions/first-post",
					body: null
				}
			]
		);
	});

	test("returns valid response data validated through the shared schema", async function () {
		const { client } = createClientWithResponse(Response.json({ count: 4, reacted: true }));

		const actualReactionResponse = await client.loadReaction("first-post");

		assert.deepStrictEqual(actualReactionResponse, { count: 4, reacted: true });
	});

	test("does not retry failed PUT requests", async function () {
		const testFetch = createTestFetch({
			response: Response.json({ error: "temporarily_unavailable" }, { status: 503 })
		});
		const client = createKyBlogReactionClient({
			kyInstance: ky.create({ baseUrl: "http://localhost/", fetch: testFetch.fetch })
		});

		await assert.rejects(async function () {
			await client.addReaction("first-post");
		}, isBlogReactionClientFailure);

		assert.strictEqual(testFetch.requests.length, 1);
	});

	test("does not retry failed DELETE requests", async function () {
		const testFetch = createTestFetch({
			response: Response.json({ error: "temporarily_unavailable" }, { status: 503 })
		});
		const client = createKyBlogReactionClient({
			kyInstance: ky.create({ baseUrl: "http://localhost/", fetch: testFetch.fetch })
		});

		await assert.rejects(async function () {
			await client.removeReaction("first-post");
		}, isBlogReactionClientFailure);

		assert.strictEqual(testFetch.requests.length, 1);
	});

	for (const statusCode of [429, 500, 503]) {
		test(`does not retry HTTP ${statusCode} responses`, async function () {
			const testFetch = createTestFetch({
				response: Response.json({ error: "temporarily_unavailable" }, { status: statusCode })
			});
			const client = createKyBlogReactionClient({
				kyInstance: ky.create({ baseUrl: "http://localhost/", fetch: testFetch.fetch })
			});

			await assert.rejects(async function () {
				await client.loadReaction("first-post");
			}, isBlogReactionClientFailure);

			assert.strictEqual(testFetch.requests.length, 1);
		});
	}

	test("does not retry network failures", async function () {
		const testFetch = createTestFetch({
			response: Response.json({ count: 0, reacted: false }),
			throwError: new Error("network failure")
		});
		const client = createKyBlogReactionClient({
			kyInstance: ky.create({ baseUrl: "http://localhost/", fetch: testFetch.fetch })
		});

		await assert.rejects(async function () {
			await client.loadReaction("first-post");
		}, isBlogReactionClientFailure);

		assert.strictEqual(testFetch.requests.length, 1);
	});

	for (const response of [
		new Response(null, { status: 200 }),
		new Response("not-json", { status: 200 }),
		Response.json({ count: -1, reacted: false }),
		Response.json({ count: 1.5, reacted: false }),
		Response.json({ count: 1, reacted: false, extra: true })
	]) {
		test("rejects invalid successful responses at the client boundary", async function () {
			const { client } = createClientWithResponse(response);

			await assert.rejects(async function () {
				await client.loadReaction("first-post");
			}, isBlogReactionClientFailure);
		});
	}
});
