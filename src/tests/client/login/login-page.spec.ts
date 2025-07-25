import { test, Page } from "@playwright/test";
import config from "@/config";
import API from "@/src/api";
import Screenshot from "@/src/objects/common/Screenshot";
import Login from "@/src/objects/common/Login";

test.describe(() => {
  let api: API;
  let page: Page;
  let screenshot: Screenshot;
  let portalDomain: string;
  let login: Login;

  test.beforeAll(async ({ playwright, browser }) => {
    const apiContext = await playwright.request.newContext();
    api = new API(apiContext);
    await api.setup();
    console.log(api.portalDomain);
    portalDomain = api.portalDomain;

    page = await browser.newPage();

    await page.addInitScript(() => {
      globalThis.localStorage?.setItem("integrationUITests", "true");
    });

    screenshot = new Screenshot(page, { screenshotDir: "login_page" });
    login = new Login(page, portalDomain);
  });

  test("Login page", async () => {
    await test.step("OpenLoginPage", async () => {
        await page.goto(`https://${portalDomain}/login`, { waitUntil: "networkidle" });
        await screenshot.expectHaveScreenshot("login_page");
    });

    await test.step("EmptyLoginData", async () => {
        await login.emailInput.waitFor({ state: "visible" });
        await login.passwordInput.waitFor({ state: "visible" });
      
        await login.loginButton.click();
        await screenshot.expectHaveScreenshot("empty_login_data");
    });

    await test.step("ForgotPassword", async () => {
      await login.resetPassword(config.DOCSPACE_ADMIN_EMAIL);
      await login.removeToast(`If a user with the ${config.DOCSPACE_ADMIN_EMAIL} email exists, the password change instruction has been sent to this email address.`);
    });

    await test.step("WrongLoginData", async () => {
        await login.emailInput.waitFor({ state: "visible" });
        await login.passwordInput.waitFor({ state: "visible" });
      
        await login.emailInput.fill("wronguser@example.com");
        await login.passwordInput.fill("wrongpassword123");
      
        await login.loginButton.click();
        await screenshot.expectHaveScreenshot("wrong_login_data");
    });

    await test.step("OpenPanelWithSocialNetworks", async () => {
        await login.openSocialPanel();
        await screenshot.expectHaveScreenshot("social_panel_opened");
        await login.closeSocialPanel();
        await screenshot.expectHaveScreenshot("social_panel_closed");
    });

    
  });

  test.afterAll(async () => {
    await api.cleanup();
    await page.close();
  });
});