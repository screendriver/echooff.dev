<script setup lang="ts">
interface Properties {
	readonly description: string;
}

const { description } = defineProps<Properties>();
</script>

<template>
	<cite :aria-label="description" class="mt-2 text-lg font-bold not-italic text-dracula-green">
		<slot />
	</cite>
</template>
