import React, { FunctionComponent, ReactNode } from 'react';
import { FiFileText } from 'react-icons/fi';
import { mapOr } from 'true-myth/result';
import { ResumeData } from '../main-page-schema';
import { formatSinceDate } from './date';

interface ResumeProps {
    readonly resume: readonly ResumeData[];
}

function renderResume(resume: ResumeData): ReactNode {
    const render = mapOr<string, ReactNode | null, string>(null, (since) => {
        return (
            <li
                key={since}
                className="group relative pl-10 md:grid md:grid-cols-[0.5fr_auto_1fr] md:gap-x-7 md:justify-between md:justify-items-start md:pl-0"
            >
                <p className="uppercase text-xs mb-1 tracking-widest text-dracula-green md:justify-self-end">{since}</p>
                <div className="absolute top-1 left-0 bottom-0 before:block before:bg-dracula-orange before:group-hover:bg-transparent before:border-3 before:border-solid before:border-dracula-orange before:rounded-full before:w-4 before:h-4 before:transition-colors before:duration-300 before:ease-in-out after:block after:bg-dracula-blue after:w-1 after:absolute after:top-6 after:bottom-1 md:after:bottom-2 after:left-1.5 md:relative after:group-last:hidden" />
                <div className="pb-10">
                    <h3 className="text-lg leading-none">{resume.jobTitle}</h3>
                    <h4 className="text-dracula-green">
                        <a href={resume.company.url} className="transition-colors hover:text-dracula-purple">
                            {resume.company.name}
                        </a>
                        <span className="text-dracula-blue"> ({resume.industry})</span>
                    </h4>
                    <p className="text-sm">{resume.jobDescription}</p>
                </div>
            </li>
        );
    });

    return render(formatSinceDate(resume.since, resume.showOnlyYear));
}

export const Resume: FunctionComponent<ResumeProps> = (props) => {
    return (
        <section className="p-4 lg:p-10">
            <h3 className="flex items-center lg:items-end justify-center gap-x-2 text-dracula-cyan lg:leading-none text-2xl lg:text-4xl font-extrabold my-2">
                Resume
                <FiFileText className="text-dracula-light w-6 h-6 lg:w-9 lg:h-9" />
            </h3>
            <hr className="h-2 w-1/2 border-none mb-4 m-auto bg-dracula-red bg-gradient-to-br from-yellow to-dracula-pink rounded-lg" />
            <ol className="w-4/5 ml-1/12 sm:px-4 sm:pt-4">{props.resume.map(renderResume)}</ol>
        </section>
    );
};
