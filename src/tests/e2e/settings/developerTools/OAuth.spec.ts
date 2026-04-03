import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import OAuth from "@/src/objects/settings/developerTools/OAuth";

test.describe("OAuth tests", () => {
  let oauth: OAuth;

  test.beforeEach(async ({ page, login }) => {
    oauth = new OAuth(page);

    await login.loginToPortal();
    await oauth.open();
  });

  test("Render OAuth page and guide link", async ({ page }) => {
    await test.step("OAuth page is rendered", async () => {
      await oauth.checkUseOAuth();
    });

    await test.step("OAuth 2.0 guide link opens", async () => {
      const popupPromise = page.waitForEvent("popup", { timeout: 30000 });
      await oauth.oauthGuideLink.click();
      const popup = await popupPromise;
      await popup.waitForURL(
        /https:\/\/helpcenter\.onlyoffice\.com\/docspace\/configuration\/.*#oauth(_block)?$/,
      );
      await expect(popup).toHaveURL(
        /https:\/\/helpcenter\.onlyoffice\.com\/docspace\/configuration\/.*#oauth(_block)?$/,
      );
      await popup.close();
    });
  });

  test("Create application and info panel", async ({ page }) => {
    await test.step("New application form renders", async () => {
      await oauth.newApplicationButton.click();
      await oauth.checkOauthUrls();
    });

    await test.step("Create application", async () => {
      await oauth.createApplication();
      await oauth.checkApplicationName();
    });

    await test.step("Open info panel", async () => {
      await oauth.openInfoPanel();
    });

    await test.step("Info panel links open correctly", async () => {
      for (const clickFn of [
        () => oauth.checkWebsiteUrlInfoPanel(),
        () => oauth.checkPrivacyPolicyUrlInfoPanel(),
        () => oauth.checkTermsOfServiceUrlInfoPanel(),
      ]) {
        const popupPromise = page.waitForEvent("popup", { timeout: 30000 });
        await clickFn();
        const popup = await popupPromise;
        await popup.waitForURL("https://www.google.com/");
        await expect(popup).toHaveURL(/www.google.com/);
        await popup.close();
      }
    });

    await test.step("Info panel action menu renders", async () => {
      await oauth.openInfoPanelActionMenu();
      await oauth.closeInfoPanel.click();
    });
  });

  test("Edit application", async () => {
    await test.step("Create application", async () => {
      await oauth.newApplicationButton.click();
      await oauth.createApplication();
      await oauth.checkApplicationName();
    });

    await test.step("Edit application name", async () => {
      await oauth.oauthActionMenu.click();
      await oauth.editOAuthApplication();
      await oauth.checkNewApplicationName();
    });
  });

  test("Disable and enable application", async () => {
    await test.step("Create application", async () => {
      await oauth.newApplicationButton.click();
      await oauth.createApplication();
      await oauth.checkApplicationName();
    });

    await test.step("Disable application", async () => {
      await oauth.disableApplication();
    });

    await test.step("Enable application", async () => {
      await oauth.enableApplication();
    });
  });

  test("Generate, copy and revoke token", async ({ page }) => {
    await test.step("Create application", async () => {
      await oauth.newApplicationButton.click();
      await oauth.createApplication();
      await oauth.checkApplicationName();
    });

    await test.step("Generate and copy token", async () => {
      await oauth.generateOauthToken();
      await oauth.hideTokenInfo();
      await oauth.saveGeneratedToken();
      await oauth.copyTokenButton.click();
    });

    await test.step("Revoke token", async () => {
      await oauth.openRevokeOAuthTokenWindow();
      const [response] = await Promise.all([
        page.waitForResponse(
          (resp) =>
            resp.request().method() === "POST" &&
            resp.url().includes("/api/2.0/oauth2/revoke"),
        ),
        oauth.revokeOAuthToken(),
      ]);
      expect(response.status()).toBe(200);
    });
  });

  test("Delete application", async ({ page }) => {
    await test.step("Create application", async () => {
      await oauth.newApplicationButton.click();
      await oauth.createApplication();
      await oauth.checkApplicationName();
    });

    await test.step("Delete application", async () => {
      await oauth.deleteOAuthApplication();
      const [response] = await Promise.all([
        page.waitForResponse(
          (resp) =>
            resp.request().method() === "DELETE" &&
            resp.url().includes("/api/2.0/clients/"),
        ),
        oauth.deleteApplicationOKButton.click(),
      ]);
      expect(response.status()).toBe(200);
    });
  });
});
