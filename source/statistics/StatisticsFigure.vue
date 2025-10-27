<script setup lang="ts">
type Properties = {
	readonly description: string;
};

const { description } = defineProps<Properties>();
</script>

<template>
	<div>
		<p>{{ description }}</p>

		<slot />
	</div>
</template>

<style lang="scss" scoped>
@use "../styles/variables";

div {
	background-color: variables.$background;
	display: flex;
	height: 5rem;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	border-radius: 0.25rem;

	@media (min-width: variables.$large-width) {
		height: 7rem;
		font-size: 1.125rem;
	}
}

p {
	color: variables.$foreground;
}
</style>
