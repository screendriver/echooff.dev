import React, { FunctionComponent } from 'react';
import { FiHeart, FiCheck, FiCompass, FiZap, FiServer, FiLayers, FiCloud, FiActivity } from 'react-icons/fi';

export const Passions: FunctionComponent = () => {
    return (
        <section className="p-4 lg:p-10">
            <h3 className="flex items-center lg:items-end justify-center gap-x-2 text-dracula-cyan lg:leading-none text-2xl lg:text-4xl font-extrabold my-2">
                Passions
                <FiHeart className="text-dracula-light w-6 h-6 lg:w-9 lg:h-9" />
            </h3>
            <hr className="h-2 w-1/2 border-none mb-4 m-auto bg-dracula-red bg-gradient-to-br from-yellow to-dracula-pink rounded-lg" />
            <article className="m-auto max-w-screen-lg grid gap-2 grid-cols-2 md:grid-cols-3 sm:p-4">
                <div className="flex flex-row justify-center items-center py-3 bg-dracula-dark rounded">
                    <FiActivity className="text-dracula-green mr-1" />
                    <p>Agile</p>
                </div>
                <div className="flex flex-row justify-center items-center py-3 bg-dracula-dark rounded">
                    <FiCompass className="text-dracula-green mr-1" />
                    <p>Clean Code</p>
                </div>
                <div className="flex flex-row justify-center items-center py-3 bg-dracula-dark rounded">
                    <FiZap className="text-dracula-green mr-1" />
                    <p>Performance</p>
                </div>
                <div className="flex flex-row justify-center items-center py-3 bg-dracula-dark rounded">
                    <FiServer className="text-dracula-green mr-1" />
                    <p>Serverless</p>
                </div>
                <div className="flex flex-row justify-center items-center py-3 bg-dracula-dark rounded">
                    <FiLayers className="text-dracula-green mr-1" />
                    <p>JAMStack</p>
                </div>
                <div className="flex flex-row justify-center items-center py-3 bg-dracula-dark rounded">
                    <FiCloud className="text-dracula-green mr-1" />
                    <p>Cloud</p>
                </div>
                <div className="flex flex-row justify-center items-center py-3 bg-dracula-dark rounded col-span-2 md:col-span-3">
                    <FiCheck className="text-dracula-green mr-1" />
                    <p>TDD</p>
                </div>
            </article>
        </section>
    );
};
