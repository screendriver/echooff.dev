const { startStaticServer } = require('./target/src/static-server/static-server');

exports.onCreateDevServer = async ({ reporter }) => {
    const serverResult = await startStaticServer();

    serverResult.match({
        Ok(address) {
            process.env.GITHUB_API_BASE_URL = address;
            process.env.GITHUB_LOGIN = 'foo';
            process.env.GITHUB_API_TOKEN = 'test-token';
            process.env.GATSBY_CONTACT_FORM_URL = `${address}/contact-form`;

            reporter.info(`Static server listening on ${address}`);
        },
        Err() {
            reporter.error('Static server is not listening');
        },
    });
};
