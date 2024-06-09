<script setup lang="ts">
import { ref, watch } from "vue";
import { useFetch } from "@vueuse/core";
import { isPlainObject } from "@sindresorhus/is";
import { icons } from "feather-icons";
import YearsInBusiness from "./YearsInBusiness.vue";
import GitHubRepositories from "./GitHubRepositories.vue";
import GitHubStars from "./GitHubStars.vue";
import Figure from "./Figure.vue";
import { gitHubStatisticsSchema, type GitHubStatistics } from "../github-statistics/github-statistics-schema";

const currentYear = import.meta.env.PROD ? new Date() : new Date(2022, 2, 23);
const careerStartYear = 2001;
const yearsOfExperience = currentYear.getFullYear() - careerStartYear;

const { isFinished, data: gitHubStatisticsResponse } = useFetch("/api/github-statistics").get().json();

const gitHubStatistics = ref<GitHubStatistics>();

watch(isFinished, () => {
	if (isFinished.value) {
		gitHubStatistics.value = gitHubStatisticsSchema.parse(gitHubStatisticsResponse.value);
	}
});

const barChartIcon = icons["bar-chart"].toSvg({ class: "text-dracula-green w-6 h-6 mt-2" });
</script>

<template>
	<YearsInBusiness :years-of-experience="yearsOfExperience" />
	<GitHubRepositories
		v-if="isPlainObject(gitHubStatistics)"
		:repositories-total-count="gitHubStatistics.user.repositories.totalCount"
	/>
	<GitHubStars
		v-if="isPlainObject(gitHubStatistics)"
		:starred-repositories-total-count="gitHubStatistics.user.starredRepositories.totalCount"
	/>
	<Figure description="Lines of Code">
		<figure v-html="barChartIcon" />
	</Figure>
</template>
