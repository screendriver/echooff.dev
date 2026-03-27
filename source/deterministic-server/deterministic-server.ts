import getPort from "get-port";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { registerContactFormRoute } from "./contact-form-route.js";
import { registerGraphQlRoute } from "./graphql-route.js";
import { registerWebmentionRoute } from "./webmention-route.js";

export function createDeterministicServerApplication(): Hono {
	const application = new Hono();

	application.use("*", cors());
	application.use(
		"/webmention-avatar.svg",
		serveStatic({
			onFound: (_servedPathname, context) => {
				context.header("content-type", "image/svg+xml");
			},
			root: "./source/deterministic-server/assets",
			path: "webmention-avatar.svg"
		})
	);
	registerGraphQlRoute(application);
	registerContactFormRoute(application);
	registerWebmentionRoute(application);

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
