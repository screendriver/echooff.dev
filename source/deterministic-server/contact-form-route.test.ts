import { describe, expect, it } from "vitest";
import { Hono } from "hono";
import { registerContactFormRoute } from "./contact-form-route.js";

function createContactFormTestApplication(): Hono {
	const application = new Hono();

	registerContactFormRoute(application);

	return application;
}

describe("contact form route", () => {
	it("returns an empty JSON object when making a HTTP POST request", async () => {
		const application = createContactFormTestApplication();

		const response = await application.request("/contact-form", {
			method: "POST",
			headers: {
				"content-type": "application/x-www-form-urlencoded"
			},
			body: new URLSearchParams({
				message: "hello"
			}).toString()
		});

		await expect(response.json()).resolves.toStrictEqual({});
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

		expect(response.status).toBe(400);
		await expect(response.json()).resolves.toStrictEqual({
			error: "The content-type header must be application/x-www-form-urlencoded."
		});
	});
});
