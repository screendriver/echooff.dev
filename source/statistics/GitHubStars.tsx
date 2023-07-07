import type { FunctionComponent, ReactNode } from "react";
import { icons } from "feather-icons";
import type { StatisticsStoreState } from "./statistics-store";
import { Figure } from "./Figure";
import { Cite } from "./Cite";
import { LoadingSpinner } from "./LoadingSpinner";

interface GitHubStarsProperties {
	readonly fetchGitHubStatisticsState: StatisticsStoreState["fetchGitHubStatisticsState"];
	readonly gitHubStatistics: StatisticsStoreState["gitHubStatistics"];
}

function renderTotalCount(properties: GitHubStarsProperties): ReactNode {
	const { fetchGitHubStatisticsState, gitHubStatistics } = properties;

	if (fetchGitHubStatisticsState === "loading") {
		return <LoadingSpinner />;
	}

	if (fetchGitHubStatisticsState === "error") {
		return <figure dangerouslySetInnerHTML={{ __html: icons["alert-triangle"]?.toSvg() }} />;
	}

	if (fetchGitHubStatisticsState === "loaded" && gitHubStatistics.isJust) {
		return gitHubStatistics.value.user.starredRepositories.totalCount;
	}

	return null;
}

export const GitHubStars: FunctionComponent<GitHubStarsProperties> = (properties) => {
	return (
		<Figure description="GitHub Stars">
			<Cite ariaLabel="GitHub Stars">{renderTotalCount(properties)}</Cite>
		</Figure>
	);
};
