import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://mpp-barberapp.test';
const useInternalServer = process.env.PLAYWRIGHT_USE_INTERNAL_SERVER === '1';

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [['list']],
    use: {
        baseURL,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
    ],
    ...(useInternalServer
        ? {
            webServer: {
                command: 'npm run build && php artisan serve --host 127.0.0.1 --port 8000',
                url: 'http://127.0.0.1:8000',
                reuseExistingServer: !process.env.CI,
                timeout: 120000,
            },
        }
        : {}),
});

