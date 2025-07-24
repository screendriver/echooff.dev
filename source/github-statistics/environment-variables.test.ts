import { test, expect } from "vitest";
import { parse } from "valibot";
import { gitHubApiTokenSchema, gitHubBaseUrlSchema, gitHubLoginSchema } from "./environment-variables.js";

test("gitHubBaseUrlSchema does not allow booleans", () => {
	expect(() => parse(gitHubBaseUrlSchema, true)).toThrow("Invalid type: Expected string but received true");
});

test("gitHubBaseUrlSchema does not allow numbers", () => {
	expect(() => parse(gitHubBaseUrlSchema, 42)).toThrow("Invalid type: Expected string but received 42");
});

test("gitHubBaseUrlSchema does not allow empty strings", () => {
	expect(() => parse(gitHubBaseUrlSchema, "")).toThrow('Invalid URL: Received ""');
});

test("gitHubBaseUrlSchema does not allow strings that are not an URL", () => {
	expect(() => parse(gitHubBaseUrlSchema, "foo")).toThrow('Invalid URL: Received "foo"');
});

test("gitHubBaseUrlSchema allows a string URL", () => {
	const gitHubBaseUrl = parse(gitHubBaseUrlSchema, "https://example.com");

	expect(gitHubBaseUrl.toString()).toStrictEqual(new URL("https://example.com").toString());
});

test("gitHubLoginSchema does not allow booleans", () => {
	expect(() => parse(gitHubLoginSchema, true)).toThrow("Invalid type: Expected string but received true");
});

test("gitHubLoginSchema does not allow numbers", () => {
	expect(() => parse(gitHubLoginSchema, 42)).toThrow("Invalid type: Expected string but received 42");
});

test("gitHubLoginSchema does not allow empty strings", () => {
	expect(() => parse(gitHubLoginSchema, "")).toThrow("Invalid length: Expected >=1 but received 0");
});

test("gitHubLoginSchema allows non empty strings", () => {
	const gitHubLogin = parse(gitHubLoginSchema, "foo");

	expect(gitHubLogin).toBe("foo");
});

test("gitHubApiTokenSchema does not allow booleans", () => {
	expect(() => parse(gitHubApiTokenSchema, true)).toThrow("Invalid type: Expected string but received true");
});

test("gitHubApiTokenSchema does not allow numbers", () => {
	expect(() => parse(gitHubApiTokenSchema, 42)).toThrow("Invalid type: Expected string but received 42");
});

test("gitHubApiTokenSchema does not allow empty strings", () => {
	expect(() => parse(gitHubApiTokenSchema, "")).toThrow("Invalid length: Expected >=1 but received 0");
});

test("gitHubApiTokenSchema allows non empty strings", () => {
	const gitHubLogin = parse(gitHubApiTokenSchema, "foo");

	expect(gitHubLogin).toBe("foo");
});
