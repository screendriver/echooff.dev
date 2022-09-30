import { test, expect } from "@playwright/test";

test('sends the contact form and shows a "Thank you" message', async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
        document.querySelector("section:nth-of-type(4)")?.scrollIntoView();
    });
    await page.evaluate(() => {
        document.querySelector("section:nth-of-type(6)")?.scrollIntoView();
    });

    await page.waitForTimeout(3_000);

    await page.waitForSelector('text="Send Message"');
    await page.locator('[placeholder="Name"]').fill("My name");
    await page.locator('[placeholder="Email"]').fill("foo@example.com");
    await page.locator('textarea[name="message"]').fill("Lorem ipsum");
    await page.locator('text="Send Message"').click();

    const element = await page.waitForSelector('text="Thank you"');
    expect(await element.isVisible()).toBe(true);
});
