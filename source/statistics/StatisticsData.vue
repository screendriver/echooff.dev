<script setup lang="ts">
import { computed } from "vue";
import { useFetch } from "@vueuse/core";
import { icons } from "feather-icons";
import { Maybe } from "true-myth";
import YearsInBusiness from "./YearsInBusiness.vue";
import GitHubRepositories from "./GitHubRepositories.vue";
import GitHubStars from "./GitHubStars.vue";
import Figure from "./Figure.vue";
import { gitHubStatisticsSchema, type GitHubStatistics } from "../github-statistics/github-statistics-schema";

const currentYear = import.meta.env.PROD ? new Date() : new Date(2022, 2, 23);
const careerStartYear = 2001;
const yearsOfExperience = currentYear.getFullYear() - careerStartYear;

const { isFinished, isFetching, data: gitHubStatisticsResponse } = useFetch("/api/github-statistics").get().json();

const gitHubStatistics = computed<Maybe<GitHubStatistics>>(() => {
	if (isFinished.value) {
		return Maybe.just(gitHubStatisticsSchema.parse(gitHubStatisticsResponse.value));
	}

	return Maybe.nothing();
});

const barChartIcon = icons["bar-chart"].toSvg({ class: "text-dracula-green w-6 h-6 mt-2" });
</script>

<template>
	<YearsInBusiness :years-of-experience="yearsOfExperience" />
	<GitHubRepositories :is-fetching="isFetching" :gitHubStatistics="gitHubStatistics" />
	<GitHubStars :is-fetching="isFetching" :gitHubStatistics="gitHubStatistics" />
	<Figure description="Lines of Code">
		<figure v-html="barChartIcon" />
	</Figure>
</template>
