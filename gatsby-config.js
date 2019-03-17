require('dotenv').config();

module.exports = {
  siteMetadata: {
    title: 'Christian Rackerseder - Full-Stack JavaScript Engineer',
    description: 'Full-Stack JavaScript Engineer',
    author: 'Christian Rackerseder',
    keywords: 'TypeScript,JavaScript,HTML,CSS,Node.js,React,Vue',
    favicon: 'favicon.png',
    siteUrl: 'https://www.echooff.de',
  },
  plugins: [
    'gatsby-plugin-sitemap',
    'gatsby-plugin-robots-txt',
    'gatsby-plugin-typescript',
    'gatsby-plugin-emotion',
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
    'gatsby-transformer-json',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'src',
        path: `${__dirname}/src/`,
      },
    },
    {
      resolve: 'gatsby-source-graphql',
      options: {
        typeName: 'GitHub',
        fieldName: 'github',
        url: 'https://api.github.com/graphql',
        headers: {
          Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
        },
      },
    },
    'gatsby-plugin-netlify',
  ],
};
