import { test, expect } from "@playwright/test";
import { RegistrationPage } from "../../page_objects/site_registration_page.js";

test("Verify registration page loads", async ({ page }) => {
  const siteRegistrationUrl =
    "https://www.onlyoffice.com/docspace-registration.aspx";
  await page.goto(siteRegistrationUrl);
  const registrationPage = new RegistrationPage(page);
  await expect(registrationPage.signUpForm).toBeVisible();
});
