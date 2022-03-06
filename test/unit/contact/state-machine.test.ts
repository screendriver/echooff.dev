import test from 'ava';
import { fake } from 'sinon';
import { interpret, Interpreter, MachineOptions } from 'xstate';
import type KyInterface from 'ky';
import { setImmediate } from 'timers/promises';
import { createContactStateMachine, ContactMachineEvent, ContactTypestate } from '../../../src/contact/state-machine';
import { ContactStateMachineContext } from '../../../src/contact/state-machine-schema';

interface Overrides {
    readonly ky?: typeof KyInterface;
    readonly config?: Partial<MachineOptions<ContactStateMachineContext, ContactMachineEvent>>;
}

function createContactStateService(
    overrides: Overrides = {},
): Interpreter<ContactStateMachineContext, any, ContactMachineEvent, ContactTypestate> {
    const ky = {
        post: fake.resolves(undefined),
    } as unknown as typeof KyInterface;
    const formActionUrl = '/contact-form';
    const contactStateMachine = createContactStateMachine(overrides.ky ?? ky, formActionUrl).withConfig(
        overrides.config ?? {},
    );
    return interpret(contactStateMachine).start();
}

test('initial state', (t) => {
    const contactStateService = createContactStateService();

    t.is(contactStateService.initialState.value, 'idle');
});

test('initial context', (t) => {
    const contactStateService = createContactStateService();

    t.deepEqual(contactStateService.initialState.context, {
        name: '',
        email: '',
        message: '',
    });
});

test('transits from "idle" to "nameFocused" on "NAME_FOCUSED" event', (t) => {
    const contactStateService = createContactStateService();

    contactStateService.send('NAME_FOCUSED');

    t.true(contactStateService.state.matches('nameFocused'));
});

test('transits from "idle" to "emailFocused" on "EMAIL_FOCUSED" event', (t) => {
    const contactStateService = createContactStateService();

    contactStateService.send('EMAIL_FOCUSED');

    t.true(contactStateService.state.matches('emailFocused'));
});

test('transits from "idle" to "messageFocused" on "MESSAGE_FOCUSED" event', (t) => {
    const contactStateService = createContactStateService();

    contactStateService.send('MESSAGE_FOCUSED');

    t.true(contactStateService.state.matches('messageFocused'));
});

test('transits from "nameFocused" to "idle" on "NAME_UNFOCUSED" event', (t) => {
    const contactStateService = createContactStateService();

    contactStateService.send(['NAME_FOCUSED', 'NAME_UNFOCUSED']);

    t.true(contactStateService.state.matches('idle'));
});

test('transits from "emailFocused" to "idle" on "EMAIL_UNFOCUSED" event', (t) => {
    const contactStateService = createContactStateService();

    contactStateService.send(['EMAIL_FOCUSED', 'EMAIL_UNFOCUSED']);

    t.true(contactStateService.state.matches('idle'));
});

test('transits from "messageFocused" to "idle" on "MESSAGE_UNFOCUSED" event', (t) => {
    const contactStateService = createContactStateService();

    contactStateService.send(['MESSAGE_FOCUSED', 'MESSAGE_UNFOCUSED']);

    t.true(contactStateService.state.matches('idle'));
});

test('sets "name" in context when in "nameFocused" state and "TYPING" event is sent', (t) => {
    const contactStateService = createContactStateService();

    contactStateService.send(['NAME_FOCUSED', { type: 'TYPING', value: 'foo' }]);

    t.is(contactStateService.state.context.name, 'foo');
});

test('sets last value of multiple "TYPING" events as "name" in context', (t) => {
    const contactStateService = createContactStateService();

    contactStateService.send([
        'NAME_FOCUSED',
        { type: 'TYPING', value: 'foo' },
        { type: 'TYPING', value: 'bar' },
        { type: 'TYPING', value: 'baz' },
    ]);

    t.is(contactStateService.state.context.name, 'baz');
});

test('sets "email" in context when in "emailFocused" state and "TYPING" event is sent', (t) => {
    const contactStateService = createContactStateService();

    contactStateService.send(['EMAIL_FOCUSED', { type: 'TYPING', value: 'foo' }]);

    t.is(contactStateService.state.context.email, 'foo');
});

