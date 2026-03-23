import { test } from "@/src/fixtures";
import config, { getPortalUrl } from "@/config";
import Login from "@/src/objects/common/Login";

test.describe("Portal: Login page", () => {
  let login: Login;

  test.beforeEach(async ({ page, api }) => {
    login = new Login(page, api.portalDomain);
  });

  test("Empty login data", async ({ page, api }) => {
    await test.step("Open login page", async () => {
      await page.goto(`${getPortalUrl(api.portalDomain)}/login`, {
        waitUntil: "load",
      });
    });

    await test.step("Click login with empty fields", async () => {
      await login.emailInput.waitFor({ state: "visible" });
      await login.passwordInput.waitFor({ state: "visible" });
      await login.loginButton.click();
    });
  });

  test("Forgot password", async ({ page, api }) => {
    await test.step("Open login page", async () => {
      await page.goto(`${getPortalUrl(api.portalDomain)}/login`, {
        waitUntil: "load",
      });
    });

    await test.step("Reset password", async () => {
      await login.resetPassword(config.DOCSPACE_OWNER_EMAIL);
      await login.removeToast(
        `If a user with the ${config.DOCSPACE_OWNER_EMAIL} email exists, the password change instruction has been sent to this email address.`,
      );
    });
  });

  test("Wrong login data", async ({ page, api }) => {
    await test.step("Open login page", async () => {
      await page.goto(`${getPortalUrl(api.portalDomain)}/login`, {
        waitUntil: "load",
      });
    });

    await test.step("Enter wrong credentials", async () => {
      await login.emailInput.fill("wronguser@example.com");
      await login.passwordInput.fill("wrongpassword123");
      await login.loginButton.click();
    });
  });

  test("Social networks panel", async ({ page, api }) => {
    await test.step("Open login page", async () => {
      await page.goto(`${getPortalUrl(api.portalDomain)}/login`, {
        waitUntil: "load",
      });
    });

    await test.step("Open and close social panel", async () => {
      await login.openSocialPanel();
      await login.closeSocialPanel();
    });
  });
});
