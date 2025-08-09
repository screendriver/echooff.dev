<script setup lang="ts">
import type { Maybe } from "true-myth";
import type { GitHubStatistics } from "../github-statistics/github-statistics-schema";
import StatisticsFigure from "./StatisticsFigure.vue";
import LoadingSpinner from "./LoadingSpinner.vue";
import StatisticsCite from "./StatisticsCite.vue";

interface Properties {
	readonly isFetching: boolean;
	readonly githubStatistics: Maybe<GitHubStatistics>;
}

const { isFetching, githubStatistics } = defineProps<Properties>();
</script>

<template>
	<StatisticsFigure description="GitHub Stars">
		<LoadingSpinner v-if="isFetching" />

		<StatisticsCite v-if="!isFetching" description="GitHub Stars">
			{{ githubStatistics.get("user").get("starredRepositories").get("totalCount").unwrapOr(0) }}
		</StatisticsCite>
	</StatisticsFigure>
</template>