test('sets last value of multiple "TYPING" events as "email" in context', (t) => {
    const contactStateService = createContactStateService();

    contactStateService.send([
        'EMAIL_FOCUSED',
        { type: 'TYPING', value: 'foo' },
        { type: 'TYPING', value: 'bar' },
        { type: 'TYPING', value: 'baz' },
    ]);

    t.is(contactStateService.state.context.email, 'baz');
});

test('sets "message" in context when in "messageFocused" state and "TYPING" event is sent', (t) => {
    const contactStateService = createContactStateService();

    contactStateService.send(['MESSAGE_FOCUSED', { type: 'TYPING', value: 'foo' }]);

    t.is(contactStateService.state.context.message, 'foo');
});

test('sets last value of multiple "TYPING" events as "message" in context', (t) => {
    const contactStateService = createContactStateService();

    contactStateService.send([
        'MESSAGE_FOCUSED',
        { type: 'TYPING', value: 'foo' },
        { type: 'TYPING', value: 'bar' },
        { type: 'TYPING', value: 'baz' },
    ]);

    t.is(contactStateService.state.context.message, 'baz');
});

test('keeps "name" in context when transition from "nameFocused" to "idle"', (t) => {
    const contactStateService = createContactStateService();

    contactStateService.send(['NAME_FOCUSED', { type: 'TYPING', value: 'foo' }, 'NAME_UNFOCUSED']);

    t.is(contactStateService.state.context.name, 'foo');
    t.true(contactStateService.state.matches('idle'));
});

test('keeps "email" in context when transition from "emailFocused" to "idle"', (t) => {
    const contactStateService = createContactStateService();

    contactStateService.send(['EMAIL_FOCUSED', { type: 'TYPING', value: 'foo' }, 'EMAIL_UNFOCUSED']);

    t.is(contactStateService.state.context.email, 'foo');
    t.true(contactStateService.state.matches('idle'));
});

test('keeps "message" in context when transition from "messageFocused" to "idle"', (t) => {
    const contactStateService = createContactStateService();

    contactStateService.send(['MESSAGE_FOCUSED', { type: 'TYPING', value: 'foo' }, 'MESSAGE_UNFOCUSED']);

    t.is(contactStateService.state.context.message, 'foo');
    t.true(contactStateService.state.matches('idle'));
});

test('keeps all values in context after everything was filled and transition back to "idle"', (t) => {
    const contactStateService = createContactStateService();

    contactStateService.send([
        'NAME_FOCUSED',
        { type: 'TYPING', value: 'foo' },
        'NAME_UNFOCUSED',
        'EMAIL_FOCUSED',
        { type: 'TYPING', value: 'bar@example.com' },
        'EMAIL_UNFOCUSED',
        'MESSAGE_FOCUSED',
        { type: 'TYPING', value: 'bar' },
        'MESSAGE_UNFOCUSED',
    ]);

    t.deepEqual(contactStateService.state.context, {
        name: 'foo',
        email: 'bar@example.com',
        message: 'bar',
    });
    t.true(contactStateService.state.matches('idle'));
});

test('transits to "validationFailed" on "SUBMIT" event when context data is not valid', (t) => {
    const contactStateService = createContactStateService();

    contactStateService.send([
        'NAME_FOCUSED',
        { type: 'TYPING', value: 'foo' },
        'NAME_UNFOCUSED',
        'EMAIL_FOCUSED',
        { type: 'TYPING', value: 'invalid@email' },
        'EMAIL_UNFOCUSED',
        'MESSAGE_FOCUSED',
        { type: 'TYPING', value: '' },
        'MESSAGE_UNFOCUSED',
        'SUBMIT',
    ]);

    t.true(contactStateService.state.matches('validationFailed'));
});

