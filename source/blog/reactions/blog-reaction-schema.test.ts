import assert from "node:assert";
import { suite, test } from "mocha";
import {
	blogReactionErrorResponseSchema,
	blogReactionResponseSchema,
	blogReactionRouteParametersSchema
} from "./blog-reaction-schema.ts";

type AssertionSchema = {
	readonly assert: (value: unknown) => unknown;
};

function assertSchemaRejects(schema: AssertionSchema, value: unknown): void {
	assert.throws(() => {
		schema.assert(value);
	}, Error);
}

suite("blogReactionResponseSchema", function () {
	test("accepts zero, singular, and plural reaction counts", function () {
		const actualZeroReactions = blogReactionResponseSchema.assert({ count: 0, reacted: false });
		const actualOneReaction = blogReactionResponseSchema.assert({ count: 1, reacted: true });
		const actualSeveralReactions = blogReactionResponseSchema.assert({ count: 7, reacted: false });

		assert.deepStrictEqual(actualZeroReactions, { count: 0, reacted: false });
		assert.deepStrictEqual(actualOneReaction, { count: 1, reacted: true });
		assert.deepStrictEqual(actualSeveralReactions, { count: 7, reacted: false });
	});

	test("rejects missing, invalid, and undeclared response values", function () {
		const invalidResponses: unknown[] = [
			{},
			{ count: 1 },
			{ reacted: false },
			{ count: -1, reacted: false },
			{ count: 1.5, reacted: false },
			{ count: Number.NaN, reacted: false },
			{ count: Number.POSITIVE_INFINITY, reacted: false },
			{ count: "1", reacted: false },
			{ count: 1, reacted: "false" },
			{ count: 1, reacted: false, extra: true },
			[],
			null
		];

		for (const invalidResponse of invalidResponses) {
			assertSchemaRejects(blogReactionResponseSchema, invalidResponse);
		}
	});
});

suite("blogReactionErrorResponseSchema", function () {
	test("accepts every public error code", function () {
		for (const errorCode of ["not_found", "rate_limited", "temporarily_unavailable"] as const) {
			const actualErrorResponse = blogReactionErrorResponseSchema.assert({ error: errorCode });

			assert.deepStrictEqual(actualErrorResponse, { error: errorCode });
		}
	});

	test("rejects internal error details and unknown error codes", function () {
		assertSchemaRejects(blogReactionErrorResponseSchema, { error: "database_error" });
		assertSchemaRejects(blogReactionErrorResponseSchema, { error: "not_found", message: "SQLITE_BUSY" });
		assertSchemaRejects(blogReactionErrorResponseSchema, {});
	});
});

suite("blogReactionRouteParametersSchema", function () {
	test("accepts normalized lowercase blog post slugs", function () {
		const actualRouteParameters = blogReactionRouteParametersSchema.assert({
			slug: "avoid-throwing-for-expected-failures-typescript"
		});

		assert.deepStrictEqual(actualRouteParameters, {
			slug: "avoid-throwing-for-expected-failures-typescript"
		});
	});

	test("rejects missing, empty, malformed, long, and undeclared slugs", function () {
		const invalidRouteParameters: unknown[] = [
			{},
			{ slug: "" },
			{ slug: "Uppercase" },
			{ slug: "contains_underscore" },
			{ slug: "starts-with-" },
			{ slug: "-starts-with" },
			{ slug: "a".repeat(256) },
			{ slug: "valid-slug", extra: true },
			null
		];

		for (const invalidRouteParameter of invalidRouteParameters) {
			assertSchemaRejects(blogReactionRouteParametersSchema, invalidRouteParameter);
		}
	});
});
