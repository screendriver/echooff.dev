<script setup lang="ts">
interface Properties {
	readonly ariaLabel: string;
}

const { ariaLabel } = defineProps<Properties>();
</script>

<template>
	<cite :aria-label="ariaLabel" class="mt-2 text-lg font-bold not-italic text-dracula-green">
		<slot />
	</cite>
</template>
