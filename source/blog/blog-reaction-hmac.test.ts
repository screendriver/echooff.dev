import assert from "node:assert";
import { suite, test } from "mocha";
import { createBlogReactionHash } from "./blog-reaction-hmac.ts";

const deterministicHmacSecret = "a".repeat(64);

suite("createBlogReactionHash()", function () {
	test("creates a deterministic SHA-256 hash for the identity and post", function () {
		const actualHash = createBlogReactionHash({
			anonymousReactorIdentifier: "identity-one",
			postSlug: "quiet-post",
			secret: deterministicHmacSecret
		});
		const expectedHash = "7182fd127d23d50127c6617b0df76a2186d038e8f83a6a23ffc26b02df700e1c";

		assert.strictEqual(actualHash, expectedHash);
	});

	test("separates the identity and slug so ambiguous concatenations cannot collide", function () {
		const firstHash = createBlogReactionHash({
			anonymousReactorIdentifier: "ab",
			postSlug: "c",
			secret: deterministicHmacSecret
		});
		const secondHash = createBlogReactionHash({
			anonymousReactorIdentifier: "a",
			postSlug: "bc",
			secret: deterministicHmacSecret
		});

		assert.notStrictEqual(firstHash, secondHash);
	});

	test("changes for different identities and different posts", function () {
		const identityOnePostOneHash = createBlogReactionHash({
			anonymousReactorIdentifier: "identity-one",
			postSlug: "post-one",
			secret: deterministicHmacSecret
		});
		const identityTwoPostOneHash = createBlogReactionHash({
			anonymousReactorIdentifier: "identity-two",
			postSlug: "post-one",
			secret: deterministicHmacSecret
		});
		const identityOnePostTwoHash = createBlogReactionHash({
			anonymousReactorIdentifier: "identity-one",
			postSlug: "post-two",
			secret: deterministicHmacSecret
		});

		assert.notStrictEqual(identityOnePostOneHash, identityTwoPostOneHash);
		assert.notStrictEqual(identityOnePostOneHash, identityOnePostTwoHash);
	});

	test("does not include the raw identity or slug in the stored hash", function () {
		const actualHash = createBlogReactionHash({
			anonymousReactorIdentifier: "identity-one",
			postSlug: "quiet-post",
			secret: deterministicHmacSecret
		});

		assert.strictEqual(actualHash.includes("identity-one"), false);
		assert.strictEqual(actualHash.includes("quiet-post"), false);
		assert.strictEqual(actualHash.length, 64);
	});
});
