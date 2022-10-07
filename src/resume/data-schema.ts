import { Result } from "true-myth";
import { z, ZodError } from "zod";

const filledStringSchema = z.string().min(1);

const resumesSchema = z
	.array(
		z
			.object({
				since: filledStringSchema,
				showOnlyYear: z.boolean(),
				industry: filledStringSchema,
				jobTitle: filledStringSchema,
				jobDescription: filledStringSchema,
				company: z
					.object({
						name: filledStringSchema,
						url: z.string().url(),
					})
					.strict(),
			})
			.strict()
	)
	.nonempty();

export type ResumesData = z.infer<typeof resumesSchema>;

function formatParseError(error: ZodError): string {
	return error.issues
		.map((issue) => {
			if (issue.path.length === 0) {
				return issue.message;
			}

			return `${issue.path.join(".")}: ${issue.message}`;
		})
		.join("\n");
}

export function parseResumeData(resumeData: unknown): Result<ResumesData, string> {
	const parseResult = resumesSchema.safeParse(resumeData);

	if (parseResult.success) {
		return Result.ok(parseResult.data);
	}

	return Result.err(formatParseError(parseResult.error));
}
