import { defineConfig, devices } from '@playwright/test';


// https://playwright.dev/docs/test-configuration
export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    reporter: 'html',

    webServer: [
        {
            command: 'npm run dev',
            cwd: '../../client/',
            url: 'http://localhost:5173',
            reuseExistingServer: !process.env.CI,
        },
        {
            command: 'npm run dev',
            cwd: '../../server/',
            port: 3000,
            reuseExistingServer: !process.env.CI,
        }
    ],

    use: {
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
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

        // This was too cumbersome to get to run on my local machine.
        // {
        //   name: 'webkit',
        //   use: { ...devices['Desktop Safari'] },
        // },

        /* Test against mobile viewports. */
        // {
        //   name: 'Mobile Chrome',
        //   use: { ...devices['Pixel 5'] },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: { ...devices['iPhone 12'] },
        // },

        /* Test against branded browsers. */
        // {
        //   name: 'Microsoft Edge',
        //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
        // },
        // {
        //   name: 'Google Chrome',
        //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
        // },
    ]
});
