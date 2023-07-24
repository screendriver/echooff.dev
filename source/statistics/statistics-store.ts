import { writable, Writable } from "svelte/store";
import { Maybe } from "true-myth";
import type { GitHubStatistics } from "../github-statistics/github-statistics-schema";
import type { ErrorReporter } from "../error-reporter/reporter";
import { createErrorReporter } from "../error-reporter/reporter";

interface StatisticsStoreDependencies {
	readonly errorReporter: ErrorReporter;
	readonly currentTimestamp: Date;
}

export interface StatisticsStoreState {
	readonly fetchGitHubStatisticsState: "idle" | "loading" | "loaded" | "error";
	readonly gitHubStatistics: Maybe<GitHubStatistics>;
	readonly yearsOfExperience: number;
}

function createStatisticsStore(dependencies: StatisticsStoreDependencies): Writable<StatisticsStoreState> {
	const currentYear = dependencies.currentTimestamp.getFullYear();
	const careerStartYear = 2001;
	const yearsOfExperience = currentYear - careerStartYear;

	return writable<StatisticsStoreState>({
		fetchGitHubStatisticsState: "idle",
		gitHubStatistics: Maybe.nothing(),
		yearsOfExperience,
	});
}

export const statisticsStore = createStatisticsStore({
	currentTimestamp: import.meta.env.PROD ? new Date() : new Date(2022, 2, 23),
	errorReporter: createErrorReporter(),
});
