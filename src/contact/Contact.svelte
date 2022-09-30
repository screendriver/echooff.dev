<script lang="ts">
    import ky from "ky";
    import { useMachine } from "@xstate/svelte";
    import * as Sentry from "@sentry/browser";
    import { createContactStateMachine } from "./state-machine";
    import { createErrorReporter } from "../error-reporter/reporter";

    const errorReporter = createErrorReporter({ sentry: Sentry });
    const contactFormActionUrl = import.meta.env.PUBLIC_CONTACT_FORM_URL ?? "";
    const contactStateMachine = createContactStateMachine({ ky, formActionUrl: contactFormActionUrl, errorReporter });

    const { state, send } = useMachine(contactStateMachine);
</script>

{#if $state.matches("sendingFailed")}
    <h2 class="col-span-2 text-2xl text-dracula-red">Sending failed</h2>
{:else if $state.matches("sent")}
    <h2 aria-label="Thank you" class="col-span-2 text-2xl text-dracula-green">Thank you</h2>
{:else}
    <h3 class="col-span-2">Leave me a message</h3>
    <form
        method="POST"
        name="contact"
        on:submit|preventDefault={() => {
            send("SUBMIT");
        }}
        class="col-span-2 flex flex-col gap-3 w-11/12 sm:w-10/12 md:w-2/3"
    >
        <input type="hidden" name="form-name" value="contact" />
        <label for="name" class="hidden">Name</label>
        <input
            type="text"
            name="name"
            placeholder="Name"
            required={true}
            value={$state.context.name}
            on:focus={() => {
                send("NAME_FOCUSED");
            }}
            on:change={(changeEvent) => {
                send({ type: "TYPING", value: changeEvent.currentTarget.value });
            }}
            on:blur={() => {
                send("NAME_UNFOCUSED");
            }}
            class="text-dracula-darker rounded indent-1 shadow-sm border focus:border-dracula-purple focus:outline-none"
        />
        <label for="email" class="hidden">Email</label>
        <input
            type="email"
            name="email"
            placeholder="Email"
            required={true}
            value={$state.context.email}
            on:focus={() => {
                send("EMAIL_FOCUSED");
            }}
            on:change={(changeEvent) => {
                send({ type: "TYPING", value: changeEvent.currentTarget.value });
            }}
            on:blur={() => {
                send("EMAIL_UNFOCUSED");
            }}
            class="text-dracula-darker rounded indent-1 shadow-sm border focus:border-dracula-purple focus:outline-none"
        />
        <label for="message" class="hidden">Message</label>
        <textarea
            name="message"
            placeholder="Message"
            rows={4}
            required={true}
            value={$state.context.message}
            on:focus={() => {
                send("MESSAGE_FOCUSED");
            }}
            on:change={(changeEvent) => {
                send({ type: "TYPING", value: changeEvent.currentTarget.value });
            }}
            on:blur={() => {
                send("MESSAGE_FOCUSED");
            }}
            class="text-dracula-darker rounded indent-1 shadow-sm border focus:border-dracula-purple focus:outline-none"
        />
        <input
            type="submit"
            value="Send Message"
            class="cursor-pointer py-1 self-center w-44 border rounded-md transition border-dracula-darker bg-dracula-blue hover:bg-dracula-dark"
        />
    </form>
{/if}
