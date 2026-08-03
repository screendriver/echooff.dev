import type { ComponentChildren } from "preact";
import { browserUnexpectedFailureReporter } from "../../browser/browser-failure-composition.ts";
import { createFireAndForgetInvoker } from "../../browser/fire-and-forget-invoker.ts";
import { createReportingBlogReactionClient } from "../../browser/reporting-blog-reaction-client.ts";
import { BlogPostReaction } from "./BlogPostReaction.tsx";
import { createKyBlogReactionClient } from "./blog-reaction-http-client.ts";
import { createRybbitBlogReactionAnalytics } from "./rybbit-blog-reaction-analytics.ts";
import { readRybbitBrowserApi } from "./rybbit-browser-adapter.ts";
import { createTrackedBlogReactionClient } from "./tracked-blog-reaction-client.ts";

export type Properties = {
	readonly postSlug: string;
};

const reactionHttpClient = createKyBlogReactionClient();
const reactionAnalytics = createRybbitBlogReactionAnalytics({
	readRybbitBrowserApi
});
const trackedReactionClient = createTrackedBlogReactionClient({
	analytics: reactionAnalytics,
	client: reactionHttpClient
});
const blogReactionClient = createReportingBlogReactionClient({
	client: trackedReactionClient,
	reporter: browserUnexpectedFailureReporter
});
const fireAndForgetInvoker = createFireAndForgetInvoker({
	reportFailure(error): void {
		browserUnexpectedFailureReporter.report(error, {
			feature: "blog_reactions",
			operation: "blog_reaction.fire_and_forget",
			runtime: "browser"
		});
	}
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
