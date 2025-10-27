<script setup lang="ts">
type Properties = {
	readonly description: string;
};

const { description } = defineProps<Properties>();
</script>

<template>
	<cite :aria-label="description">
		<slot />
	</cite>
</template>

<style lang="scss" scoped>
@use "../styles/variables";

cite {
	color: variables.$green;
	margin-top: 0.5rem;
	font-size: 1.125rem;
	font-weight: 700;
	font-style: normal;
}
</style>
