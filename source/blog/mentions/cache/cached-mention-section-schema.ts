import { type } from "arktype";

const cachedMaybeJustStringSchema = type({
	value: "string",
	variant: type.unit("Just")
}).onDeepUndeclaredKey("delete");

const cachedMaybeNothingSchema = type({
	variant: type.unit("Nothing")
}).onDeepUndeclaredKey("delete");

export const cachedMaybeStringSchema = type.or(cachedMaybeJustStringSchema, cachedMaybeNothingSchema);

const cachedWebmentionReactionSummarySchema = type({
	bookmarkCount: "number",
	likeCount: "number",
	repostCount: "number"
}).onDeepUndeclaredKey("delete");

const cachedWebmentionAuthorSchema = type({
	name: "string",
	photoUrl: cachedMaybeStringSchema,
	websiteUrl: cachedMaybeStringSchema
}).onDeepUndeclaredKey("delete");

const cachedWebmentionReplySchema = type({
	author: cachedWebmentionAuthorSchema,
	content: cachedMaybeStringSchema,
	sourceUrl: "string",
	type: type.enumerated("mention", "reply"),
	visiblePublishedAt: cachedMaybeStringSchema
}).onDeepUndeclaredKey("delete");

export const cachedWebmentionSectionModelSchema = type({
	reactions: cachedWebmentionReactionSummarySchema,
	replies: cachedWebmentionReplySchema.array()
}).onDeepUndeclaredKey("delete");

const cachedHackerNewsMentionSchema = type({
	commentCount: "number",
	discussionUrl: "string",
	pointCount: "number",
	storyTitle: "string",
	submittedUrl: cachedMaybeStringSchema,
	visiblePublishedAt: cachedMaybeStringSchema
}).onDeepUndeclaredKey("delete");

export const cachedHackerNewsSectionModelSchema = type({
	mentions: cachedHackerNewsMentionSchema.array()
}).onDeepUndeclaredKey("delete");

export type CachedMaybeString = typeof cachedMaybeStringSchema.infer;
export type CachedWebmentionAuthor = typeof cachedWebmentionAuthorSchema.infer;
export type CachedWebmentionReply = typeof cachedWebmentionReplySchema.infer;
export type CachedHackerNewsMention = typeof cachedHackerNewsMentionSchema.infer;
