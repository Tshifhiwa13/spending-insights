import { defineConfig, devices } from '@playwright/test';

// 127.0.0.1 rather than "localhost": on Windows, "localhost" can point the
// server and the tests at different network addresses, and the tests hang.
const HOST = '127.0.0.1';
const PORT = 4173;
const BASE_URL = `http://${HOST}:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI), // Fail CI if a test.only is left in by mistake.
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry', // Records a step-by-step trace when a test fails in CI.
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
  // Builds the production app and serves it, so the tests run against what users would get.
  webServer: {
    command: `npm run build && npm run preview -- --host ${HOST} --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});