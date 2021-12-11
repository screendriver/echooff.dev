import React, { FunctionComponent } from 'react';

export const Cite: FunctionComponent = (props) => {
    return <cite className="text-dracula-green font-bold not-italic mt-2">{props.children}</cite>;
};
