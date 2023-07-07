import type { FunctionComponent } from "react";
import { Fragment, useEffect } from "react";
import { icons } from "feather-icons";
import { useStore } from "zustand";
import ky from "ky";
import { createErrorReporter } from "../error-reporter/reporter";
import { createStatisticsStore } from "./statistics-store";
import { Figure } from "./Figure";
import { YearsInBusiness } from "./YearsInBusiness";
import { GitHubRepositories } from "./GitHubRepositories";
import { GitHubStars } from "./GitHubStars";

const statisticsStore = createStatisticsStore({
	ky,
	currentTimestamp: import.meta.env.PROD ? new Date() : new Date(2022, 2, 23),
	errorReporter: createErrorReporter(),
});

export const Statistics: FunctionComponent = () => {
	const [fetchGitHubStatistics, fetchGitHubStatisticsState, yearsOfExperience, gitHubStatistics] = useStore(
		statisticsStore,
		(state) => {
			return [
				state.fetchGitHubStatistics,
				state.fetchGitHubStatisticsState,
				state.yearsOfExperience,
				state.gitHubStatistics,
			];
		},
	);

	useEffect(() => {
		void fetchGitHubStatistics();
	}, []);

	return (
		<Fragment>
			<YearsInBusiness yearsOfExperience={yearsOfExperience} />
			<GitHubRepositories
				fetchGitHubStatisticsState={fetchGitHubStatisticsState}
				gitHubStatistics={gitHubStatistics}
			/>
			<GitHubStars fetchGitHubStatisticsState={fetchGitHubStatisticsState} gitHubStatistics={gitHubStatistics} />
			<Figure description="Lines of Code">
				<figure
					dangerouslySetInnerHTML={{
						__html: icons["bar-chart"]?.toSvg({ class: "text-dracula-green w-6 h-6 mt-2" }),
					}}
				/>
			</Figure>
		</Fragment>
	);
};
