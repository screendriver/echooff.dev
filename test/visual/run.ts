import micro from 'micro';
import handler from 'serve-handler';
import listen from 'test-listen';
import backstop from 'backstopjs';

function createConfig(url: string) {
  return {
    config: {
      id: 'echooff',
      viewports: [
        {
          label: 'phone-small',
          width: 320,
          height: 480,
        },
        {
          label: 'phone-medium',
          width: 375,
          height: 550,
        },
        {
          label: 'phone-large',
          width: 425,
          height: 550,
        },
        {
          label: 'tablet',
          width: 768,
          height: 600,
        },
        {
          label: 'laptop',
          width: 1024,
          height: 768,
        },
        {
          label: 'laptop-large',
          width: 1440,
          height: 1024,
        },
        {
          label: 'desktop',
          width: 1920,
          height: 1080,
        },
      ],
      scenarios: [
        {
          label: 'Homepage',
          url,
        },
      ],
      paths: {
        bitmaps_reference: 'test/visual/backstop_data/bitmaps_reference',
        bitmaps_test: 'test/visual/backstop_data/bitmaps_test',
        engine_scripts: 'test/visual/backstop_data/engine_scripts',
        html_report: 'test/visual/backstop_data/html_report',
        ci_report: 'test/visual/backstop_data/ci_report',
      },
      report: ['browser', 'CI'],
      engine: 'puppeteer',
      engineOptions: {
        args: ['--no-sandbox'],
      },
      asyncCaptureLimit: 5,
      asyncCompareLimit: 50,
    },
  };
}

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
