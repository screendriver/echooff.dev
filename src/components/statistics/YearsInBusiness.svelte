<script lang="ts">
    import type { StatisticsStateMachineState } from "./state-machine";
    import Figure from "./Figure.svelte";
    import Cite from "./Cite.svelte";

    export let state: StatisticsStateMachineState;
</script>

{#if state.context.yearsOfExperience.isJust}
    <Figure description="Experience">
        <Cite ariaLabel="Years of experience">{state.context.yearsOfExperience.value} yrs</Cite>
    </Figure>
{/if}
