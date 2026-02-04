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
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 4 : undefined,

  // Ignore tests in the site directory
  testIgnore: ["**/site/**/*.spec.ts"],
  // Directory for screenshots
  outputDir: `./test-output/${process.env.JOB_NAME ?? 'local'}`,
  // Proper snapshot path template with placeholders and file extension
  snapshotPathTemplate: "./screenshots/{projectName}/{arg}{ext}",
  reporter: [
  [
    "html",
    {
      outputFolder: `./playwright-report/${process.env.JOB_NAME ?? 'local'}`,
      open: "never",
    },
  ],
  [
    "junit",
    {
      outputFile: `./playwright-report/${process.env.JOB_NAME ?? 'local'}/test-results.xml`,
    },
  ],
  ...rpReporter,
],
  use: {
    trace: "retain-on-failure",
  },

  projects: [
    {
      name: "api-tests",
      testMatch: "**/api/**/*.spec.ts",
      workers: 1,
    },
    {
      name: "chromium",
      testMatch: "**/e2e/**/*.spec.ts",
      use: {
        headless: true,
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1024 },
        screenshot: "only-on-failure",
      },
    },
    {
      name: "firefox",
      testMatch: "**/e2e/**/*.spec.ts",
      use: {
        ...devices["Desktop Firefox"],
        viewport: { width: 1440, height: 1024 },
        screenshot: "only-on-failure",
        headless: true,
      },
    },

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
    toHaveScreenshot: {
      maxDiffPixels: 5,
    },
    timeout: 20000, // default timeout for expect assertions (toBeVisible, toHaveText, etc.)
  },
  timeout: 240000, // default timeout for test execution
});
