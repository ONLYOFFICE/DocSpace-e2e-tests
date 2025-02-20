import { defineConfig } from "@playwright/test";
import config from "./config/config.js";

module.exports = defineConfig({
  testDir: "./tests",
  retries: 0,
  use: {
    headless: true,
    screenshot: "only-on-failure",
    video: "off",
    browserName: "chromium", // You can change this to "firefox" or "webkit"
    trace: 'on-first-retry', // Enables trace
    ...(config.IS_MOBILE ? {
      userAgent: config.MOBILE_USER_AGENT,
      isMobile: config.IS_MOBILE,
      viewport: { 
        width: parseInt(config.VIEW_PORT.split('x')[0]), 
        height: parseInt(config.VIEW_PORT.split('x')[1]) 
      }
    } : {})
  },
});
