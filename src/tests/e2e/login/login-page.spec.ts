import { test, Page } from "@playwright/test";
import config from "@/config";
import API from "@/src/api";
import Login from "@/src/objects/common/Login";

test.describe(() => {
  let api: API;
  let page: Page;
  let portalDomain: string;
  let login: Login;

  test.beforeAll(async ({ playwright, browser }) => {
    const ownerContext = await playwright.request.newContext();
    const userContext = await playwright.request.newContext();
    api = new API(ownerContext, userContext);
    await api.setup();
    console.log(api.portalDomain);
    portalDomain = api.portalDomain;

    page = await browser.newPage();

    await page.addInitScript(() => {
      globalThis.localStorage?.setItem("integrationUITests", "true");
    });

    login = new Login(page, portalDomain);
  });

  test.skip("Login page", async () => {
    await test.step("OpenLoginPage", async () => {
      await page.goto(`https://${portalDomain}/login`, {
        waitUntil: "load",
      });
    });

    await test.step("EmptyLoginData", async () => {
      await login.emailInput.waitFor({ state: "visible" });
      await login.passwordInput.waitFor({ state: "visible" });

      await login.loginButton.click();
    });

    await test.step("ForgotPassword", async () => {
      await login.resetPassword(config.DOCSPACE_OWNER_EMAIL);
      await login.removeToast(
        `If a user with the ${config.DOCSPACE_OWNER_EMAIL} email exists, the password change instruction has been sent to this email address.`,
      );
    });

    await test.step("WrongLoginData", async () => {
      await login.emailInput.waitFor({ state: "visible" });
      await login.passwordInput.waitFor({ state: "visible" });

      await login.emailInput.fill("wronguser@example.com");
      await login.passwordInput.fill("wrongpassword123");

      await login.loginButton.click();
    });

    await test.step("OpenPanelWithSocialNetworks", async () => {
      await login.openSocialPanel();
      await login.closeSocialPanel();
    });
  });

  test.afterAll(async () => {
    await api.cleanup();
    await page.close();
  });
});
