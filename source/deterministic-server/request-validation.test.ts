import assert from "node:assert/strict";
import { describe, expect, it } from "vitest";
import { isErr, isOk, ok } from "true-myth/result";
import { validateContactFormRequest, validateGraphQlRequest } from "./request-validation.ts";

describe("request validation", () => {
	it("returns a Result Ok for a valid GraphQL request", async () => {
		const graphQlRequest = new Request("https://example.com/graphql", {
			method: "POST",
			headers: {
				accept: "application/vnd.github.v3+json",
				authorization: "token example",
				"user-agent": "vitest",
				"content-type": "application/json"
			},
			body: JSON.stringify({
				query: "{ user { login } }"
			})
		});

		const actualValidationResult = await validateGraphQlRequest(graphQlRequest);
		const expectedValidationResult = ok(undefined);
		const actualIsOkResult = isOk(actualValidationResult);

		assert.ok(actualIsOkResult);

		expect(actualValidationResult).toStrictEqual(expectedValidationResult);
	});

	it("returns a Result Err for an invalid GraphQL request body", async () => {
		const graphQlRequest = new Request("https://example.com/graphql", {
			method: "POST",
			headers: {
				accept: "application/vnd.github.v3+json",
				authorization: "token example",
				"user-agent": "vitest",
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

		expect(actualErrorMessage).toBe(expectedErrorMessage);
		expect(actualErrorType).toBeInstanceOf(expectedErrorType);
	});

	it("returns a Result Ok for a valid contact form request", async () => {
		const contactFormRequest = new Request("https://example.com/contact-form", {
			method: "POST",
			headers: {
				"content-type": "application/x-www-form-urlencoded"
			},
			body: new URLSearchParams({
				message: "hello"
			}).toString()
		});

		const actualValidationResult = await validateContactFormRequest(contactFormRequest);
		const expectedValidationResult = ok(undefined);
		const actualIsOkResult = isOk(actualValidationResult);

		assert.ok(actualIsOkResult);

		expect(actualValidationResult).toStrictEqual(expectedValidationResult);
	});

	it("returns a Result Err for an invalid contact form content type", async () => {
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

		expect(actualErrorMessage).toBe(expectedErrorMessage);
		expect(actualErrorType).toBeInstanceOf(expectedErrorType);
	});
});
