import { StoreApi, createStore } from "zustand";
import { Maybe } from "true-myth";
import type KyInterface from "ky";
import { GitHubStatistics, gitHubStatisticsSchema } from "../github-statistics/github-statistics-schema";
import type { ErrorReporter } from "../error-reporter/reporter";

interface StatisticsStoreDependencies {
	readonly ky: typeof KyInterface;
	readonly errorReporter: ErrorReporter;
	readonly currentTimestamp: Date;
}

export interface StatisticsStoreState {
	readonly fetchGitHubStatisticsState: "idle" | "loading" | "loaded" | "error";
	readonly gitHubStatistics: Maybe<GitHubStatistics>;
	readonly yearsOfExperience: number;
}

export interface StatisticsStoreActions {
	fetchGitHubStatistics(): Promise<void>;
}

export type StatisticsStore = ReturnType<typeof createStatisticsStore>;

export function createStatisticsStore(
	dependencies: StatisticsStoreDependencies,
): StoreApi<StatisticsStoreState & StatisticsStoreActions> {
	const currentYear = dependencies.currentTimestamp.getFullYear();
	const careerStartYear = 2001;
	const yearsOfExperience = currentYear - careerStartYear;

	return createStore<StatisticsStoreState & StatisticsStoreActions>()((set) => {
		return {
			fetchGitHubStatisticsState: "idle",
			gitHubStatistics: Maybe.nothing(),
			yearsOfExperience,
			async fetchGitHubStatistics() {
				set({ fetchGitHubStatisticsState: "loading" });

				try {
					const gitHubStatistics = await dependencies.ky("/api/github-statistics").json();
					const parsedGitHubStatistics = gitHubStatisticsSchema.parse(gitHubStatistics);

					set({
						fetchGitHubStatisticsState: "loaded",
						gitHubStatistics: Maybe.just(parsedGitHubStatistics),
					});
				} catch (error: unknown) {
					set({ fetchGitHubStatisticsState: "error" });

					dependencies.errorReporter.send(error);
				}
			},
		};
	});
}
