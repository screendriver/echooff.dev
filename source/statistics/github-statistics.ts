import { Result } from "true-myth";
import is from "@sindresorhus/is";
import type KyInterface from "ky";
import type { GitHubStatistics } from "../github-statistics/github-statistics-schema.js";
import { gitHubStatisticsSchema } from "../github-statistics/github-statistics-schema.js";

interface FetchGitHubStatisticsDependencies {
	readonly ky: typeof KyInterface;
}

export async function fetchGitHubStatistics(
	dependencies: FetchGitHubStatisticsDependencies,
): Promise<Result<unknown, string>> {
	try {
		const { ky } = dependencies;

		const gitHubStatistics = await ky("/api/github-statistics").json();

		return Result.ok(gitHubStatistics);
	} catch (error: unknown) {
		if (is.error(error)) {
			return Result.err(error.message);
		}

		return Result.err("An unknown error occurred while fetching GitHub statistics");
	}
}

export function parseGitHubStatistics(gitHubStatistics: unknown): Result<GitHubStatistics, string> {
	const parsedGitHubStatistics = gitHubStatisticsSchema.safeParse(gitHubStatistics);

	if (parsedGitHubStatistics.success) {
		return Result.ok(parsedGitHubStatistics.data);
	}

	return Result.err(parsedGitHubStatistics.error.message);
}
