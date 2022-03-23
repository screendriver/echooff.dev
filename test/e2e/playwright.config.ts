import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';

function isRunningInContinuousIntegration(): boolean {
    return typeof process.env.CI !== 'undefined';
}

const config: PlaywrightTestConfig = {
    forbidOnly: isRunningInContinuousIntegration(),
    reporter: 'dot',
    projects: [
        {
            name: 'Chromium',
            use: {
                browserName: 'chromium',
            },
        },
        {
            name: 'Firefox',
            use: {
                browserName: 'firefox',
            },
        },
    ],
    use: {
        baseURL: 'http://localhost:8000',
    },
    outputDir: 'target/test-results/',
};

export default config;
