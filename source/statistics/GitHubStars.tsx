import type { FunctionComponent, ReactNode } from "react";
import type { Maybe } from "true-myth";
import type { GitHubStatistics } from "../github-statistics/github-statistics-schema";
import { StatisticsFigure } from "./StatisticsFigure.js";
import { LoadingSpinner } from "./LoadingSpinner.js";
import { StatisticsCite } from "./StatisticsCite.js";

type Properties = {
	readonly isFetching: boolean;
	readonly githubStatistics: Maybe<GitHubStatistics>;
};

function renderLoadingSpinner(isFetching: boolean): ReactNode {
	if (isFetching) {
		return <LoadingSpinner />;
	}

	return null;
}

function renderStatisticsCite(isFetching: boolean, githubStatistics: Maybe<GitHubStatistics>): ReactNode {
	if (isFetching) {
		return null;
	}

	return (
		<StatisticsCite description="GitHub Stars">
			{githubStatistics.get("user").get("starredRepositories").get("totalCount").unwrapOr(0)}
		</StatisticsCite>
	);
}

export const GitHubStars: FunctionComponent<Properties> = (properties) => {
	const { isFetching, githubStatistics } = properties;

	return (
		<StatisticsFigure description="GitHub Stars">
			{renderLoadingSpinner(isFetching)}

			{renderStatisticsCite(isFetching, githubStatistics)}
		</StatisticsFigure>
	);
};
