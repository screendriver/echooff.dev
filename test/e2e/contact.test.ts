import { Selector, RequestLogger } from 'testcafe';

const url = 'http://localhost:9000';
const contactFormUrl = 'http://localhost:3000/contact-form';

const logger = RequestLogger(
    { url: contactFormUrl, method: 'POST', isAjax: true },
    {
        logRequestHeaders: true,
        logRequestBody: true,
        stringifyRequestBody: true,
    },
);

fixture('Contact form').page(url).requestHooks(logger);

test('show "Thank you" message after submitting contact form', async (t) => {
    const nameInput = Selector('input[placeholder="Name"]');
    const emailInput = Selector('input[placeholder="Email"]');
    const messageInput = Selector('textarea[placeholder="Message"]');
    const submit = Selector('input[type="submit"]').withAttribute('value', 'Send Message');
    await t
        .typeText(nameInput, 'Me')
        .typeText(emailInput, 'test@example.com')
        .typeText(messageInput, 'lorem ipsum')
        .click(submit)
        .expect(Selector('[aria-label="Thank you"]').exists)
        .ok();

    const logRecord = logger.requests[0];
    const headers = logRecord.request.headers;
    await t
        .expect(headers['content-type'])
        .eql('application/x-www-form-urlencoded')
        .expect(logRecord.request.body)
        .eql('name=Me&email=test%40example.com&message=lorem+ipsum&form-name=contact');
});
