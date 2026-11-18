import assert from "node:assert";
import { suite, test } from "mocha";
import {
	gitHubApiTokenInputSchema,
	gitHubBaseUrlInputSchema,
	gitHubLoginInputSchema
} from "./environment-variable-input-schema.ts";
import { parseGitHubApiToken, parseGitHubBaseUrl, parseGitHubLogin } from "./environment-variables.ts";

type InputAssertionSchema = {
	readonly assert: (input: unknown) => unknown;
};

function assertInputSchemaValue(inputSchema: InputAssertionSchema, input: unknown): void {
	inputSchema.assert(input);
}

suite("gitHub base URL schema", function () {
	test("does not allow booleans", function () {
		const expectedErrorMessage = "must be a string (was boolean)";

		assert.throws(assertInputSchemaValue.bind(undefined, gitHubBaseUrlInputSchema, true), {
			message: expectedErrorMessage
		});
	});

	test("does not allow numbers", function () {
		const expectedErrorMessage = "must be a string (was a number)";

		assert.throws(assertInputSchemaValue.bind(undefined, gitHubBaseUrlInputSchema, 42), {
			message: expectedErrorMessage
		});
	});

	test("does not allow empty strings", function () {
		const expectedErrorMessage = 'must be a URL string (was "")';

		assert.throws(assertInputSchemaValue.bind(undefined, gitHubBaseUrlInputSchema, ""), {
			message: expectedErrorMessage
		});
	});

	test("does not allow strings that are not an URL", function () {
		const expectedErrorMessage = 'must be a URL string (was "foo")';

		assert.throws(assertInputSchemaValue.bind(undefined, gitHubBaseUrlInputSchema, "foo"), {
			message: expectedErrorMessage
		});
	});

	test("allows a string URL", function () {
		const actualGitHubBaseUrl = gitHubBaseUrlInputSchema.assert("https://example.com");
		const expectedGitHubBaseUrl = "https://example.com";

		assert.strictEqual(actualGitHubBaseUrl, expectedGitHubBaseUrl);
	});

	test("parses a string URL into a URL instance", function () {
		const gitHubBaseUrl = parseGitHubBaseUrl("https://example.com");
		const expectedParsedGitHubBaseUrl = new URL("https://example.com");
		const actualGitHubBaseUrl = gitHubBaseUrl.href;
		const expectedGitHubBaseUrl = expectedParsedGitHubBaseUrl.href;

		assert.deepStrictEqual(actualGitHubBaseUrl, expectedGitHubBaseUrl);
	});
});

suite("gitHub login schema", function () {
	test("does not allow booleans", function () {
		const expectedErrorMessage = "must be a string (was boolean)";

		assert.throws(assertInputSchemaValue.bind(undefined, gitHubLoginInputSchema, true), {
			message: expectedErrorMessage
		});
	});

	test("does not allow numbers", function () {
		const expectedErrorMessage = "must be a string (was a number)";

		assert.throws(assertInputSchemaValue.bind(undefined, gitHubLoginInputSchema, 42), {
			message: expectedErrorMessage
		});
	});

	test("does not allow empty strings", function () {
		const expectedErrorMessage = "must be non-empty";

		assert.throws(assertInputSchemaValue.bind(undefined, gitHubLoginInputSchema, ""), {
			message: expectedErrorMessage
		});
	});

	test("allows non empty strings", function () {
		const actualGitHubLogin = gitHubLoginInputSchema.assert("foo");
		const expectedGitHubLogin = "foo";

		assert.strictEqual(actualGitHubLogin, expectedGitHubLogin);
	});

	test("parses a validated login string", function () {
		const actualGitHubLogin = parseGitHubLogin("foo");
		const expectedGitHubLogin = "foo";

		assert.strictEqual(actualGitHubLogin, expectedGitHubLogin);
	});
});

suite("gitHub API token schema", function () {
	test("does not allow booleans", function () {
		const expectedErrorMessage = "must be a string (was boolean)";

		assert.throws(assertInputSchemaValue.bind(undefined, gitHubApiTokenInputSchema, true), {
			message: expectedErrorMessage
		});
	});

	test("does not allow numbers", function () {
		const expectedErrorMessage = "must be a string (was a number)";

		assert.throws(assertInputSchemaValue.bind(undefined, gitHubApiTokenInputSchema, 42), {
			message: expectedErrorMessage
		});
	});

	test("does not allow empty strings", function () {
		const expectedErrorMessage = "must be non-empty";

		assert.throws(assertInputSchemaValue.bind(undefined, gitHubApiTokenInputSchema, ""), {
			message: expectedErrorMessage
		});
	});

	test("allows non empty strings", function () {
		const actualGitHubApiToken = gitHubApiTokenInputSchema.assert("foo");
		const expectedGitHubApiToken = "foo";

		assert.strictEqual(actualGitHubApiToken, expectedGitHubApiToken);
	});

	test("parses a validated API token string", function () {
		const actualGitHubApiToken = parseGitHubApiToken("foo");
		const expectedGitHubApiToken = "foo";

		assert.strictEqual(actualGitHubApiToken, expectedGitHubApiToken);
	});
});
