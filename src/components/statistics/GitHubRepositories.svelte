<script lang="ts">
    import { icons } from 'feather-icons';
    import Cite from './Cite.svelte';
    import Figure from './Figure.svelte';
    import LoadingSpinner from './LoadingSpinner.svelte';
    import type { StatisticsStateMachineState } from './state-machine';

    export let state: StatisticsStateMachineState;
</script>

<Figure description="GitHub Repos">
    <Cite ariaLabel="GitHub Repos">
        {#if state.matches('loaded')}
            {state.context.gitHubStatistics.value.user.repositories.totalCount}
        {:else if state.matches('failed')}
            {@html icons['alert-triangle']?.toSvg()}
        {:else}
            <LoadingSpinner />
        {/if}
    </Cite>
</Figure>
