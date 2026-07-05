import assert from "node:assert";
import { suite, test } from "mocha";
import { isErr, isOk, ok } from "true-myth/result";
import { Unit } from "true-myth/unit";
import { validateContactFormRequest, validateGraphQlRequest } from "./request-validation.ts";

suite("request validation", function () {
	test("returns a Result Ok for a valid GraphQL request", async function () {
		const graphQlRequest = new Request("https://example.com/graphql", {
			method: "POST",
			headers: {
				accept: "application/vnd.github.v3+json",
				authorization: "token example",
				"user-agent": "mocha",
				"content-type": "application/json"
			},
			body: JSON.stringify({
				query: "{ user { login } }"
			})
		});

		const actualValidationResult = await validateGraphQlRequest(graphQlRequest);
		const expectedValidationResult = ok(Unit);
		const actualIsOkResult = isOk(actualValidationResult);

		assert.ok(actualIsOkResult);

		assert.deepStrictEqual(actualValidationResult, expectedValidationResult);
	});

	test("returns a Result Err for an invalid GraphQL request body", async function () {
		const graphQlRequest = new Request("https://example.com/graphql", {
			method: "POST",
			headers: {
				accept: "application/vnd.github.v3+json",
				authorization: "token example",
				"user-agent": "mocha",
				"content-type": "application/json"
			},
			body: JSON.stringify({})
		});

		const actualValidationResult = await validateGraphQlRequest(graphQlRequest);
		const expectedErrorMessage = "The request body must contain a query string.";
		const expectedErrorType = TypeError;
		const actualIsErrResult = isErr(actualValidationResult);

		assert.ok(actualIsErrResult);

		const actualError = actualValidationResult.error;
		const actualErrorMessage = actualError.message;
		const actualErrorType = actualError;

		assert.strictEqual(actualErrorMessage, expectedErrorMessage);
		assert.ok(actualErrorType instanceof expectedErrorType);
	});

	test("returns a Result Ok for a valid contact form request", async function () {
		const formBody = new URLSearchParams({
			message: "hello"
		});
		const contactFormRequest = new Request("https://example.com/contact-form", {
			method: "POST",
			headers: {
				"content-type": "application/x-www-form-urlencoded"
			},
			body: formBody.toString()
		});

		const actualValidationResult = await validateContactFormRequest(contactFormRequest);
		const expectedValidationResult = ok(Unit);
		const actualIsOkResult = isOk(actualValidationResult);

		assert.ok(actualIsOkResult);

		assert.deepStrictEqual(actualValidationResult, expectedValidationResult);
	});

	test("returns a Result Err for an invalid contact form content type", async function () {
		const contactFormRequest = new Request("https://example.com/contact-form", {
			method: "POST",
			headers: {
				"content-type": "application/json"
			},
			body: JSON.stringify({})
		});

		const actualValidationResult = await validateContactFormRequest(contactFormRequest);
		const expectedErrorMessage = "The content-type header must be application/x-www-form-urlencoded.";
		const expectedErrorType = TypeError;
		const actualIsErrResult = isErr(actualValidationResult);

		assert.ok(actualIsErrResult);

		const actualError = actualValidationResult.error;
		const actualErrorMessage = actualError.message;
		const actualErrorType = actualError;

		assert.strictEqual(actualErrorMessage, expectedErrorMessage);
		assert.ok(actualErrorType instanceof expectedErrorType);
	});
});
