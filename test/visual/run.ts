import micro from 'micro';
import handler from 'serve-handler';
import backstop from 'backstopjs';

async function run() {
  const server = micro((req, res) => {
    return handler(req, res, {
      public: 'public',
    });
  });
  await server.listen(9000);
  try {
    await backstop(process.argv[2], { docker: true });
  } finally {
    server.close();
  }
}

run();
