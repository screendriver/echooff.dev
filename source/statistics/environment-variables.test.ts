import { describe, expect, it } from "vitest";
import {
	gitHubApiTokenInputSchema,
	gitHubBaseUrlInputSchema,
	gitHubLoginInputSchema
} from "./environment-variable-input-schema.js";
import { parseGitHubApiToken, parseGitHubBaseUrl, parseGitHubLogin } from "./environment-variables.js";

describe("gitHub base URL schema", () => {
	it("does not allow booleans", () => {
		expect(() => {
			gitHubBaseUrlInputSchema.assert(true);
		}).toThrow("must be a string (was boolean)");
	});

	it("does not allow numbers", () => {
		expect(() => {
			gitHubBaseUrlInputSchema.assert(42);
		}).toThrow("must be a string (was a number)");
	});

	it("does not allow empty strings", () => {
		expect(() => {
			gitHubBaseUrlInputSchema.assert("");
		}).toThrow('must be a URL string (was "")');
	});

	it("does not allow strings that are not an URL", () => {
		expect(() => {
			gitHubBaseUrlInputSchema.assert("foo");
		}).toThrow('must be a URL string (was "foo")');
	});

	it("allows a string URL", () => {
		const gitHubBaseUrl = gitHubBaseUrlInputSchema.assert("https://example.com");

		expect(gitHubBaseUrl).toBe("https://example.com");
	});

	it("parses a string URL into a URL instance", () => {
		const gitHubBaseUrl = parseGitHubBaseUrl("https://example.com");

		expect(gitHubBaseUrl.toString()).toStrictEqual(new URL("https://example.com").toString());
	});
});

describe("gitHub login schema", () => {
	it("does not allow booleans", () => {
		expect(() => {
			gitHubLoginInputSchema.assert(true);
		}).toThrow("must be a string (was boolean)");
	});

	it("does not allow numbers", () => {
		expect(() => {
			gitHubLoginInputSchema.assert(42);
		}).toThrow("must be a string (was a number)");
	});

	it("does not allow empty strings", () => {
		expect(() => {
			gitHubLoginInputSchema.assert("");
		}).toThrow("must be non-empty");
	});

	it("allows non empty strings", () => {
		const gitHubLogin = gitHubLoginInputSchema.assert("foo");

		expect(gitHubLogin).toBe("foo");
	});

	it("parses a validated login string", () => {
		expect(parseGitHubLogin("foo")).toBe("foo");
	});
});

describe("gitHub API token schema", () => {
	it("does not allow booleans", () => {
		expect(() => {
			gitHubApiTokenInputSchema.assert(true);
		}).toThrow("must be a string (was boolean)");
	});

	it("does not allow numbers", () => {
		expect(() => {
			gitHubApiTokenInputSchema.assert(42);
		}).toThrow("must be a string (was a number)");
	});

	it("does not allow empty strings", () => {
		expect(() => {
			gitHubApiTokenInputSchema.assert("");
		}).toThrow("must be non-empty");
	});

	it("allows non empty strings", () => {
		const gitHubLogin = gitHubApiTokenInputSchema.assert("foo");

		expect(gitHubLogin).toBe("foo");
	});

	it("parses a validated API token string", () => {
		expect(parseGitHubApiToken("foo")).toBe("foo");
	});
});
