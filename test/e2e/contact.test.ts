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
});
