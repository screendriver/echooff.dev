import { describe, expect, it } from "vitest";
import {
	gitHubApiTokenInputSchema,
	gitHubBaseUrlInputSchema,
	gitHubLoginInputSchema
} from "./environment-variable-input-schema.ts";
import { parseGitHubApiToken, parseGitHubBaseUrl, parseGitHubLogin } from "./environment-variables.ts";

describe("gitHub base URL schema", () => {
	it("does not allow booleans", () => {
		const actualAssertionOperation = (): void => {
			gitHubBaseUrlInputSchema.assert(true);
		};
		const expectedErrorMessage = "must be a string (was boolean)";

		expect(actualAssertionOperation).toThrow(expectedErrorMessage);
	});

	it("does not allow numbers", () => {
		const actualAssertionOperation = (): void => {
			gitHubBaseUrlInputSchema.assert(42);
		};
		const expectedErrorMessage = "must be a string (was a number)";

		expect(actualAssertionOperation).toThrow(expectedErrorMessage);
	});

	it("does not allow empty strings", () => {
		const actualAssertionOperation = (): void => {
			gitHubBaseUrlInputSchema.assert("");
		};
		const expectedErrorMessage = 'must be a URL string (was "")';

		expect(actualAssertionOperation).toThrow(expectedErrorMessage);
	});

	it("does not allow strings that are not an URL", () => {
		const actualAssertionOperation = (): void => {
			gitHubBaseUrlInputSchema.assert("foo");
		};
		const expectedErrorMessage = 'must be a URL string (was "foo")';

		expect(actualAssertionOperation).toThrow(expectedErrorMessage);
	});

	it("allows a string URL", () => {
		const actualGitHubBaseUrl = gitHubBaseUrlInputSchema.assert("https://example.com");
		const expectedGitHubBaseUrl = "https://example.com";

		expect(actualGitHubBaseUrl).toBe(expectedGitHubBaseUrl);
	});

	it("parses a string URL into a URL instance", () => {
		const gitHubBaseUrl = parseGitHubBaseUrl("https://example.com");
		const actualGitHubBaseUrl = gitHubBaseUrl.toString();
		const expectedGitHubBaseUrl = new URL("https://example.com").toString();

		expect(actualGitHubBaseUrl).toStrictEqual(expectedGitHubBaseUrl);
	});
});

describe("gitHub login schema", () => {
	it("does not allow booleans", () => {
		const actualAssertionOperation = (): void => {
			gitHubLoginInputSchema.assert(true);
		};
		const expectedErrorMessage = "must be a string (was boolean)";

		expect(actualAssertionOperation).toThrow(expectedErrorMessage);
	});

	it("does not allow numbers", () => {
		const actualAssertionOperation = (): void => {
			gitHubLoginInputSchema.assert(42);
		};
		const expectedErrorMessage = "must be a string (was a number)";

		expect(actualAssertionOperation).toThrow(expectedErrorMessage);
	});

	it("does not allow empty strings", () => {
		const actualAssertionOperation = (): void => {
			gitHubLoginInputSchema.assert("");
		};
		const expectedErrorMessage = "must be non-empty";

		expect(actualAssertionOperation).toThrow(expectedErrorMessage);
	});

	it("allows non empty strings", () => {
		const actualGitHubLogin = gitHubLoginInputSchema.assert("foo");
		const expectedGitHubLogin = "foo";

		expect(actualGitHubLogin).toBe(expectedGitHubLogin);
	});

	it("parses a validated login string", () => {
		const actualGitHubLogin = parseGitHubLogin("foo");
		const expectedGitHubLogin = "foo";

		expect(actualGitHubLogin).toBe(expectedGitHubLogin);
	});
});

describe("gitHub API token schema", () => {
	it("does not allow booleans", () => {
		const actualAssertionOperation = (): void => {
			gitHubApiTokenInputSchema.assert(true);
		};
		const expectedErrorMessage = "must be a string (was boolean)";

		expect(actualAssertionOperation).toThrow(expectedErrorMessage);
	});

	it("does not allow numbers", () => {
		const actualAssertionOperation = (): void => {
			gitHubApiTokenInputSchema.assert(42);
		};
		const expectedErrorMessage = "must be a string (was a number)";

		expect(actualAssertionOperation).toThrow(expectedErrorMessage);
	});

	it("does not allow empty strings", () => {
		const actualAssertionOperation = (): void => {
			gitHubApiTokenInputSchema.assert("");
		};
		const expectedErrorMessage = "must be non-empty";

		expect(actualAssertionOperation).toThrow(expectedErrorMessage);
	});

	it("allows non empty strings", () => {
		const actualGitHubApiToken = gitHubApiTokenInputSchema.assert("foo");
		const expectedGitHubApiToken = "foo";

		expect(actualGitHubApiToken).toBe(expectedGitHubApiToken);
	});

	it("parses a validated API token string", () => {
		const actualGitHubApiToken = parseGitHubApiToken("foo");
		const expectedGitHubApiToken = "foo";

		expect(actualGitHubApiToken).toBe(expectedGitHubApiToken);
	});
});
