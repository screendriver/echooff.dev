<script lang="ts">
	import { onMount } from "svelte";
	import ky from "ky";
	import { Maybe } from "true-myth";
	import { icons } from "feather-icons";
	import { fetchGitHubStatistics, parseGitHubStatistics } from "./github-statistics";
	import { statisticsStore } from "./statistics-store";
	import YearsInBusiness from "./YearsInBusiness.svelte";
	import GitHubRepositories from "./GitHubRepositories.svelte";
	import GitHubStars from "./GitHubStars.svelte";
	import Figure from "./Figure.svelte";

	onMount(async () => {
		statisticsStore.update((state) => {
			return { ...state, fetchGitHubStatisticsState: "loading" };
		});

		const gitHubStatisticsResult = await fetchGitHubStatistics({ ky });
		const parsedGitHubStatisticsResult = gitHubStatisticsResult.andThen((gitHubStatistics) => {
			return parseGitHubStatistics(gitHubStatistics);
		});

		if (parsedGitHubStatisticsResult.isOk) {
			statisticsStore.update((state) => {
				return {
					...state,
					fetchGitHubStatisticsState: "loaded",
					gitHubStatistics: Maybe.just(parsedGitHubStatisticsResult.value),
				};
			});

			if (typeof umami !== "undefined") {
				umami.track("fetch-github-statistics");
			}
		}
	});
</script>

<YearsInBusiness yearsOfExperience={$statisticsStore.yearsOfExperience} />
<GitHubRepositories
	fetchGitHubStatisticsState={$statisticsStore.fetchGitHubStatisticsState}
	gitHubStatistics={$statisticsStore.gitHubStatistics}
/>
<GitHubStars
	fetchGitHubStatisticsState={$statisticsStore.fetchGitHubStatisticsState}
	gitHubStatistics={$statisticsStore.gitHubStatistics}
/>
<Figure description="Lines of Code">
	<figure>
		{@html icons["bar-chart"]?.toSvg({ class: "text-dracula-green w-6 h-6 mt-2" })}
	</figure>
</Figure>
