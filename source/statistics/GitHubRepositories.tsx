import type { FunctionComponent } from "react";
import type { Maybe } from "true-myth";
import type { GitHubStatistics } from "../github-statistics/github-statistics-schema";
import { StatisticsFigure } from "./StatisticsFigure.js";
import { LoadingSpinner } from "./LoadingSpinner.js";
import { StatisticsCite } from "./StatisticsCite.js";

type Properties = {
	readonly isFetching: boolean;
	readonly githubStatistics: Maybe<GitHubStatistics>;
};

export const GitHubRepositories: FunctionComponent<Properties> = (properties) => {
	const { isFetching, githubStatistics } = properties;

	return (
		<StatisticsFigure description="GitHub Repos">
			{isFetching ? <LoadingSpinner /> : null}

			{!isFetching && (
				<StatisticsCite description="GitHub Repos">
					{githubStatistics.get("user").get("repositories").get("totalCount").unwrapOr(0)}
				</StatisticsCite>
			)}
		</StatisticsFigure>
	);
};
