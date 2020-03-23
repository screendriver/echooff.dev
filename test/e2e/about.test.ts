import { Selector } from 'testcafe';

fixture('About image').page('http://localhost:9000');

test('exists', async (t) => {
  const image = Selector('img[alt="My face"]');
  await t.expect(image.exists).ok();
});
