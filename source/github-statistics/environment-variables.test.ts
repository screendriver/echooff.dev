import test from "node:test";
import assert from "node:assert";
import { stripIndent } from "common-tags";
import { ZodError } from "zod";
import { gitHubApiTokenSchema, gitHubBaseUrlSchema, gitHubLoginSchema } from "./environment-variables";

test("gitHubBaseUrlSchema does not allow booleans", () => {
	assert.throws(
		() => gitHubBaseUrlSchema.parse(true),
		ZodError,
		stripIndent`
          [
            {
              "code": "invalid_type",
              "expected": "string",
              "received": "boolean",
              "path": [],
              "message": "Expected string, received boolean"
            }
          ]`,
	);
});

test("gitHubBaseUrlSchema does not allow numbers", () => {
	assert.throws(
		() => gitHubBaseUrlSchema.parse(42),
		ZodError,
		stripIndent`
          [
            {
              "code": "invalid_type",
              "expected": "string",
              "received": "number",
              "path": [],
              "message": "Expected string, received number"
            }
          ]`,
	);
});

test("gitHubBaseUrlSchema does not allow empty strings", () => {
	assert.throws(
		() => gitHubBaseUrlSchema.parse(""),
		ZodError,
		stripIndent`
          [
            {
              "validation": "url",
              "code": "invalid_string",
              "message": "Invalid url",
              "path": []
            }
          ]`,
	);
});

test("gitHubBaseUrlSchema does not allow strings that are not an URL", () => {
	assert.throws(
		() => gitHubBaseUrlSchema.parse("foo"),
		ZodError,
		stripIndent`
          [
            {
              "validation": "url",
              "code": "invalid_string",
              "message": "Invalid url",
              "path": []
            }
          ]`,
	);
});

test("gitHubBaseUrlSchema allows a string URL", () => {
	const gitHubBaseUrl = gitHubBaseUrlSchema.parse("https://example.com");

	assert.deepEqual(gitHubBaseUrl.toString(), new URL("https://example.com").toString());
});

test("gitHubLoginSchema does not allow booleans", () => {
	assert.throws(
		() => gitHubLoginSchema.parse(true),
		ZodError,
		stripIndent`
      [
        {
          "code": "invalid_type",
          "expected": "string",
          "received": "boolean",
          "path": [],
          "message": "Expected string, received boolean"
        }
      ]`,
	);
});

test("gitHubLoginSchema does not allow numbers", () => {
	assert.throws(
		() => gitHubLoginSchema.parse(42),
		ZodError,
		stripIndent`
        [
          {
            "code": "invalid_type",
            "expected": "string",
            "received": "number",
            "path": [],
            "message": "Expected string, received number"
          }
        ]`,
	);
});

test("gitHubLoginSchema does not allow empty strings", () => {
	assert.throws(
		() => gitHubLoginSchema.parse(""),
		ZodError,
		stripIndent`
        [
          {
            "code": "too_small",
            "minimum": 1,
            "type": "string",
            "inclusive": true,
            "exact": false,
            "message": "String must contain at least 1 character(s)",
            "path": []
          }
        ]`,
	);
});

test("gitHubLoginSchema allows non empty strings", () => {
	const gitHubLogin = gitHubLoginSchema.parse("foo");

	assert.strictEqual(gitHubLogin, "foo");
});

test("gitHubApiTokenSchema does not allow booleans", () => {
	assert.throws(
		() => gitHubApiTokenSchema.parse(true),
		ZodError,
		stripIndent`
      [
        {
          "code": "invalid_type",
          "expected": "string",
          "received": "boolean",
          "path": [],
          "message": "Expected string, received boolean"
        }
      ]`,
	);
});

test("gitHubApiTokenSchema does not allow numbers", () => {
	assert.throws(
		() => gitHubApiTokenSchema.parse(42),
		ZodError,
		stripIndent`
        [
          {
            "code": "invalid_type",
            "expected": "string",
            "received": "number",
            "path": [],
            "message": "Expected string, received number"
          }
        ]`,
	);
});

test("gitHubApiTokenSchema does not allow empty strings", () => {
	assert.throws(
		() => gitHubApiTokenSchema.parse(""),
		ZodError,
		stripIndent`
        [
          {
            "code": "too_small",
            "minimum": 1,
            "type": "string",
            "inclusive": true,
            "exact": false,
            "message": "String must contain at least 1 character(s)",
            "path": []
          }
        ]`,
	);
});

test("gitHubApiTokenSchema allows non empty strings", () => {
	const gitHubLogin = gitHubApiTokenSchema.parse("foo");

	assert.strictEqual(gitHubLogin, "foo");
});
