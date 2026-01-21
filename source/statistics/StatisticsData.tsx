import { Fragment, type FunctionComponent } from "react";
import { of } from "true-myth/maybe";
import { icons } from "feather-icons";
import { parse } from "valibot";
import useSWR from "swr";
import { gitHubStatisticsSchema, type GitHubStatistics } from "../github-statistics/github-statistics-schema";
import styles from "./StatisticsData.module.scss";
import { YearsInBusiness } from "./YearsInBusiness.js";
import { GitHubRepositories } from "./GitHubRepositories.js";
import { GitHubStars } from "./GitHubStars.js";
import { StatisticsFigure } from "./StatisticsFigure.js";

async function fetcher(url: string): Promise<GitHubStatistics> {
	const response = await fetch(url);
	const gitHubStatisticsResponse: unknown = await response.json();

	return parse(gitHubStatisticsSchema, gitHubStatisticsResponse);
}

const barChartIcon = icons["bar-chart"].toSvg();

export const StatisticsData: FunctionComponent = () => {
	const currentYear = import.meta.env.PROD ? new Date() : new Date(2022, 2, 23);
	const careerStartYear = 2001;
	const yearsOfExperience = currentYear.getFullYear() - careerStartYear;

	const { data: gitHubStatistics, isLoading } = useSWR<GitHubStatistics>("/api/github-statistics", {
		fetcher
	});

	return (
		<Fragment>
			<YearsInBusiness yearsOfExperience={yearsOfExperience} />

			<GitHubRepositories isFetching={isLoading} githubStatistics={of(gitHubStatistics)} />

			<GitHubStars isFetching={isLoading} githubStatistics={of(gitHubStatistics)} />

			<StatisticsFigure description="Lines of Code">
				{/* eslint-disable-next-line react/no-danger -- Safe: SVG content from feather-icons library */}
				<figure className={styles.figure} dangerouslySetInnerHTML={{ __html: barChartIcon }} />
			</StatisticsFigure>
		</Fragment>
	);
};
