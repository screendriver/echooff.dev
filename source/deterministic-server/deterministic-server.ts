import getPort from "get-port";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { registerContactFormRoute } from "./contact-form-route.js";
import { registerGraphQlRoute } from "./graphql-route.js";

export function createDeterministicServerApplication(): Hono {
	const application = new Hono();

	application.use("*", cors());
	registerGraphQlRoute(application);
	registerContactFormRoute(application);

	return application;
}

export async function startDeterministicServer(): Promise<string> {
	const availablePort = await getPort();
	const application = createDeterministicServerApplication();

	serve({
		fetch: application.fetch,
		port: availablePort,
		hostname: "127.0.0.1"
	});

	return `http://127.0.0.1:${availablePort}`;
}
