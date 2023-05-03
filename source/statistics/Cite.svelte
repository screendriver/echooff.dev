<script lang="ts">
	export let ariaLabel: string;
</script>

<cite aria-label={ariaLabel} class="text-lg text-dracula-green font-bold not-italic mt-2">
	<slot />
</cite>
