<script lang="ts">
	import { icons } from "feather-icons";
	import Figure from "./Figure.svelte";
	import Cite from "./Cite.svelte";
	import LoadingSpinner from "./LoadingSpinner.svelte";
	import type { StatisticsStoreState } from "./statistics-store";

	export let fetchGitHubStatisticsState: StatisticsStoreState["fetchGitHubStatisticsState"];
	export let gitHubStatistics: StatisticsStoreState["gitHubStatistics"];
</script>

<Figure description="GitHub Repos">
	<Cite ariaLabel="GitHub Repos">
		{#if fetchGitHubStatisticsState === "idle" || fetchGitHubStatisticsState === "loading"}
			<LoadingSpinner />
		{:else if fetchGitHubStatisticsState === "error"}
			<figure>
				{@html icons["alert-triangle"]?.toSvg()}
			</figure>
		{:else if fetchGitHubStatisticsState === "loaded" && gitHubStatistics.isJust}
			{gitHubStatistics.value.user.repositories.totalCount}
		{/if}
	</Cite>
</Figure>
