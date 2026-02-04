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

  test("Render oauth", async ({ page }) => {
    await test.step("Render oauth", async () => {
      await oauth.checkUseOAuth();
    });

    await test.step("oauth 2.0 guide link", async () => {
      const page1Promise = page.waitForEvent("popup");
      await oauth.oauthGuideLink.click();
      const page1 = await page1Promise;
      await page1.waitForURL(
        /https:\/\/helpcenter\.onlyoffice\.com\/docspace\/configuration\/.*#oauth(_block)?$/,
      );
      await expect(page1).toHaveURL(
        /https:\/\/helpcenter\.onlyoffice\.com\/docspace\/configuration\/.*#oauth(_block)?$/,
      );
      await page1.close();
    });

    await test.step("New application render", async () => {
      await oauth.newApplicationButton.click();
      await oauth.checkOauthUrls();
    });

    await test.step("Create application", async () => {
      await oauth.createApplication();
      await oauth.checkApplicationName();
      await oauth.hideDate();
    });

    await test.step("Scopes render", async () => {
      await oauth.openScopes.last().click();
      await oauth.hideDate();
      await oauth.backdrop.nth(1).click();
    });

    await test.step("Action menu render", async () => {
      await oauth.oauthActionMenu.click();
    });

    await test.step("Edit application", async () => {
      await oauth.editOAuthApplication();
      await oauth.checkNewApplicationName();
      await oauth.hideDate();
    });

    await test.step("Disable / Enable appliction", async () => {
      await oauth.disableApplication();
      await oauth.hideDate();
      await oauth.enableApplication();
      await oauth.hideDate();
    });

    await test.step("Info panel oauth render", async () => {
      await oauth.openInfoPanel();
      await oauth.hideDateInfoPanel();
    });

    await test.step("Info panel links", async () => {
      const page1Promise = page.waitForEvent("popup");
      await oauth.checkWebsiteUrlInfoPanel();
      const page1 = await page1Promise;
      await page1.waitForURL("https://www.google.com/");
      await expect(page1).toHaveURL(/www.google.com/);
      await page1.close();
      const page2Promise = page.waitForEvent("popup");
      await oauth.checkPrivacyPolicyUrlInfoPanel();
      const page2 = await page2Promise;
      await page2.waitForURL("https://www.google.com/");
      await expect(page2).toHaveURL(/www.google.com/);
      await page2.close();
      const page3Promise = page.waitForEvent("popup");
      await oauth.checkTermsOfServiceUrlInfoPanel();
      const page3 = await page3Promise;
      await page3.waitForURL("https://www.google.com/");
      await expect(page3).toHaveURL(/www.google.com/);
      await page3.close();
    });

    await test.step("Info panel action menu render", async () => {
      await oauth.openInfoPanelActionMenu();
      await oauth.closeInfoPanel.click();
    });

    await test.step("Generate token", async () => {
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

    await test.step("Delete oauth application", async () => {
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
