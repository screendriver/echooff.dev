<script setup lang="ts">
import type { Maybe } from "true-myth";
import type { GitHubStatistics } from "../github-statistics/github-statistics-schema";
import StatisticsFigure from "./StatisticsFigure.vue";
import LoadingSpinner from "./LoadingSpinner.vue";
import StatisticsCite from "./StatisticsCite.vue";

type Properties = {
	readonly isFetching: boolean;
	readonly githubStatistics: Maybe<GitHubStatistics>;
};

const { isFetching, githubStatistics } = defineProps<Properties>();
</script>

<template>
	<StatisticsFigure description="GitHub Repos">
		<LoadingSpinner v-if="isFetching" />

		<StatisticsCite v-if="!isFetching" description="GitHub Repos">
			{{ githubStatistics.get("user").get("repositories").get("totalCount").unwrapOr(0) }}
		</StatisticsCite>
	</StatisticsFigure>
</template>
