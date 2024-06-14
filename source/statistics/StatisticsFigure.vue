<script setup lang="ts">
interface Properties {
	readonly description: string;
}

const { description } = defineProps<Properties>();
</script>

<template>
	<div class="flex h-20 flex-col items-center justify-center rounded bg-dracula-darker lg:h-28 lg:text-lg">
		<p class="text-dracula-light">{{ description }}</p>

		<slot />
	</div>
</template>
