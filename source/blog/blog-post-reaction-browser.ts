import { isHtmlElement, isNonEmptyString } from "@sindresorhus/is";
import { just, nothing, type Maybe } from "true-myth/maybe";
import type { BlogPostReactionView } from "./blog-reaction-interaction.ts";

export type BlogPostReactionBrowserElements = {
	readonly postSlug: string;
	readonly view: BlogPostReactionView;
};

export function readBlogPostReactionBrowserElements(
	reactionRootElement: HTMLElement
): Maybe<BlogPostReactionBrowserElements> {
	const reactionButtonElement = reactionRootElement.querySelector("[data-blog-post-reaction-button]");
	const reactionCountElement = reactionRootElement.querySelector("[data-blog-post-reaction-count]");
	const reactionStatusElement = reactionRootElement.querySelector("[data-blog-post-reaction-status]");
	const { postSlug } = reactionRootElement.dataset;

	if (
		!(reactionButtonElement instanceof HTMLButtonElement) ||
		!isHtmlElement(reactionCountElement) ||
		!isHtmlElement(reactionStatusElement) ||
		!isNonEmptyString(postSlug)
	) {
		return nothing();
	}

	return just({
		postSlug,
		view: {
			registerActivationListener(listener) {
				reactionButtonElement.addEventListener("click", listener);
			},
			setButtonDisabled(disabled) {
				reactionButtonElement.disabled = disabled;
			},
			writeAriaPressed(reacted) {
				reactionButtonElement.setAttribute("aria-pressed", reacted ? "true" : "false");
			},
			writeReactionCountLabel(label) {
				reactionCountElement.textContent = label;
			},
			writeStatus(reactionStatus) {
				reactionStatusElement.textContent = reactionStatus;
			}
		}
	});
}
