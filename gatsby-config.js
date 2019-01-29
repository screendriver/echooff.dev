require('dotenv').config();

module.exports = {
  siteMetadata: {
    title: 'echooff.de',
    description: 'Full Stack JavaScript Engineer',
    author: 'Christian Rackerseder',
    keywords: 'TypeScript,JavaScript,HTML,CSS,Node.js,React,Vue',
    favicon: 'favicon.png',
  },
  plugins: [
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
      resolve: 'gatsby-plugin-web-font-loader',
      options: {
        google: {
          families: ['Open Sans', 'Lato'],
        },
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
  ],
};
