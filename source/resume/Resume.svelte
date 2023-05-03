<script lang="ts">
	import type { ResumesData } from "./data-schema";
	import { formatSinceDate } from "./date";

	export let resume: ResumesData;

	const filteredResume = resume.filter((job) => {
		const sinceDateFormatted = formatSinceDate(job.since, job.showOnlyYear);
		return sinceDateFormatted.isOk;
	});
</script>

{#each filteredResume as job}
	{@const sinceDateFormatted = formatSinceDate(job.since, job.showOnlyYear)}
	{#if sinceDateFormatted.isOk}
		<li
			class="group relative pl-10 md:grid md:grid-cols-[0.5fr_auto_1fr] md:gap-x-7 md:justify-between md:justify-items-start md:pl-0"
		>
			<p class="uppercase text-xs mb-1 tracking-widest text-dracula-green md:justify-self-end">
				{sinceDateFormatted.value}
			</p>
			<div
				class="absolute top-1 left-0 bottom-0 before:block before:bg-dracula-orange before:group-hover:bg-transparent before:border-3 before:border-solid before:border-dracula-orange before:rounded-full before:w-4 before:h-4 before:transition-colors before:duration-300 before:ease-in-out after:block after:bg-dracula-blue after:w-1 after:absolute after:top-6 after:bottom-1 md:after:bottom-2 after:left-1.5 md:relative after:group-last:hidden"
			/>
			<div class="pb-10">
				<h3 class="text-lg leading-none">{job.jobTitle}</h3>
				<h4 class="text-dracula-green">
					<a href={job.company.url} class="transition-colors hover:text-dracula-purple">
						{job.company.name}
					</a>
					<span class="text-dracula-blue"> ({job.industry})</span>
				</h4>
				<p class="text-sm">{job.jobDescription}</p>
			</div>
		</li>
	{/if}
{/each}
