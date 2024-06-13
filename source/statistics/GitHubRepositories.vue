<script setup lang="ts">
import type { Maybe } from "true-myth";
import type { GitHubStatistics } from "../github-statistics/github-statistics-schema";
import Figure from "./Figure.vue";
import LoadingSpinner from "./LoadingSpinner.vue";
import Cite from "./Cite.vue";

interface Properties {
	readonly isFetching: boolean;
	readonly gitHubStatistics: Maybe<GitHubStatistics>;
}

const { isFetching, gitHubStatistics } = defineProps<Properties>();
</script>

<template>
	<Figure description="GitHub Repos">
		<LoadingSpinner v-if="isFetching" />
		<Cite v-if="!isFetching" aria-label="GitHub Repos">
			{{ gitHubStatistics.get("user").get("repositories").get("totalCount").unwrapOr(0) }}
		</Cite>
	</Figure>
</template>
