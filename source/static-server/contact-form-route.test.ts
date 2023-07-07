import test from "node:test";
import assert from "node:assert";
import createFastify from "fastify";
import fastifyFormBody from "@fastify/formbody";
import { createContactFormRoute } from "./contact-form-route.js";

test("returns an an empty JSON object when making a HTTP POST request", async () => {
	const fastify = createFastify();
	void fastify.register(fastifyFormBody);
	fastify.route(createContactFormRoute());

	const response = await fastify.inject({
		method: "POST",
		url: "/contact-form",
		headers: {
			"content-type": "application/x-www-form-urlencoded",
		},
	});

	const actual = response.json<unknown>();
	const expected = {};
	assert.deepEqual(actual, expected);
});
