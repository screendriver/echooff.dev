import { Selector, RequestLogger, RequestMock } from 'testcafe';

const url = 'http://localhost:9000';

const logger = RequestLogger(
  { url, method: 'POST', isAjax: true },
  {
    logRequestHeaders: true,
    logRequestBody: true,
    stringifyRequestBody: true,
  },
);
const mock = RequestMock()
  .onRequestTo({
    url,
    method: 'POST',
  })
  .respond({}, 200);

fixture('Contact form').page(url).requestHooks(mock, logger);

test('show "Thank you" message after submitting contact form', async (t) => {
  const nameInput = Selector('input[placeholder="Name"]');
  const emailInput = Selector('input[placeholder="Email"]');
  const messageInput = Selector('textarea[placeholder="Message"]');
  const submit = Selector('input[type="submit"]').withAttribute(
    'value',
    'Send Message',
  );
  await t
    .typeText(nameInput, 'Me')
    .typeText(emailInput, 'test@example.com')
    .typeText(messageInput, 'lorem ipsum')
    .click(submit)
    .expect(Selector('[aria-label="Thank you"]').exists)
    .ok();

  const logRecord = logger.requests[0];
  const headers = logRecord.request.headers as { [key: string]: string };
  await t
    .expect(headers['content-type'])
    .eql('application/x-www-form-urlencoded')
    .expect(logRecord.request.body)
    .eql(
      'form-name=contact&name=Me&email=test%40example.com&message=lorem+ipsum',
    );
});
