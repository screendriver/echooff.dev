import * as percySnapshot from '@percy/testcafe';

fixture('Visual').page('http://localhost:9000');

test('main page', async (t) => {
  await t.wait(1000);
  await percySnapshot(t, 'Main page', {
    widths: [320, 375, 425, 768, 1024, 1440, 1920],
  });
});
