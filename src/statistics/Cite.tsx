import React, { FunctionComponent } from 'react';

interface CiteProps {
    'aria-label'?: string;
}

export const Cite: FunctionComponent<CiteProps> = (props) => {
    return (
        <cite aria-label={props['aria-label']} className="text-lg text-dracula-green font-bold not-italic mt-2">
            {props.children}
        </cite>
    );
};
