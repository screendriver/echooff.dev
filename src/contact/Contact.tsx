import { useMachine } from '@xstate/react';
import React, { Fragment, FunctionComponent } from 'react';
import { FiGithub, FiLinkedin, FiMail, FiMapPin, FiMessageSquare, FiTwitter } from 'react-icons/fi';
import { Interpreter } from 'xstate';
import { ContactMachineEvent, ContactStateMachine, ContactStateMachineState, ContactTypestate } from './state-machine';
import { ContactStateMachineContext } from './state-machine-schema';

interface ContactProps {
    readonly contactStateMachine: ContactStateMachine;
}

function renderSendingFailed(): JSX.Element {
    return <h2 className="col-span-2 text-2xl text-dracula-red">Sending failed</h2>;
}

function renderFormSentMessage(): JSX.Element {
    return (
        <h2 aria-label="Thank you" className="col-span-2 text-2xl text-dracula-green">
            Thank you
        </h2>
    );
}

function renderForm(
    state: ContactStateMachineState,
    send: Interpreter<ContactStateMachineContext, any, ContactMachineEvent, ContactTypestate>['send'],
): JSX.Element {
    return (
        <Fragment>
            <h3 className="col-span-2">Leave me a message</h3>
            <form
                method="POST"
                name="contact"
                onSubmit={(event) => {
                    event.preventDefault();
                    send('SUBMIT');
                }}
                className="col-span-2 flex flex-col gap-3 w-11/12 sm:w-10/12 md:w-2/3"
            >
                <input type="hidden" name="form-name" value="contact" />
                <label htmlFor="name" className="hidden">
                    Name
                </label>
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    required={true}
                    value={state.context.name}
                    onFocus={() => {
                        send('NAME_FOCUSED');
                    }}
                    onChange={(changeEvent) => {
                        send({ type: 'TYPING', value: changeEvent.target.value });
                    }}
                    onBlur={() => {
                        send('NAME_UNFOCUSED');
                    }}
                    className="text-dracula-darker rounded indent-1 shadow-sm border focus:border-dracula-purple focus:outline-none"
                />
                <label htmlFor="email" className="hidden">
                    Email
                </label>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    required={true}
                    value={state.context.email}
                    onFocus={() => {
                        send('EMAIL_FOCUSED');
                    }}
                    onChange={(changeEvent) => {
                        send({ type: 'TYPING', value: changeEvent.target.value });
                    }}
                    onBlur={() => {
                        send('EMAIL_UNFOCUSED');
                    }}
                    className="text-dracula-darker rounded indent-1 shadow-sm border focus:border-dracula-purple focus:outline-none"
                />
                <label htmlFor="message" className="hidden">
                    Message
                </label>
                <textarea
                    name="message"
                    placeholder="Message"
                    rows={4}
                    required={true}
                    value={state.context.message}
                    onFocus={() => {
                        send('MESSAGE_FOCUSED');
                    }}
                    onChange={(changeEvent) => {
                        send({ type: 'TYPING', value: changeEvent.target.value });
                    }}
                    onBlur={() => {
                        send('MESSAGE_FOCUSED');
                    }}
                    className="text-dracula-darker rounded indent-1 shadow-sm border focus:border-dracula-purple focus:outline-none"
                />
                <input
                    type="submit"
                    value="Send Message"
                    className="cursor-pointer py-1 self-center w-44 border rounded-md transition border-dracula-darker bg-dracula-blue hover:bg-dracula-dark"
                />
            </form>
        </Fragment>
    );
}

function renderChildren(
    state: ContactStateMachineState,
    send: Interpreter<ContactStateMachineContext, any, ContactMachineEvent, ContactTypestate>['send'],
): JSX.Element {
    if (state.matches('sendingFailed')) {
        return renderSendingFailed();
    } else if (state.matches('sent')) {
        return renderFormSentMessage();
    }
    return renderForm(state, send);
}

export const Contact: FunctionComponent<ContactProps> = (props) => {
    const [state, send] = useMachine(props.contactStateMachine);

    return (
        <section className="bg-dracula-dark p-4 lg:p-10">
            <h3 className="flex items-center lg:items-end justify-center gap-x-2 text-dracula-cyan lg:leading-none text-2xl lg:text-4xl font-extrabold my-2">
                Contact
                <FiMail className="text-dracula-light w-6 h-6 lg:w-9 lg:h-9" />
            </h3>
            <hr className="h-2 w-1/2 border-none mb-4 m-auto bg-dracula-red bg-gradient-to-br from-yellow to-dracula-pink rounded-lg" />
            <address className="not-italic grid grid-cols-2 gap-6 justify-items-center m-auto max-w-screen-lg">
                <a
                    href="https://www.openstreetmap.org/relation/62428"
                    className="flex flex-col items-center justify-self-end mx-9"
                >
                    <FiMapPin size={23} />
                    <p>Munich</p>
                </a>
                <a href="https://threema.id/9TWBW4XN" className="flex flex-col items-center justify-self-start mx-9">
                    <FiMessageSquare size={23} />
                    <p>Threema</p>
                </a>
                {renderChildren(state, send)}
                <div className="col-span-2 flex flex-row justify-between w-72 my-6">
                    <a href="https://twitter.com/CallistoShip" title="Twitter">
                        <FiTwitter size={32} />
                    </a>
                    <a href="https://github.com/screendriver" title="GitHub">
                        <FiGithub size={32} />
                    </a>
                    <a href="https://www.linkedin.com/in/unicornyuppie" title="LinkedIn">
                        <FiLinkedin size={32} />
                    </a>
                </div>
            </address>
        </section>
    );
};
