<script lang="ts">
	import type { StatisticsStoreState } from "./statistics-store";
	import Figure from "./Figure.svelte";
	import Cite from "./Cite.svelte";

	export let yearsOfExperience: StatisticsStoreState["yearsOfExperience"];
</script>

<Figure description="Experience">
	<Cite ariaLabel="Years of experience">{yearsOfExperience} yrs</Cite>
</Figure>
