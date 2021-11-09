import React, { FunctionComponent } from 'react';
import { StaticImage } from 'gatsby-plugin-image';

export const Header: FunctionComponent = () => {
    return (
        <header className="relative bg-gradient-to-b from-lemon-yellow-crayola to-celeste">
            <StaticImage
                alt="Christian Rackerseder"
                src="./img/header-15.jpg"
                loading="eager"
                as="figure"
                layout="fullWidth"
                transformOptions={{
                    grayscale: true,
                }}
                imgClassName="mix-blend-luminosity"
            />
            <section className="absolute top-0 w-full h-full flex flex-col justify-center items-center">
                <div className="text-baby-powder font-jetbrains-mono flex flex-col bg-gray-700 bg-opacity-80 p-2 shadow rounded-xl sm:p-4 lg:p-7">
                    <h1 className="text-lg md:text-2xl lg:text-5xl">Hello, I'm Christian</h1>
                    <h2 className="text-sm md:text-lg lg:text-2xl mt-3">Full-Stack JavaScript Engineer</h2>
                </div>
            </section>
        </header>
    );
};
