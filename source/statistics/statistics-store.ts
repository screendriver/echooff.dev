import { writable, Readable } from "svelte/store";
import { Maybe } from "true-myth";
import type KyInterface from "ky";
import ky from "ky";
import { GitHubStatistics, gitHubStatisticsSchema } from "../github-statistics/github-statistics-schema";
import type { ErrorReporter } from "../error-reporter/reporter";
import { createErrorReporter } from "../error-reporter/reporter";

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

export interface StatisticsStore extends Readable<StatisticsStoreState> {
	fetchGitHubStatistics(): Promise<void>;
}

function createStatisticsStore(dependencies: StatisticsStoreDependencies): StatisticsStore {
	const currentYear = dependencies.currentTimestamp.getFullYear();
	const careerStartYear = 2001;
	const yearsOfExperience = currentYear - careerStartYear;

	const { subscribe, update } = writable<StatisticsStoreState>({
		fetchGitHubStatisticsState: "idle",
		gitHubStatistics: Maybe.nothing(),
		yearsOfExperience,
	});

	return {
		subscribe,
		async fetchGitHubStatistics() {
			update((state) => {
				return { ...state, fetchGitHubStatisticsState: "loading" };
			});

			try {
				const gitHubStatistics = await dependencies.ky("/api/github-statistics").json();
				const parsedGitHubStatistics = gitHubStatisticsSchema.parse(gitHubStatistics);

				update((state) => {
					return {
						...state,
						fetchGitHubStatisticsState: "loaded",
						gitHubStatistics: Maybe.just(parsedGitHubStatistics),
					};
				});
			} catch (error: unknown) {
				update((state) => {
					return { ...state, fetchGitHubStatisticsState: "error" };
				});

				dependencies.errorReporter.send(error);
			}
		},
	};
}

export const statisticsStore = createStatisticsStore({
	ky,
	currentTimestamp: import.meta.env.PROD ? new Date() : new Date(2022, 2, 23),
	errorReporter: createErrorReporter(),
});
