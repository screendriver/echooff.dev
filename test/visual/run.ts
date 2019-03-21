import micro from 'micro';
import handler from 'serve-handler';
import listen from 'test-listen';
import backstop from 'backstopjs';

async function run() {
  const server = micro((req, res) => {
    return handler(req, res, {
      public: 'public',
    });
  });

  const url = await listen(server);
  const config = createConfig(url);
  try {
    await backstop(process.argv[2], config);
  } finally {
    server.close();
  }
}

run();
