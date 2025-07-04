import { defineConfig } from "@playwright/test";
import { devices } from "@playwright/test";

const rpConfig = {
  // required fields
  apiKey:
    "playwright-test_7e7Z-fQoQxyU2tnFoPJvwenhJH5fmubP_Tw-WhfMDtAMOMG4uN7rNwlot_sFP0DS",
  endpoint: "https://reports.onlyoffice.com/api/v2",
  project: "Test",
  launch: "Integration tests",
  // optional fields
  attributes: [
    {
      key: "agent",
      value: "playwright",
    },
    {
      value: "demo",
    },
  ],
  description: "This is an example launch with playwright tests",
  restClientConfig: {
    timeout: 0,
  },
  includeTestSteps: true,
  skippedIssue: false,
};

export default defineConfig({
  testDir: "./src/tests",
  retries: 0,
  workers: 1,

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
    ["@reportportal/agent-js-playwright", rpConfig],
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
    timeout: 10000, // default timeout for expect assertions (toBeVisible, toHaveText, etc.)
  },
  timeout: 180000, // default timeout for test execution
});
