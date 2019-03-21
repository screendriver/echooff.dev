import micro from 'micro';
import handler from 'serve-handler';
import listen from 'test-listen';

async function run() {
  const server = micro((req, res) => {
    return handler(req, res, {
      public: 'public',
    });
  });

  await listen(server);
}

run();
