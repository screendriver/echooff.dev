import React, { FunctionComponent } from 'react';
import { FiInfo } from 'react-icons/fi';
import { StaticImage } from 'gatsby-plugin-image';

export const About: FunctionComponent = () => {
    return (
        <section className="p-4 lg:p-10">
            <h3 className="flex items-start lg:items-end justify-center gap-x-2 text-dracula-cyan text-2xl lg:text-4xl font-extrabold my-2">
                About
                <FiInfo className="text-dracula-light w-6 h-6 lg:w-12 lg:h-12" />
            </h3>
            <hr className="h-2 w-1/2 border-none mb-4 m-auto bg-dracula-red bg-gradient-to-br from-yellow to-dracula-pink rounded-lg" />
            <article className="text-justify flex flex-col items-center sm:p-4 lg:p-7 xl:px-11">
                <p className="m-auto lg:w-3/4">
                    JavaScript is everywhere. In the old days, being a JavaScript developer meant that you were a front
                    end web developer. Forever bound to the browser.
                </p>
                <strong className="block text-center my-8 uppercase">Those days are gone</strong>
                <p className="m-auto lg:w-3/4">
                    The rise of Node.js ushered in a new era. An era where being a JavaScript developer doesn’t
                    necessarily mean a front-end web developer. As a JavaScript developer today, you can target more
                    platforms than any other high level language.
                </p>
                <figure>
                    <StaticImage
                        className="rounded-full border-4 border-dracula-blue mt-12 mb-10 md:mb-3 lg:mb-0"
                        alt="My face"
                        src="../img/about.jpg"
                        loading="eager"
                        width={200}
                        height={200}
                        quality={75}
                    />
                </figure>
            </article>
        </section>
    );
};
