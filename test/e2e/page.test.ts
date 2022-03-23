import { test, expect } from '@playwright/test';

test('page title', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('header > figure > picture > img');
    const title = await page.title();

    expect(title).toBe('Christian Rackerseder - Full-Stack JavaScript Engineer');
});
