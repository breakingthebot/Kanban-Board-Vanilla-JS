// playwright.config.js
// Configures isolated Chromium end-to-end tests against the local development server.
// Connects to: tests/e2e, scripts/dev-server.js, package.json, and GitHub Actions.
// Created: 2026-06-18

import { defineConfig, devices } from "@playwright/test";

const localBrowserPath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const launchOptions = localBrowserPath
  ? { executablePath: localBrowserPath }
  : undefined;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"], launchOptions },
    },
    {
      name: "chromium-mobile",
      use: { ...devices["Pixel 7"], launchOptions },
    },
  ],
  webServer: {
    command: "npm start",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
