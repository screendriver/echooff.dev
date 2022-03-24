import { chromium } from 'playwright';
import percySnapshot from '@percy/playwright';

async function run(): Promise<void> {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:8000');
    await page.waitForSelector('header > figure > picture > img');

    await percySnapshot(page, 'echooff.dev main');

    await browser.close();
}

function crash(error: unknown): void {
    console.error(error);
    process.exitCode = 1;
}

run().catch(crash);
