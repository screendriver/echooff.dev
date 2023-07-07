import type { FunctionComponent, ReactNode } from "react";
import { icons } from "feather-icons";
import type { StatisticsStoreState } from "./statistics-store";
import { Cite } from "./Cite";
import { Figure } from "./Figure";
import { LoadingSpinner } from "./LoadingSpinner";

interface GitHubRepositoriesProperties {
	readonly fetchGitHubStatisticsState: StatisticsStoreState["fetchGitHubStatisticsState"];
	readonly gitHubStatistics: StatisticsStoreState["gitHubStatistics"];
}

function renderTotalCount(properties: GitHubRepositoriesProperties): ReactNode {
	const { fetchGitHubStatisticsState, gitHubStatistics } = properties;

	if (fetchGitHubStatisticsState === "idle" || fetchGitHubStatisticsState === "loading") {
		return <LoadingSpinner />;
	}

	if (fetchGitHubStatisticsState === "error") {
		return <figure dangerouslySetInnerHTML={{ __html: icons["alert-triangle"]?.toSvg() }} />;
	}

	if (fetchGitHubStatisticsState === "loaded" && gitHubStatistics.isJust) {
		return gitHubStatistics.value.user.repositories.totalCount;
	}

	return null;
}

export const GitHubRepositories: FunctionComponent<GitHubRepositoriesProperties> = (properties) => {
	return (
		<Figure description="GitHub Repos">
			<Cite ariaLabel="GitHub Repos">{renderTotalCount(properties)}</Cite>
		</Figure>
	);
};
