import { Selector } from 'testcafe';

fixture('Title').page('http://localhost:5000');

test('Page title', async t => {
  const title = 'Christian Rackerseder - Full-Stack JavaScript Engineer';
  await t.expect(Selector('title').innerText).eql(title);
});
