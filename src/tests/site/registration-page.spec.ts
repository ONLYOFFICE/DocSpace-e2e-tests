import { test, expect } from "@playwright/test";
import { openRegistrationPage } from "./utils";

test.describe("Site: Registration page", () => {
  test("Render", async ({ page }) => {
    await openRegistrationPage(page);

    await expect(page).toHaveScreenshot([
      "site",
      "registration-page-render.png",
    ]);
  });

  test("Fill email", async ({ page }) => {
    const email = "test@gmail.com";
    await openRegistrationPage(page);

    const emailInput = page.locator("#txtEmail");
    await expect(emailInput).toBeVisible();
    await emailInput.fill(email);

    await page.mouse.click(10, 10);

    await expect(page).toHaveScreenshot([
      "site",
      "registration-page-email-filled.png",
    ]);

    await expect(emailInput).toHaveValue(email);
  });

  test("Check spam", async ({ page }) => {
    await openRegistrationPage(page);

    const spamLabel = page.locator(
      "label[for='spam'], .custom-checkbox, .checkbox-container",
    );
    await expect(spamLabel).toBeVisible();

    const checkBox = page.locator("#spam");
    await expect(checkBox).toBeAttached();

    await spamLabel.click();

    await page.mouse.click(10, 10);

    await expect(checkBox).toBeChecked();

    await expect(page).toHaveScreenshot([
      "site",
      "registration-page-spam-checked.png",
    ]);
  });

  test("Open SignIn", async ({ page }) => {
    await openRegistrationPage(page);

    const signInBtn = page.locator("#toSignIn");
    await expect(signInBtn).toBeVisible();

    await signInBtn.click();

    await expect(page).toHaveScreenshot([
      "site",
      "registration-page-sign-in.png",
    ]);
  });
});
