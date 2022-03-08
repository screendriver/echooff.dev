import React, { FunctionComponent } from 'react';
import { Helmet } from 'react-helmet';

export interface HeaderProps {
    title: string;
    description: string;
    author: string;
    keywords: string;
    favicon: string;
}

export const Head: FunctionComponent<HeaderProps> = ({ title, description, author, keywords, favicon }) => {
    return (
        <Helmet title={title}>
            <html lang="en" />
            <link rel="shortcut icon" href={favicon} />
            <meta name="theme-color" content="#bd93f9" />
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="author" content={author} />
        </Helmet>
    );
};
