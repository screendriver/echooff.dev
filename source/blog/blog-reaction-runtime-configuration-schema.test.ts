import assert from "node:assert";
import { suite, test } from "mocha";
import {
	blogReactionHmacSecretFilePathSchema,
	blogReactionHmacSecretSchema,
	blogReactionRuntimeEnvironmentSchema
} from "./blog-reaction-runtime-configuration-schema.ts";

function assertSchemaRejects(value: unknown): void {
	assert.throws(() => {
		blogReactionRuntimeEnvironmentSchema.assert(value);
	}, Error);
}

suite("blogReactionHmacSecretSchema", function () {
	test("accepts a 32-byte hexadecimal secret and longer representations", function () {
		const actualSecret = blogReactionHmacSecretSchema.assert("a".repeat(64));
		const actualLongSecret = blogReactionHmacSecretSchema.assert("b".repeat(128));

		assert.strictEqual(actualSecret, "a".repeat(64));
		assert.strictEqual(actualLongSecret, "b".repeat(128));
	});

	test("rejects missing, empty, short, odd-length, and non-hex secrets", function () {
		const invalidSecrets: unknown[] = [undefined, "", "a".repeat(63), "a".repeat(65), "g".repeat(64), 42];

		for (const invalidSecret of invalidSecrets) {
			assert.throws(() => {
				blogReactionHmacSecretSchema.assert(invalidSecret);
			}, Error);
		}
	});
});

suite("blogReactionRuntimeEnvironmentSchema", function () {
	test("requires the reaction HMAC secret", function () {
		assertSchemaRejects({});
		assertSchemaRejects({ BLOG_REACTION_HMAC_SECRET: "" });
	});

	test("accepts a valid reaction HMAC secret", function () {
		const actualEnvironment = blogReactionRuntimeEnvironmentSchema.assert({
			BLOG_REACTION_HMAC_SECRET: "a".repeat(64)
		});

		assert.deepStrictEqual(actualEnvironment, {
			BLOG_REACTION_HMAC_SECRET: "a".repeat(64)
		});
	});
});

suite("blogReactionHmacSecretFilePathSchema", function () {
	test("accepts a non-empty secret file path", function () {
		const actualSecretFilePath = blogReactionHmacSecretFilePathSchema.assert(
			"/run/secrets/blog_reaction_hmac_secret"
		);

		assert.strictEqual(actualSecretFilePath, "/run/secrets/blog_reaction_hmac_secret");
	});

	test("rejects an empty or non-string secret file path", function () {
		for (const invalidSecretFilePath of ["", undefined, 42]) {
			assert.throws(() => {
				blogReactionHmacSecretFilePathSchema.assert(invalidSecretFilePath);
			}, Error);
		}
	});
});
