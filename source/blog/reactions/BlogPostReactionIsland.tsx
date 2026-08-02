import type { ComponentChildren } from "preact";
import { browserUnexpectedFailureReporter } from "../../browser/browser-failure-composition.ts";
import { createFireAndForgetInvoker } from "../../browser/fire-and-forget-invoker.ts";
import { createReportingBlogReactionClient } from "../../browser/reporting-blog-reaction-client.ts";
import { BlogPostReaction } from "./BlogPostReaction.tsx";
import { createKyBlogReactionClient } from "./blog-reaction-http-client.ts";

export type Properties = {
	readonly postSlug: string;
};

const blogReactionClient = createReportingBlogReactionClient({
	client: createKyBlogReactionClient(),
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
