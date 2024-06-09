<script setup lang="ts">
import Figure from "./Figure.vue";
import Cite from "./Cite.vue";

interface Properties {
	readonly starredRepositoriesTotalCount: number;
}

const { starredRepositoriesTotalCount } = defineProps<Properties>();
</script>

<template>
	<Figure description="GitHub Stars">
		<Cite ariaLabel="GitHub Stars">
			{{ starredRepositoriesTotalCount }}
		</Cite>
	</Figure>
</template>