test('transits to "validationFailed" again on "SUBMIT" event when context data is still not valid', (t) => {
    const contactStateService = createContactStateService();

    contactStateService.send([
        'EMAIL_FOCUSED',
        { type: 'TYPING', value: 'invalid' },
        'EMAIL_UNFOCUSED',
        'SUBMIT',
        'EMAIL_FOCUSED',
        { type: 'TYPING', value: 'still@invalid' },
        'EMAIL_UNFOCUSED',
        'SUBMIT',
    ]);

    t.true(contactStateService.state.matches('validationFailed'));
});

test('transits to "sending" on "SUBMIT" event when context data is valid', (t) => {
    const contactStateService = createContactStateService();

    contactStateService.send([
        'NAME_FOCUSED',
        { type: 'TYPING', value: 'foo' },
        'NAME_UNFOCUSED',
        'EMAIL_FOCUSED',
        { type: 'TYPING', value: 'bar@example.com' },
        'EMAIL_UNFOCUSED',
        'MESSAGE_FOCUSED',
        { type: 'TYPING', value: 'baz' },
        'MESSAGE_UNFOCUSED',
        'SUBMIT',
    ]);

    t.true(contactStateService.state.matches('sending'));
});

test('invokes "postContactForm" service when entering "sending" state node', (t) => {
    const postContactForm = fake.resolves(undefined);
    const contactStateService = createContactStateService({
        config: {
            services: {
                postContactForm,
            },
        },
    });

    contactStateService.send([
        'NAME_FOCUSED',
        { type: 'TYPING', value: 'foo' },
        'NAME_UNFOCUSED',
        'EMAIL_FOCUSED',
        { type: 'TYPING', value: 'bar@example.com' },
        'EMAIL_UNFOCUSED',
        'MESSAGE_FOCUSED',
        { type: 'TYPING', value: 'baz' },
        'MESSAGE_UNFOCUSED',
        'SUBMIT',
    ]);

    t.true(postContactForm.calledOnce);
});

test('makes a HTTP POST request when entering "sending" state node', (t) => {
    const ky = { post: fake.resolves(undefined) };
    const contactStateService = createContactStateService({
        ky: ky as unknown as typeof KyInterface,
    });

    contactStateService.send([
        'NAME_FOCUSED',
        { type: 'TYPING', value: 'foo' },
        'NAME_UNFOCUSED',
        'EMAIL_FOCUSED',
        { type: 'TYPING', value: 'bar@example.com' },
        'EMAIL_UNFOCUSED',
        'MESSAGE_FOCUSED',
        { type: 'TYPING', value: 'baz' },
        'MESSAGE_UNFOCUSED',
        'SUBMIT',
    ]);

    const searchParams = new URLSearchParams({
        name: 'foo',
        email: 'bar@example.com',
        message: 'baz',
        'form-name': 'contact',
    });
    const callArguments = ky.post.args[0];
    t.is(callArguments?.[0], '/contact-form');
    t.deepEqual(callArguments?.[1], {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: searchParams,
    });
});

test('transits to "sent" after sending contact form', async (t) => {
    const contactStateService = createContactStateService();

    contactStateService.send([
        'NAME_FOCUSED',
        { type: 'TYPING', value: 'foo' },
        'NAME_UNFOCUSED',
        'EMAIL_FOCUSED',
        { type: 'TYPING', value: 'bar@example.com' },
        'EMAIL_UNFOCUSED',
        'MESSAGE_FOCUSED',
        { type: 'TYPING', value: 'baz' },
        'MESSAGE_UNFOCUSED',
        'SUBMIT',
    ]);
    await setImmediate();

    t.true(contactStateService.state.matches('sent'));
});

test('defines "sent" state node as final', async (t) => {
    const contactStateService = createContactStateService();

    contactStateService.send([
        'NAME_FOCUSED',
        { type: 'TYPING', value: 'foo' },
        'NAME_UNFOCUSED',
        'EMAIL_FOCUSED',
        { type: 'TYPING', value: 'bar@example.com' },
        'EMAIL_UNFOCUSED',
        'MESSAGE_FOCUSED',
        { type: 'TYPING', value: 'baz' },
        'MESSAGE_UNFOCUSED',
        'SUBMIT',
    ]);
    await setImmediate();

    t.true(contactStateService.state.done);
});
