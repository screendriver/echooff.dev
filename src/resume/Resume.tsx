import React, { FunctionComponent, ReactNode } from 'react';
import { formatSinceDate } from './date';

export interface ResumeData {
    readonly since: string;
    readonly showOnlyYear: boolean;
    readonly industry: string;
    readonly jobTitle: string;
    readonly jobDescription: string;
}

interface ResumeProps {
    readonly resume: readonly ResumeData[];
}

function renderJob(resume: ResumeData): ReactNode {
    return formatSinceDate(resume.since, resume.showOnlyYear).mapOr(null, (since) => {
        return (
            <dt key={since}>
                {since} {resume.industry} {resume.jobTitle} {resume.jobDescription}
            </dt>
        );
    });
}

export const Resume: FunctionComponent<ResumeProps> = (props) => {
    return (
        <div className="before:w-2.5 before:h-full before:absolute before:rounded-3xl before:bg-dracula-orange">
            <dl>{props.resume.map(renderJob)}</dl>
        </div>
    );
};
