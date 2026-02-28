import { type } from "arktype";

const nonEmptyStringSchema = type("string > 0");

export const resumeDataInputSchema = type({
	since: nonEmptyStringSchema,
	showOnlyYear: "boolean",
	industry: nonEmptyStringSchema,
	jobTitle: nonEmptyStringSchema,
	jobDescription: nonEmptyStringSchema,
	company: {
		name: nonEmptyStringSchema,
		url: "string.url"
	}
})
	.onDeepUndeclaredKey("delete")
	.array()
	.atLeastLength(1);

export type ResumeDataInput = (typeof resumeDataInputSchema.infer)[number];
