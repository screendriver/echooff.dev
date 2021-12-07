import React, { FunctionComponent } from 'react';

interface FigureProps {
    readonly description: string;
    readonly count: number;
}

export const Figure: FunctionComponent<FigureProps> = (props) => {
    return (
        <div className="flex flex-col justify-center bg-dracula-darker rounded h-20 lg:h-24 text-sm sm:text-base lg:text-lg xl:text-xl text-center">
            <p className="text-dracula-light">{props.description}</p>
            <cite className="text-dracula-green font-bold not-italic">{props.count}</cite>
        </div>
    );
};
