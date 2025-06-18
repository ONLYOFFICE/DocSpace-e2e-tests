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
  use: {
    headless: true,
    screenshot: { mode: "only-on-failure", fullPage: true },
    video: "off",
    browserName: "chromium", // You can change this to "firefox" or "webkit"
    trace: "on-first-retry", // Enables trace
    // ...(config.IS_MOBILE && config.DEVICE
    //   ? {
    //       ...devices[config.DEVICE],
    //     }
    //   : {}),
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1024 },
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
  timeout: 90000,
});
