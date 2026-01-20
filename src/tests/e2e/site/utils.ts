import { type Page, expect } from "@playwright/test";

const siteRegistrationUrl =
  "https://www.onlyoffice.com/docspace-registration.aspx";

const siteLoginUrl = `${siteRegistrationUrl}#login`;

export const openRegistrationPage = async (page: Page) => {
  await page.goto(siteRegistrationUrl);

  await page.waitForURL(/.*docspace-registration.aspx.*/, {
    waitUntil: "load",
  });

  await page.waitForTimeout(2000);

  await expect(
    page.locator("form, div.registration-form, div.registration-container"),
  ).toBeVisible();
};

export const openLoginPage = async (page: Page) => {
  await page.goto(siteLoginUrl);

  await page.waitForURL(/.*docspace-registration.aspx.*/, {
    waitUntil: "load",
  });

  await page.waitForTimeout(2000);

  // Check for login-specific elements on the page
  await expect(page.locator(".SignInPanel")).toBeVisible();

  // Verify key elements of the login form are present
  await expect(page.locator("#txtSignInEmail")).toBeVisible();
  await expect(page.locator("#txtSignPassword")).toBeVisible();
  await expect(page.locator("#signIn")).toBeVisible();

  // Ensure the welcome text is visible
  await expect(
    page.locator(".SignInPanel h3:has-text('Welcome back to your DocSpace!')"),
  ).toBeVisible();
};

export const openForgotPasswordPage = async (page: Page) => {
  await openLoginPage(page);

  const forgotPasswordBtn = page.locator("#passRestorelink");
  await expect(forgotPasswordBtn).toBeVisible();

  await forgotPasswordBtn.click();

  await page.waitForTimeout(2000);
};
