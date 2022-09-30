import { chromium } from "@playwright/test";
import percySnapshot from "@percy/playwright";

async function run(): Promise<void> {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto("http://localhost:8888");
    await page.waitForSelector("header > figure > picture > img");
    await page.waitForTimeout(5000);

    await percySnapshot(page, "echooff.dev");

    await browser.close();
}

function crash(error: unknown): void {
    console.error(error);
    process.exitCode = 1;
}

run().catch(crash);
