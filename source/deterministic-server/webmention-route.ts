import type { Hono } from "hono";

type DeterministicWebmentionResponseBody = {
	readonly children: readonly unknown[];
};

function createDeterministicWebmentionResponseBody(requestOrigin: string): DeterministicWebmentionResponseBody {
	return {
		children: [
			{
				author: {
					name: "Jane Doe",
					photo: `${requestOrigin}/webmention-avatar.svg`,
					url: "https://social.example/@jane"
				},
				content: {
					text: "Thoughtful article."
				},
				published: "2026-03-24T10:00:00+00:00",
				url: "https://social.example/@jane/1",
				"wm-property": "in-reply-to"
			},
			{
				author: {
					name: "Chris"
				},
				published: "2026-03-25T08:30:00+00:00",
				url: "https://social.example/@chris/2",
				"wm-property": "mention-of"
			},
			{
				url: "https://social.example/@like/1",
				"wm-property": "like-of"
			},
			{
				url: "https://social.example/@bookmark/1",
				"wm-property": "bookmark-of"
			},
			{
				url: "https://social.example/@repost/1",
				"wm-property": "repost-of"
			}
		]
	};
}

export function registerWebmentionRoute(application: Hono): void {
	application.get("/webmentions", (context) => {
		const requestUrl = new URL(context.req.url);

		return context.json(createDeterministicWebmentionResponseBody(requestUrl.origin));
	});
}
