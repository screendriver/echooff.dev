import React, { FunctionComponent, PropsWithChildren } from 'react';

interface FigureProps {
    readonly description: string;
}

export const Figure: FunctionComponent<PropsWithChildren<FigureProps>> = (props) => {
    return (
        <div className="flex flex-col justify-center items-center bg-dracula-darker rounded h-20 lg:h-28 lg:text-lg text-center">
            <p className="text-dracula-light">{props.description}</p>
            {props.children}
        </div>
    );
};
