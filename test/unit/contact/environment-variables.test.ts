import { test, assert } from "vitest";
import { stripIndent } from "common-tags";
import { ZodError } from "zod";
import { contactFormUrlSchema } from "../../../src/contact/environment-variables";

test("contactFormUrlSchema does not allow booleans", () => {
	assert.throws(
		() => contactFormUrlSchema.parse(true),
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
          ]`
	);
});

test("contactFormUrlSchema does not allow numbers", () => {
	assert.throws(
		() => contactFormUrlSchema.parse(42),
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
          ]`
	);
});

test("contactFormUrlSchema does not allow empty strings", () => {
	assert.throws(
		() => contactFormUrlSchema.parse(""),
		ZodError,
		stripIndent`
          [
            {
              "validation": "url",
              "code": "invalid_string",
              "message": "Invalid url",
              "path": []
            }
          ]`
	);
});

test("contactFormUrlSchema does not allow strings that are not an URL", () => {
	assert.throws(
		() => contactFormUrlSchema.parse("foo"),
		ZodError,
		stripIndent`
          [
            {
              "validation": "url",
              "code": "invalid_string",
              "message": "Invalid url",
              "path": []
            }
          ]`
	);
});

test("contactFormUrlSchema allows a string URL", () => {
	const gitHubBaseUrl = contactFormUrlSchema.parse("https://example.com");

	assert.deepEqual(gitHubBaseUrl.toString(), new URL("https://example.com").toString());
});
