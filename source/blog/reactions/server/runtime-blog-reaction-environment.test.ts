import assert from "node:assert";
import { suite, test } from "mocha";
import { reject as rejectTask, resolve as resolveTask } from "true-myth/task";
import { isErr, isOk } from "true-myth/result";
import { createRuntimeBlogReactionEnvironmentReader } from "./runtime-blog-reaction-environment.ts";

const validBlogReactionHmacSecret = "a".repeat(64);
const blogReactionSecretFilePath = "/run/secrets/blog_reaction_hmac_secret";

suite("createRuntimeBlogReactionEnvironmentReader()", function () {
	test("reads the direct secret environment variable when no file path is configured", async function () {
		let secretFileReadCount = 0;
		const readRuntimeEnvironment = createRuntimeBlogReactionEnvironmentReader({
			readEnvironmentVariable(environmentVariableName) {
				if (environmentVariableName === "BLOG_REACTION_HMAC_SECRET") {
					return validBlogReactionHmacSecret;
				}

				return undefined;
			},
			readSecretFile() {
				secretFileReadCount += 1;

				return resolveTask(validBlogReactionHmacSecret);
			}
		});

		const result = await readRuntimeEnvironment();

		assert.ok(isOk(result));
		assert.deepStrictEqual(result.value, { BLOG_REACTION_HMAC_SECRET: validBlogReactionHmacSecret });
		assert.strictEqual(secretFileReadCount, 0);
	});

	test("reads and trims the configured secret file", async function () {
		let actualSecretFilePath = "";
		const readRuntimeEnvironment = createRuntimeBlogReactionEnvironmentReader({
			readEnvironmentVariable(environmentVariableName) {
				if (environmentVariableName === "BLOG_REACTION_HMAC_SECRET_FILE") {
					return blogReactionSecretFilePath;
				}

				return undefined;
			},
			readSecretFile(secretFilePath) {
				actualSecretFilePath = secretFilePath;

				return resolveTask(`${validBlogReactionHmacSecret}\n`);
			}
		});

		const result = await readRuntimeEnvironment();

		assert.ok(isOk(result));
		assert.deepStrictEqual(result.value, { BLOG_REACTION_HMAC_SECRET: validBlogReactionHmacSecret });
		assert.strictEqual(actualSecretFilePath, blogReactionSecretFilePath);
	});

	test("rejects an invalid secret file path before reading it", async function () {
		let secretFileReadCount = 0;
		const readRuntimeEnvironment = createRuntimeBlogReactionEnvironmentReader({
			readEnvironmentVariable() {
				return "";
			},
			readSecretFile() {
				secretFileReadCount += 1;

				return resolveTask(validBlogReactionHmacSecret);
			}
		});

		const result = await readRuntimeEnvironment();

		assert.ok(isErr(result));
		assert.strictEqual(secretFileReadCount, 0);
	});

	test("normalizes a secret file read failure", async function () {
		const expectedError = new Error("secret file unavailable");
		const readRuntimeEnvironment = createRuntimeBlogReactionEnvironmentReader({
			readEnvironmentVariable() {
				return blogReactionSecretFilePath;
			},
			readSecretFile() {
				return rejectTask(expectedError);
			}
		});

		const result = await readRuntimeEnvironment();

		assert.ok(isErr(result));
		assert.notStrictEqual(result.error, expectedError);
		assert.strictEqual(result.error.message, "The runtime blog reaction environment could not be read.");
	});
});
