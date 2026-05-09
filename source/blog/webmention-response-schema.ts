import { type } from "arktype";

export const webmentionApiEntrySchema = type({
	"author?": {
		"name?": "string",
		"photo?": "string",
		"url?": "string"
	},
	"content?": "unknown",
	"published?": "string",
	"url?": "string",
	"wm-private?": "boolean",
	"wm-property?": "string",
	"wm-received?": "string"
}).onDeepUndeclaredKey("delete");

export const webmentionApiResponseSchema = type({
	"children?": webmentionApiEntrySchema.array()
}).onDeepUndeclaredKey("delete");
