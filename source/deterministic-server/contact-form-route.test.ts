import assert from "node:assert";
import { suite, test } from "mocha";
import { Hono } from "hono";
import { registerContactFormRoute } from "./contact-form-route.ts";

function createContactFormTestApplication(): Hono {
	const application = new Hono();

	registerContactFormRoute(application);

	return application;
}

suite("contact form route", function () {
	test("returns an empty JSON object when making a HTTP POST request", async function () {
		const application = createContactFormTestApplication();
		const formBody = new URLSearchParams({
			message: "hello"
		});

		const response = await application.request("/contact-form", {
			method: "POST",
			headers: {
				"content-type": "application/x-www-form-urlencoded"
			},
			body: formBody.toString()
		});
		const actualResponseBody: unknown = await response.json();
		const expectedResponseBody = {};

		assert.deepStrictEqual(actualResponseBody, expectedResponseBody);
	});

	test("rejects requests when the content type is incorrect", async function () {
		const application = createContactFormTestApplication();

		const response = await application.request("/contact-form", {
			method: "POST",
			headers: {
				"content-type": "application/json"
			},
			body: JSON.stringify({})
		});
		const actualResponseStatus = response.status;
		const actualResponseBody: unknown = await response.json();
		const expectedResponseStatus = 400;
		const expectedResponseBody = {
			error: "The content-type header must be application/x-www-form-urlencoded."
		};

		assert.strictEqual(actualResponseStatus, expectedResponseStatus);
		assert.deepStrictEqual(actualResponseBody, expectedResponseBody);
	});
});
