<script lang="ts">
    import { onMount } from "svelte";
    import ky from "ky";
    import { useMachine } from "@xstate/svelte";
    import { icons } from "feather-icons";
    import { createStatisticsStateMachine } from "./state-machine";
    import { createErrorReporter } from "../error-reporter/reporter";
    import YearsInBusiness from "./YearsInBusiness.svelte";
    import GitHubRepositories from "./GitHubRepositories.svelte";
    import GitHubStars from "./GitHubStars.svelte";
    import Figure from "./Figure.svelte";

    const errorReporter = createErrorReporter();
    const currentTimestamp = import.meta.env.PROD ? new Date() : new Date(2022, 2, 23);
    const gitHubStateMachine = createStatisticsStateMachine({ ky, currentTimestamp, errorReporter });

    const { state, send } = useMachine(gitHubStateMachine);

    onMount(() => {
        send("FETCH");
    });
</script>

<YearsInBusiness state={$state} />
<GitHubRepositories state={$state} />
<GitHubStars state={$state} />
<Figure description="Lines of Code">
    {@html icons["bar-chart"]?.toSvg({ class: "text-dracula-green w-6 h-6 mt-2" })}
</Figure>
