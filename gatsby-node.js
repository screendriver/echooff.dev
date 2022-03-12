exports.createPages = ({ actions }) => {
    const { createRedirect } = actions;
    createRedirect({ fromPath: '/api/*', toPath: '/.netlify/functions/__api', statusCode: 200 });
    // https://github.com/netlify/netlify-plugin-gatsby/issues/219#issuecomment-1018321552
    createRedirect({ fromPath: '/*', toPath: '/404.html', statusCode: 404 });
};
