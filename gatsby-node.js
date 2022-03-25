const { startStaticServer } = require('./target/src/static-server/static-server');

exports.onPostBootstrap = async ({ reporter }) => {
    if (process.env.NODE_ENV === 'production') {
        return;
    }

    try {
        const listeningAddress = await startStaticServer();
        process.env.GIT_HUB_API_BASE_URL = listeningAddress;
        process.env.GIT_HUB_LOGIN = 'foo';
        process.env.GIT_HUB_API_TOKEN = 'test-token';
        process.env.GATSBY_CONTACT_FORM_URL = `${listeningAddress}/contact-form`;
        reporter.info(`Static server listening on ${listeningAddress}`);
    } catch {
        reporter.error('Static server is not listening');
    }
};
