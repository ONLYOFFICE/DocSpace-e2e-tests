import { test, expect } from "@playwright/test";
import { openLoginPage, openForgotPasswordPage } from "./utils";

test.describe.skip("Site: Login page", () => {
  test("Render", async ({ page }) => {
    await openLoginPage(page);

    await expect(page).toHaveScreenshot(["site", "login-page-render.png"]);
  });

  test("Fill email and password", async ({ page }) => {
    const wrongEmail = "test";
    const email = "test@gmail.com";
    const wrongPassword = "test";
    const password = "test1234";

    await openLoginPage(page);

    const emailInput = page.locator("#txtSignInEmail");
    const passwordInput = page.locator("#txtSignPassword");

    await expect(emailInput).toBeVisible();
    await emailInput.focus();

    await page.mouse.click(10, 10);

    await expect(page).toHaveScreenshot([
      "site",
      "login-page-filled-email-error.png",
    ]);

    await emailInput.fill(wrongEmail);

    await expect(passwordInput).toBeVisible();
    await passwordInput.fill(wrongPassword);

    await expect(page).toHaveScreenshot([
      "site",
      "login-page-filled-error.png",
    ]);

    await page.mouse.click(10, 10);

    await emailInput.fill(email);
    await passwordInput.fill(password);

    await page.mouse.click(10, 10);

    await expect(page).toHaveScreenshot(["site", "login-page-filled.png"]);

    const passwordToggle = page.locator(".showPass");
    await expect(passwordToggle).toBeVisible();
    await passwordToggle.click();

    await expect(page).toHaveScreenshot([
      "site",
      "login-page-filled-show-password.png",
    ]);

    await expect(emailInput).toHaveValue(email);
    await expect(passwordInput).toHaveValue(password);

    await passwordToggle.click();

    await expect(page).toHaveScreenshot([
      "site",
      "login-page-filled-hide-password.png",
    ]);
  });

  test("Open SignUp", async ({ page }) => {
    await openLoginPage(page);

    const signUpBtn = page.locator("#toSignUp");
    await expect(signUpBtn).toBeVisible();

    await signUpBtn.click();

    await expect(page).toHaveScreenshot(["site", "login-page-sign-up.png"]);
  });

  test("Forgot password", async ({ page }) => {
    await openForgotPasswordPage(page);

    await expect(page).toHaveScreenshot([
      "site",
      "login-page-forgot-password.png",
    ]);
  });
});
