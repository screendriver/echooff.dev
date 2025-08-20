<script setup lang="ts">
type Properties = {
	readonly description: string;
};

const { description } = defineProps<Properties>();
</script>

<template>
	<cite :aria-label="description" class="text-dracula-green mt-2 text-lg font-bold not-italic">
		<slot />
	</cite>
</template>
