import { object, number, minValue, pipe, type InferOutput } from "valibot";

export const gitHubStatisticsSchema = object({
	user: object({
		repositories: object({
			totalCount: pipe(number(), minValue(0))
		}),
		starredRepositories: object({
			totalCount: pipe(number(), minValue(0))
		})
	})
});

export type GitHubStatistics = InferOutput<typeof gitHubStatisticsSchema>;
