import { Selector, RequestMock } from 'testcafe';

const mock = RequestMock()
  .onRequestTo({
    url: 'http://localhost:5000',
    method: 'POST',
  })
  .respond({}, 200);

fixture('Contact form')
  .page('http://localhost:5000')
  .requestHooks(mock);

test('show "Thank you" message after submitting contact form', async t => {
  const nameInput = Selector('input[aria-label="Name"]');
  const emailInput = Selector('input[aria-label="Email"]');
  const messageInput = Selector('textarea[aria-label="Message"]');
  const submit = Selector('input[type="submit"]').withAttribute(
    'data-testid',
    'Send Message',
  );
  await t
    .typeText(nameInput, 'Me')
    .typeText(emailInput, 'test@example.com')
    .typeText(messageInput, 'lorem ipsum')
    .click(submit)
    .expect(Selector('[aria-label="Thank you"]').exists)
    .ok();
});
