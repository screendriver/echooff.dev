import { test, expect } from "vitest";
import { stripIndent } from "common-tags";
import { gitHubApiTokenSchema, gitHubBaseUrlSchema, gitHubLoginSchema } from "./environment-variables.js";

test("gitHubBaseUrlSchema does not allow booleans", () => {
	expect(() => gitHubBaseUrlSchema.parse(true)).toThrowError(
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
	expect(() => gitHubBaseUrlSchema.parse(42)).toThrowError(
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
	expect(() => gitHubBaseUrlSchema.parse("")).toThrowError(
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
	expect(() => gitHubBaseUrlSchema.parse("foo")).toThrowError(
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

	expect(gitHubBaseUrl.toString()).toStrictEqual(new URL("https://example.com").toString());
});

test("gitHubLoginSchema does not allow booleans", () => {
	expect(() => gitHubLoginSchema.parse(true)).toThrowError(
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
	expect(() => gitHubLoginSchema.parse(42)).toThrowError(
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
	expect(() => gitHubLoginSchema.parse("")).toThrowError(
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

	expect(gitHubLogin).toBe("foo");
});

test("gitHubApiTokenSchema does not allow booleans", () => {
	expect(() => gitHubApiTokenSchema.parse(true)).toThrowError(
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
	expect(() => gitHubApiTokenSchema.parse(42)).toThrowError(
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
	expect(() => gitHubApiTokenSchema.parse("")).toThrowError(
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

	expect(gitHubLogin).toBe("foo");
});
