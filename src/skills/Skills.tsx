import React, { FunctionComponent } from 'react';
import { FiAward } from 'react-icons/fi';
import { Card } from './Card';
import { CssIcon } from './icons/CssIcon';
import { ElmIcon } from './icons/ElmIcon';
import { JavaScriptIcon } from './icons/JavaScriptIcon';
import { NodejsIcon } from './icons/NodejsIcon';
import { ReactIcon } from './icons/ReactIcon';
import { TypeScriptIcon } from './icons/TypeScriptIcon';

export const Skills: FunctionComponent = () => {
    return (
        <section className="bg-dracula-dark p-4 lg:p-10">
            <h3 className="flex items-start lg:items-end justify-center gap-x-2 text-dracula-cyan text-2xl lg:text-4xl font-extrabold my-2">
                Skills
                <FiAward className="text-dracula-light w-6 h-6 lg:w-12 lg:h-12" />
            </h3>
            <hr className="h-2 w-1/2 border-none mb-4 m-auto bg-dracula-red bg-gradient-to-br from-yellow to-dracula-pink rounded-lg" />
            <div className="text-dracula-light grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 justify-items-center max-w-screen-lg m-auto sm:p-4">
                <Card
                    icon={<TypeScriptIcon className="h-12 mb-3" />}
                    title="TypeScript"
                    description="is a typed superset of JavaScript that compiles to plain JavaScript."
                    style="from-dracula to-dracula-cyan"
                    link={new URL('https://www.typescriptlang.org')}
                />
                <Card
                    icon={<JavaScriptIcon className="h-12 mb-3" />}
                    title="JavaScript"
                    description="is a high-level, interpreted programming language that conforms to the ECMAScript specification."
                    style="from-yellow to-dracula-pink"
                    link={new URL('https://www.ecma-international.org/publications/standards/Ecma-262.htm')}
                />
                <Card
                    icon={<ReactIcon className="h-12 mb-3" />}
                    title="React"
                    description="is a library for building user interfaces."
                    style="from-dracula to-dracula-cyan"
                    link={new URL('https://reactjs.org')}
                />
                <Card
                    icon={<NodejsIcon className="h-12 mb-3" />}
                    title="Node.js"
                    description="is a JavaScript runtime built on Chrome's V8 JavaScript engine."
                    style="from-yellow to-dracula-pink"
                    link={new URL('https://nodejs.org')}
                />
                <Card
                    icon={<CssIcon className="h-12 mb-3" />}
                    title="Cascading Style Sheets (CSS)"
                    description="is a simple mechanism for adding style (e.g., fonts, colors, spacing) to Web documents."
                    style="from-dracula to-dracula-cyan"
                    link={new URL('https://www.w3.org/Style/CSS/')}
                />
                <Card
                    icon={<ElmIcon className="h-12 mb-3" />}
                    title="Elm"
                    description="is a delightful language for reliable webapps."
                    style="from-yellow to-dracula-pink"
                    link={new URL('https://elm-lang.org')}
                />
            </div>
        </section>
    );
};
