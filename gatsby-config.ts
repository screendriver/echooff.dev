import type { GatsbyConfig } from 'gatsby';
import path from 'path';

const config: GatsbyConfig = {
    graphqlTypegen: {
        typesOutputPath: './target/gatsby-types.d.ts',
    },
    siteMetadata: {
        author: 'Christian Rackerseder',
        jobTitle: 'Full-Stack JavaScript Engineer',
        keywords: 'Racki,TypeScript,JavaScript,HTML,CSS,Node.js,React',
        favicon: 'favicon.png',
        siteUrl: 'https://www.echooff.dev',
    },
    plugins: [
        'gatsby-plugin-image',
        'gatsby-plugin-sitemap',
        'gatsby-plugin-robots-txt',
        'gatsby-plugin-postcss',
        'gatsby-plugin-react-helmet',
        {
            resolve: 'gatsby-plugin-sharp',
            options: {
                defaults: {
                    formats: ['auto', 'webp', 'avif'],
                    placeholder: 'blurred',
                },
            },
        },
        'gatsby-transformer-sharp',
        'gatsby-transformer-json',
        {
            resolve: 'gatsby-source-filesystem',
            options: {
                name: 'src',
                path: path.resolve('src/'),
            },
        },
        'gatsby-plugin-netlify',
        {
            resolve: '@sentry/gatsby',
            options: {
                sampleRate: 1.0,
            },
        },
    ],
};

export default config;
