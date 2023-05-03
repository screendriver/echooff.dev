<script lang="ts">
	export let description: string;
</script>

<div class="flex flex-col justify-center items-center bg-dracula-darker rounded h-20 lg:h-28 lg:text-lg text-center">
	<p class="text-dracula-light">{description}</p>
	<slot />
</div>
