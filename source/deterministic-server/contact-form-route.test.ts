import { describe, expect, it } from "vitest";
import { Hono } from "hono";
import { registerContactFormRoute } from "./contact-form-route.ts";

function createContactFormTestApplication(): Hono {
	const application = new Hono();

	registerContactFormRoute(application);

	return application;
}

describe("contact form route", () => {
	it("returns an empty JSON object when making a HTTP POST request", async () => {
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

		expect(actualResponseBody).toStrictEqual(expectedResponseBody);
	});

	it("rejects requests when the content type is incorrect", async () => {
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

		expect(actualResponseStatus).toBe(expectedResponseStatus);
		expect(actualResponseBody).toStrictEqual(expectedResponseBody);
	});
});
