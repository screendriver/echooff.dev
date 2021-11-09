import { Selector, RequestMock } from 'testcafe';

const quickmetricsMock = RequestMock().onRequestTo('http://localhost:9000/.netlify/functions/quickmetrics').respond('');

fixture('About image').page('http://localhost:9000').requestHooks(quickmetricsMock);

test('exists', async (t) => {
  const image = Selector('img[alt="My face"]');
  await t.expect(image.exists).ok();
});
