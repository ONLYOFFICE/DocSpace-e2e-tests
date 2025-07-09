import { defineConfig } from "@playwright/test";
import { devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/tests",
  retries: 0,
  workers: 3,

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
    ["junit", { outputFile: "./playwright-report/test-results.xml" }],
  ],
  use: {
    trace: "retain-on-failure",
  },

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
  expect: {
    timeout: 20000, // default timeout for expect assertions (toBeVisible, toHaveText, etc.)
  },
  timeout: 180000, // default timeout for test execution
});
