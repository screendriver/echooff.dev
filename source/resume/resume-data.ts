import { Result } from "true-myth";
import { type } from "arktype";
import { resumeDataInputSchema, type ResumeDataInput } from "./resume-data-input-schema.js";

type ResumeCompany = {
	readonly name: string;
	readonly url: URL;
};

type ResumeData = {
	readonly since: ResumeDataInput["since"];
	readonly showOnlyYear: ResumeDataInput["showOnlyYear"];
	readonly industry: ResumeDataInput["industry"];
	readonly jobTitle: ResumeDataInput["jobTitle"];
	readonly jobDescription: ResumeDataInput["jobDescription"];
	readonly company: ResumeCompany;
};

export type ResumesData = ResumeData[];

function parseResumeEntry(resumeDataInput: ResumeDataInput): ResumeData {
	return {
		...resumeDataInput,
		company: {
			...resumeDataInput.company,
			url: new URL(resumeDataInput.company.url)
		}
	};
}

export function parseResumeData(resumeData: unknown): Result<ResumesData, string> {
	const parseResult = resumeDataInputSchema(resumeData);

	if (parseResult instanceof type.errors) {
		return Result.err(parseResult.summary);
	}

	return Result.ok(parseResult.map(parseResumeEntry));
}
