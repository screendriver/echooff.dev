require('dotenv').config();

module.exports = {
  siteMetadata: {
    author: 'Christian Rackerseder',
    jobTitle: 'Full-Stack JavaScript Engineer',
    keywords: 'TypeScript,JavaScript,HTML,CSS,Node.js,React',
    favicon: 'favicon.png',
    siteUrl: 'https://www.echooff.dev',
  },
  plugins: [
    'gatsby-plugin-image',
    'gatsby-plugin-sitemap',
    'gatsby-plugin-robots-txt',
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
        path: `${__dirname}/src/`,
      },
    },
    'gatsby-plugin-netlify',
  ],
};
