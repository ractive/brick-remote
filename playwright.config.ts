import { defineConfig } from "@playwright/test";

// Runs against the production build with the simulated hub ("?fakeHub"), no bluetooth needed
export default defineConfig({
  testDir: "e2e",
  use: {
    baseURL: "http://localhost:4173",
    // Locally use the installed Chrome, CI installs Playwright's chromium
    channel: process.env.CI ? undefined : "chrome",
  },
  webServer: {
    command: "yarn build && yarn preview --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
  },
});
