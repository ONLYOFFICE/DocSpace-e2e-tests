import { test, expect } from "@playwright/test";
import { openForgotPasswordPage } from "./utils";

test.describe("Site: Forgot password page", () => {
  test("Render", async ({ page }) => {
    await openForgotPasswordPage(page);

    await expect(page).toHaveScreenshot([
      "site",
      "forgot-password-page-render.png",
    ]);
  });

  test("Fill email", async ({ page }) => {
    const email = "test@gmail.com";
    const wrongEmail = "test";
    await openForgotPasswordPage(page);

    const emailInput = page.locator("#passwordRestoreInput");
    await expect(emailInput).toBeVisible();
    await emailInput.focus();

    await page.mouse.click(10, 10);

    await expect(page).toHaveScreenshot([
      "site",
      "forgot-password-page-filled-email-error.png",
    ]);

    await emailInput.fill(wrongEmail);

    await expect(page).toHaveScreenshot([
      "site",
      "forgot-password-page-filled-error.png",
    ]);

    await page.mouse.click(10, 10);

    await emailInput.fill(email);

    await expect(page).toHaveScreenshot([
      "site",
      "forgot-password-page-filled.png",
    ]);

    await expect(emailInput).toHaveValue(email);
  });
});
