<script setup lang="ts">
import { computed } from "vue";
import { useFetch } from "@vueuse/core";
import { icons } from "feather-icons";
import { type Maybe, just, nothing } from "true-myth/maybe";
import { parse } from "valibot";
import { gitHubStatisticsSchema, type GitHubStatistics } from "../github-statistics/github-statistics-schema";
import YearsInBusiness from "./YearsInBusiness.vue";
import GitHubRepositories from "./GitHubRepositories.vue";
import GitHubStars from "./GitHubStars.vue";
import StatisticsFigure from "./StatisticsFigure.vue";

// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- fine here
const currentYear = import.meta.env.PROD ? new Date() : new Date(2022, 2, 23);
const careerStartYear = 2001;
const yearsOfExperience = currentYear.getFullYear() - careerStartYear;

const { isFinished, isFetching, data: gitHubStatisticsResponse } = useFetch("/api/github-statistics").get().json();

const gitHubStatistics = computed<Maybe<GitHubStatistics>>(() => {
	if (isFinished.value) {
		return just(parse(gitHubStatisticsSchema, gitHubStatisticsResponse.value));
	}

	return nothing();
});

const barChartIcon = icons["bar-chart"].toSvg({ class: "text-dracula-green w-6 h-6 mt-2" });
</script>

<template>
	<YearsInBusiness :years-of-experience="yearsOfExperience" />

	<GitHubRepositories :is-fetching="isFetching" :github-statistics="gitHubStatistics" />

	<GitHubStars :is-fetching="isFetching" :github-statistics="gitHubStatistics" />

	<StatisticsFigure description="Lines of Code">
		<figure v-html="barChartIcon" />
	</StatisticsFigure>
</template>
