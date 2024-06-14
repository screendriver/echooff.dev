<script setup lang="ts">
import Figure from "./Figure.vue";
import Cite from "./Cite.vue";

interface Properties {
	readonly yearsOfExperience: number;
}

const { yearsOfExperience } = defineProps<Properties>();
</script>

<template>
	<Figure description="Experience">
		<Cite ariaLabel="Years of experience">{{ yearsOfExperience }} yrs</Cite>
	</Figure>
</template>
