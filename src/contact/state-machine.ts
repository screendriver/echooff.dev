import { createMachine, assign, StateMachine, State } from 'xstate';
import type KyInterface from 'ky';
import { ContactStateMachineContext, contactStateMachineContextSchema } from './state-machine-schema';

export type ContactMachineEvent =
    | { type: 'NAME_FOCUSED' }
    | { type: 'NAME_UNFOCUSED' }
    | { type: 'EMAIL_FOCUSED' }
    | { type: 'EMAIL_UNFOCUSED' }
    | { type: 'MESSAGE_FOCUSED' }
    | { type: 'MESSAGE_UNFOCUSED' }
    | { type: 'TYPING'; value: string }
    | { type: 'SUBMIT'; value: string };

export type ContactTypestate =
    | { value: 'idle'; context: ContactStateMachineContext }
    | { value: 'nameFocused'; context: ContactStateMachineContext }
    | { value: 'emailFocused'; context: ContactStateMachineContext }
    | { value: 'messageFocused'; context: ContactStateMachineContext }
    | { value: 'validating'; context: ContactStateMachineContext }
    | { value: 'validationFailed'; context: ContactStateMachineContext }
    | { value: 'sending'; context: ContactStateMachineContext }
    | { value: 'sendingFailed'; context: ContactStateMachineContext }
    | { value: 'sent'; context: ContactStateMachineContext };

export type ContactStateMachine = StateMachine<ContactStateMachineContext, any, ContactMachineEvent, ContactTypestate>;

export type ContactStateMachineState = State<ContactStateMachineContext, ContactMachineEvent, any, ContactTypestate>;

export function createContactStateMachine(ky: typeof KyInterface, formActionUrl: string): ContactStateMachine {
    return createMachine<ContactStateMachineContext, ContactMachineEvent, ContactTypestate>(
        {
            id: ' contact',
            initial: 'idle',
            context: {
                name: '',
                email: '',
                message: '',
            },
            on: {
                SUBMIT: 'validating',
            },
            states: {
                idle: {
                    on: {
                        NAME_FOCUSED: 'nameFocused',
                        EMAIL_FOCUSED: 'emailFocused',
                        MESSAGE_FOCUSED: 'messageFocused',
                    },
                },
                nameFocused: {
                    on: {
                        TYPING: {
                            actions: 'typing',
                        },
                        NAME_UNFOCUSED: 'idle',
                    },
                },
                emailFocused: {
                    on: {
                        TYPING: {
                            actions: 'typing',
                        },
                        EMAIL_UNFOCUSED: 'idle',
                    },
                },
                messageFocused: {
                    on: {
                        TYPING: {
                            actions: 'typing',
                        },
                        MESSAGE_UNFOCUSED: 'idle',
                    },
                },
                validating: {
                    always: [{ target: 'sending', cond: 'isContactFormValid' }, { target: 'validationFailed' }],
                },
                validationFailed: {},
                sending: {
                    invoke: {
                        src: 'postContactForm',
                        onDone: 'sent',
                        onError: 'sendingFailed',
                    },
                },
                sendingFailed: {},
                sent: {
                    type: 'final',
                },
            },
        },
        {
            actions: {
                typing: assign((_context, typingEvent, metaData) => {
                    const { state } = metaData;
                    if (state === undefined || typingEvent.type !== 'TYPING') {
                        return {};
                    }
                    if (state.matches('nameFocused')) {
                        return { name: typingEvent.value };
                    }
                    if (state.matches('emailFocused')) {
                        return { email: typingEvent.value };
                    }
                    if (state.matches('messageFocused')) {
                        return { message: typingEvent.value };
                    }
                    return {};
                }),
            },
            guards: {
                isContactFormValid(context) {
                    return contactStateMachineContextSchema.safeParse(context).success;
                },
            },
            services: {
                async postContactForm(context) {
                    const searchParams = new URLSearchParams(context);
                    searchParams.set('form-name', 'contact');
                    await ky.post(formActionUrl, {
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: searchParams,
                    });
                },
            },
        },
    );
}
