import type { ComponentChildren } from "preact";
import { createFireAndForgetInvoker } from "../../browser/fire-and-forget-invoker.ts";
import { reportUnexpectedBrowserFailure } from "../../browser/report-unexpected-browser-failure.ts";
import { BlogPostReaction } from "./BlogPostReaction.tsx";
import { createKyBlogReactionClient } from "./blog-reaction-http-client.ts";

export type Properties = {
	readonly postSlug: string;
};

const blogReactionClient = createKyBlogReactionClient();
const fireAndForgetInvoker = createFireAndForgetInvoker({
	reportFailure: reportUnexpectedBrowserFailure
});

export function BlogPostReactionIsland(properties: Properties): ComponentChildren {
	const { postSlug } = properties;

	return (
		<BlogPostReaction
			fireAndForgetInvoker={fireAndForgetInvoker}
			postSlug={postSlug}
			reactionClient={blogReactionClient}
		/>
	);
}
