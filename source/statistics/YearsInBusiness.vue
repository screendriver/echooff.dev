<script setup lang="ts">
import StatisticsFigure from "./StatisticsFigure.vue";
import StatisticsCite from "./StatisticsCite.vue";

interface Properties {
	readonly yearsOfExperience: number;
}

const { yearsOfExperience } = defineProps<Properties>();
</script>

<template>
	<StatisticsFigure description="Experience">
		<StatisticsCite description="Years of experience">{{ yearsOfExperience }} yrs</StatisticsCite>
	</StatisticsFigure>
</template>
