import { describe, expect, it } from "vitest";
import { createDeterministicServerApplication } from "./deterministic-server.ts";

describe("hacker news route", () => {
	it("returns a deterministic mentions payload", async () => {
		const application = createDeterministicServerApplication();

		const response = await application.request(
			"/hacker-news?query=https://www.echooff.dev/blog/why-i-started-this-blog"
		);
		const actual: unknown = await response.json();
		const expected = {
			hits: [
				{
					created_at: "2026-04-02T10:00:00.000Z",
					num_comments: 42,
					objectID: "44000002",
					points: 128,
					title: "Why I started this blog",
					url: "https://www.echooff.dev/blog/why-i-started-this-blog"
				}
			]
		};

		expect(actual).toStrictEqual(expected);
	});
});
