require('dotenv').config();

module.exports = {
  siteMetadata: {
    author: 'Christian Rackerseder',
    favicon: 'favicon.png',
    siteUrl: 'https://www.echooff.dev',
  },
  plugins: [
    'gatsby-plugin-image',
    'gatsby-plugin-sitemap',
    'gatsby-plugin-robots-txt',
    'gatsby-plugin-emotion',
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
    'gatsby-transformer-json',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'locale',
        path: `${__dirname}/src/locales/`,
      },
    },
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
          Authorization: `bearer ${process.env.GITHUB_API_TOKEN}`,
        },
      },
    },
    {
      resolve: 'gatsby-plugin-react-i18next',
      options: {
        localeJsonSourceName: 'locale',
        languages: ['en'],
        defaultLanguage: 'en',
        redirect: true,
        i18nextOptions: {
          interpolation: {
            escapeValue: false,
          },
        },
      },
    },
    'gatsby-plugin-netlify',
  ],
};
