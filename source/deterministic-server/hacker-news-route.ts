import type { Hono } from "hono";

type DeterministicHackerNewsResponseBody = {
	readonly hits: readonly unknown[];
};

function createDeterministicHackerNewsResponseBody(
	targetUrl: string
): DeterministicHackerNewsResponseBody {
	return {
		hits: [
			{
				created_at: "2026-04-02T10:00:00.000Z",
				num_comments: 42,
				objectID: "44000002",
				points: 128,
				title: "Why I started this blog",
				url: targetUrl
			}
		]
	};
}

export function registerHackerNewsRoute(application: Hono): void {
	application.get("/hacker-news", (context) => {
		const targetUrl = context.req.query("query") ?? "https://www.echooff.dev/blog/why-i-started-this-blog";

		return context.json(createDeterministicHackerNewsResponseBody(targetUrl));
	});
}
