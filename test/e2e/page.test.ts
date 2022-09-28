import { test, expect } from '@playwright/test';

const statisticsApiUrl = 'http://localhost:8888/.netlify/functions/github-statistics';

test('page title', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('header > figure > picture > img');
    const title = await page.title();

    expect(title).toBe('Christian Rackerseder - Full-Stack JavaScript Engineer');
});

test('Years of experience', async ({ page }) => {
    await page.goto('/');
    const element = page.locator('[aria-label="Years of experience"]');
    const text = await element.textContent();

    expect(text).toBe('21 yrs');
});

test('GitHub Repos', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
        document.querySelector('section:nth-of-type(4)')?.scrollIntoView();
    });
    await page.waitForResponse(statisticsApiUrl);
    const element = await page.waitForSelector('[aria-label="GitHub Repos"]');
    const text = await element.textContent();

    expect(text).toBe('42');
});

test('GitHub Stars', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
        document.querySelector('section:nth-of-type(4)')?.scrollIntoView();
    });
    await page.waitForResponse(statisticsApiUrl);
    const element = await page.waitForSelector('[aria-label="GitHub Stars"]');
    const text = await element.textContent();

    expect(text).toBe('101');
});
