import test from "ava";
import createFastify from "fastify";
import fastifyFormBody from "@fastify/formbody";
import { createContactFormRoute } from "../../../src/static-server/contact-form-route";

test("returns an an empty JSON object when making a HTTP POST request", async (t) => {
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
    t.deepEqual(actual, expected);
});
