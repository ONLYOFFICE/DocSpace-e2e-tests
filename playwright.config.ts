import { defineConfig } from "@playwright/test";
import { devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/tests",
  retries: 0,
  workers: 5,

  // Ignore tests in the site directory
  testIgnore: ["**/site/**/*.spec.ts"],
  // Directory for screenshots
  outputDir: "./test-output",
  // Proper snapshot path template with placeholders and file extension
  snapshotPathTemplate: "./screenshots/{projectName}/{arg}{ext}",
  reporter: [
    [
      "html",
      {
        outputFolder: "./playwright-report",
        open: "never",
      },
    ],
  ],
  projects: [
    {
      name: "chromium",
      use: {
        headless: true,
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1024 },
        screenshot: "only-on-failure",
      },
    },
    /*     {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },  */
  ],
  timeout: 120000,
});
