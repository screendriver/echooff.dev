<script lang="ts">
	import { onMount } from "svelte";
	import { icons } from "feather-icons";
	import { statisticsStore } from "./statistics-store";
	import YearsInBusiness from "./YearsInBusiness.svelte";
	import GitHubRepositories from "./GitHubRepositories.svelte";
	import GitHubStars from "./GitHubStars.svelte";
	import Figure from "./Figure.svelte";

	onMount(() => {
		void statisticsStore.fetchGitHubStatistics();

		if (typeof umami !== "undefined") {
			umami.track("fetch-github-statistics");
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
