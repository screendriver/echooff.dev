import { type } from "arktype";

export const hackerNewsApiHitSchema = type({
	"created_at?": "string",
	"num_comments?": "number",
	"objectID?": "string",
	"points?": "number",
	"story_title?": "string",
	"title?": "string",
	"url?": "string"
}).onDeepUndeclaredKey("delete");

export const hackerNewsApiResponseSchema = type({
	"hits?": hackerNewsApiHitSchema.array()
}).onDeepUndeclaredKey("delete");
