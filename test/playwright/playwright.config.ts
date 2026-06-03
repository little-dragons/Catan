import { defineConfig, devices } from '@playwright/test'

// https://playwright.dev/docs/test-configuration
export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    reporter: 'html',
    webServer: [
        {
            command: 'bun run dev',
            cwd: '../../client/',
            url: 'http://localhost:5173',
            reuseExistingServer: !process.env.CI
        },
        {
            command: 'bun run dev',
            cwd: '../../server/',
            port: 3000,
            reuseExistingServer: !process.env.CI
        }
    ],
    use: {
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry'
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] }
        }
    ]
})
