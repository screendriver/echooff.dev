import React, { FunctionComponent } from 'react';

export interface CardProps {
    readonly icon: JSX.Element;
    readonly title: string;
    readonly description: string;
    readonly style: 'from-dracula to-dracula-cyan' | 'from-yellow to-dracula-pink';
    readonly link: URL;
}

export const Card: FunctionComponent<CardProps> = (props) => {
    return (
        <article className={`flex items-stretch rounded-2xl bg-gradient-to-br ${props.style}`}>
            <a
                href={props.link.toString()}
                title={props.title}
                className="block text-center bg-dracula-darker rounded-2xl m-1 p-3"
            >
                {props.icon}
                <h3 className="inline text-transparent bg-clip-text bg-gradient-to-r from-dracula to-dracula-cyan">
                    {props.title}
                </h3>{' '}
                <p className="inline">{props.description}</p>
            </a>
        </article>
    );
};
