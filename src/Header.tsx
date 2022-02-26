import React, { FunctionComponent } from 'react';
import { StaticImage } from 'gatsby-plugin-image';

export const Header: FunctionComponent = () => {
    return (
        <header className="relative">
            <StaticImage
                alt="Christian Rackerseder"
                src="./img/header-01.jpg"
                loading="eager"
                as="figure"
                layout="fullWidth"
                transformOptions={{
                    grayscale: true,
                }}
                className="bg-gradient-to-b from-dracula-cyan h-4/5"
                imgClassName="mix-blend-luminosity"
            />
            <div className="sm:absolute sm:bottom-4 lg:bottom-8 sm:right-4 lg:right-8 bg-dracula-darker border border-dracula-dark border-solid rounded-md shadow-md shadow-dracula-darker bg-opacity-90 max-w-screen-sm mt-4 pb-10 lg:pb-16 xl:pb-24 w-4/5 sm:w-auto m-auto">
                <div className="bg-dracula-dark relative flex flex-row justify-center h-4 md:h-7 mb-2 p-2 rounded-t-md">
                    <div className="flex flex-row absolute top-1 md:top-2 left-2 space-x-1 md:space-x-2">
                        <div className="bg-dracula-red h-2 md:h-3 w-2 md:w-3 rounded-full" />
                        <div className="bg-yellow h-2 md:h-3 w-2 md:w-3 rounded-full" />
                        <div className="bg-dracula-green h-2 md:h-3 w-2 md:w-3 rounded-full" />
                    </div>
                </div>
                <code className="block px-2 md:px-4 text-base sm:mr-10 lg:mr-20 xl:mr-32">
                    <p className="text-dracula-light mb-1">$ whoami</p>
                    <p className="text-transparent bg-clip-text bg-gradient-to-r from-dracula-pink to-dracula">
                        Christian
                    </p>
                    <p className="text-dracula-light mb-1">$ groups</p>
                    <p className="text-transparent bg-clip-text bg-gradient-to-r from-dracula-pink to-dracula">
                        Full-Stack JavaScript Engineer
                    </p>
                </code>
            </div>
        </header>
    );
};
