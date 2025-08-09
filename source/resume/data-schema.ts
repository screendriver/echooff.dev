import { Result } from "true-myth";
import { pipe, string, minLength, array, object, boolean, url, safeParse, summarize, type InferOutput } from "valibot";

const filledStringSchema = pipe(string(), minLength(1));

const resumesSchema = pipe(
	array(
		object({
			since: filledStringSchema,
			showOnlyYear: boolean(),
			industry: filledStringSchema,
			jobTitle: filledStringSchema,
			jobDescription: filledStringSchema,
			company: object({
				name: filledStringSchema,
				url: pipe(string(), url())
			})
		})
	),
	minLength(1)
);

export type ResumesData = InferOutput<typeof resumesSchema>;

export function parseResumeData(resumeData: unknown): Result<ResumesData, string> {
	const parseResult = safeParse(resumesSchema, resumeData);

	if (parseResult.success) {
		return Result.ok(parseResult.output);
	}

	return Result.err(summarize(parseResult.issues));
}
