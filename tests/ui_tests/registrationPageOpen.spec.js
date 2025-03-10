import { test, expect } from "@playwright/test";
import config from "../../config/config.js";
import { RegistrationPage } from "../../page_objects/site_registration_page.js";

test("Verify registration page loads", async ({ page }) => {
  const siteUrl = config.TEST_SITE_REGISTRATION_URL;
  await page.goto(siteUrl);
  const registrationPage = new RegistrationPage(page);
  await expect(registrationPage.signUpForm).toBeVisible();
});
