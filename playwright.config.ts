import { defineConfig } from "@playwright/test";
import { devices } from "@playwright/test";

import dotenv from "dotenv";

dotenv.config();

const rpConfig = {
  // required fields
  apiKey: process.env.RP_API_KEY,
  endpoint: process.env.RP_ENDPOINT,
  project: process.env.RP_PROJECT,
  launch: process.env.RP_LAUNCH,
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

const rpReporter: [string, Record<string, unknown>][] = [];

if (process.env.RP_API_KEY) {
  rpReporter.push(["@reportportal/agent-js-playwright", rpConfig]);
}

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
    ...rpReporter,
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
    /*{
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        viewport: { width: 1440, height: 1024 },
        screenshot: "only-on-failure",
        headless: true,
      },
    },*/

    // {
    //   name: "webkit",
    //   use: {
    //     ...devices["Desktop Safari"],
    //     headless: true,
    //     screenshot: "only-on-failure",
    //     viewport: { width: 1440, height: 1024 },
    //   },
    // },
  ],
  expect: {
    timeout: 20000, // default timeout for expect assertions (toBeVisible, toHaveText, etc.)
  },
  timeout: 240000, // default timeout for test execution
});
