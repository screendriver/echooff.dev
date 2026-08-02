import assert from "node:assert";
import { suite, test } from "mocha";
import { isBlogReactionClientFailure, type BlogReactionClient } from "../blog/reactions/blog-reaction-client.ts";
import type { UnexpectedFailureContext } from "./report-unexpected-browser-failure.ts";
import { createReportingBlogReactionClient } from "./reporting-blog-reaction-client.ts";

function createFailure(statusCode: number): Error {
	return Object.assign(new Error("The blog reaction request failed."), {
		kind: "blog_reaction_client_failure" as const,
		statusCode
	});
}

function createFailingClient(failure: unknown): BlogReactionClient {
	return {
		async addReaction(): Promise<never> {
			throw failure;
		},
		async loadReaction(): Promise<never> {
			throw failure;
		},
		async removeReaction(): Promise<never> {
			throw failure;
		}
	};
}

suite("createReportingBlogReactionClient()", function () {
	test("reports a structured HTTP 403 and rethrows the original failure", async function () {
		const capturedFailures: { readonly context: UnexpectedFailureContext; readonly error: unknown }[] = [];
		const expectedFailure = createFailure(403);
		const client = createReportingBlogReactionClient({
			client: createFailingClient(expectedFailure),
			reporter: {
				report(error, context): void {
					capturedFailures.push({ context, error });
				}
			}
		});

		await assert.rejects(
			async function readReaction(): Promise<unknown> {
				return client.addReaction("first-post");
			},
			function assertOriginalFailure(error: unknown): boolean {
				return error === expectedFailure;
			}
		);

		assert.deepStrictEqual(capturedFailures, [
			{
				context: {
					feature: "blog_reactions",
					operation: "blog_reaction.add",
					properties: { statusCode: 403 },
					runtime: "browser"
				},
				error: expectedFailure
			}
		]);
	});

	test("does not report expected HTTP 429 degradation", async function () {
		const capturedFailures: unknown[] = [];
		const expectedFailure = createFailure(429);
		const client = createReportingBlogReactionClient({
			client: createFailingClient(expectedFailure),
			reporter: {
				report(error): void {
					capturedFailures.push(error);
				}
			}
		});

		await assert.rejects(
			async function readReaction(): Promise<unknown> {
				return client.loadReaction("first-post");
			},
			function assertExpectedDegradation(error: unknown): boolean {
				return isBlogReactionClientFailure(error) && error === expectedFailure;
			}
		);

		assert.deepStrictEqual(capturedFailures, []);
	});
});
