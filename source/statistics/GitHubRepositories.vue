<script setup lang="ts">
import Figure from "./Figure.vue";
import Cite from "./Cite.vue";

interface Properties {
	readonly repositoriesTotalCount: number;
}

const { repositoriesTotalCount } = defineProps<Properties>();
</script>

<template>
	<Figure description="GitHub Repos">
		<Cite aria-label="GitHub Repos">
			{{ repositoriesTotalCount }}
		</Cite>
	</Figure>
</template>
