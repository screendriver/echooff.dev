export const blogReactionAddedEventName = "blog_reaction_added";
export const blogReactionRemovedEventName = "blog_reaction_removed";

export type BlogReactionAnalytics = {
	readonly trackReactionAdded: (postSlug: string) => void;
	readonly trackReactionRemoved: (postSlug: string) => void;
};
