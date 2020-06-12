import { Selector, RequestMock } from 'testcafe';

const quickmetricsMock = RequestMock()
  .onRequestTo('http://localhost:9000/.netlify/functions/quickmetrics')
  .respond('');

fixture('SEO').page('http://localhost:9000').requestHooks(quickmetricsMock);

test('title', async (t) => {
  await t
    .expect(Selector('title').innerText)
    .eql('Christian Rackerseder - Full-Stack JavaScript Engineer');
});

test('description', async (t) => {
  await t
    .expect(Selector('meta[name="description"]').getAttribute('content'))
    .eql('Full-Stack JavaScript Engineer');
});

test('author', async (t) => {
  await t
    .expect(Selector('meta[name="author"]').getAttribute('content'))
    .eql('Christian Rackerseder');
});

test('keywords', async (t) => {
  await t
    .expect(Selector('meta[name="keywords"]').getAttribute('content'))
    .eql('TypeScript,JavaScript,HTML,CSS,Node.js,React,Vue');
});

test('favicon', async (t) => {
  await t
    .expect(Selector('link[rel="shortcut icon"]').getAttribute('href'))
    .eql('favicon.png');
});
