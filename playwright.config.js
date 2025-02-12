import { defineConfig } from "@playwright/test";

module.exports = defineConfig({
  testDir: "./tests",
  retries: 0,
  use: {
    headless: false,
    screenshot: "only-on-failure",
    video: "off",
    browserName: "chromium", // You can change this to "firefox" or "webkit"
  },
});
