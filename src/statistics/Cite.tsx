import React, { FunctionComponent, PropsWithChildren } from 'react';

interface CiteProps {
    'aria-label'?: string;
}

export const Cite: FunctionComponent<PropsWithChildren<CiteProps>> = (props) => {
    return (
        <cite aria-label={props['aria-label']} className="text-lg text-dracula-green font-bold not-italic mt-2">
            {props.children}
        </cite>
    );
};
