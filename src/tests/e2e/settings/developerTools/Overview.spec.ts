import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import Overview from "@/src/objects/settings/developerTools/Overview";

test.describe("Overview tests", () => {
  let overview: Overview;

  test.beforeEach(async ({ page, login }) => {
    overview = new Overview(page);

    await login.loginToPortal();
    await overview.open();
  });

  test("Overview card links navigate correctly", async ({ page }) => {
    // REST API external link
    const learnMorePromise = page.waitForEvent("popup", { timeout: 30000 });
    await overview.learnMoreLink.click();
    const learnMorePage = await learnMorePromise;
    await expect(learnMorePage).toHaveURL(/api\.onlyoffice\.com/);
    await learnMorePage.close();

    // Embed SDK
    await overview.startEmbeddingLink.click();
    await expect(page).toHaveURL(/javascript-sdk/);
    await overview.open();

    // Plugin SDK
    await overview.readInstructionsLink.click();
    await expect(page).toHaveURL(/plugin-sdk/);
    await overview.open();

    // Webhooks
    await overview.createWebhookLink.click();
    await expect(page).toHaveURL(/webhooks/);
    await page.getByTestId("webhook_cancel_button").first().click();
    await overview.open();

    // OAuth 2.0
    await overview.registerAppLink.click();
    await expect(page).toHaveURL(/oauth/);
    await overview.open();

    // API keys
    await overview.createKeyLink.click();
    await expect(page).toHaveURL(/api-keys/);
  });
});
