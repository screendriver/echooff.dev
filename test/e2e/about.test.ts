import { Selector } from 'testcafe';

fixture('About image').page('http://localhost:5000');

test('width', async t => {
  const image = Selector('img[alt="My face"]');
  await t.expect(image.getAttribute('width')).eql('200');
});
