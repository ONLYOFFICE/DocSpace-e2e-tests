import { defineConfig } from "@playwright/test";
import { devices } from "@playwright/test";
import config from "./config/config.js";

export default defineConfig({
  testDir: "./tests",
  retries: 0,
  use: {
    headless: true,
    screenshot: "only-on-failure",
    video: "off",
    browserName: "chromium", // You can change this to "firefox" or "webkit"
    trace: "on-first-retry", // Enables trace
    ...(config.IS_MOBILE
      ? {
          ...devices["Pixel 5"],
        }
      : {}),
  },
});