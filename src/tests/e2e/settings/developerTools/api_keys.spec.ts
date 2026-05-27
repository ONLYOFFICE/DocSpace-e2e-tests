import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import ApiKeys from "@/src/objects/settings/developerTools/ApiKeys";

test.describe("API Keys tests", () => {
  let apiKeys: ApiKeys;

  test.beforeEach(async ({ page, login }) => {
    apiKeys = new ApiKeys(page);

    await login.loginToPortal();
    await apiKeys.open();
  });

  test("Create and verify API key", async () => {
    await apiKeys.createApiKey("AutotestKey");
    await apiKeys.checkApiKeyVisible("AutotestKey");
  });

  test("Edit API key name", async () => {
    await apiKeys.createApiKey("AutotestKey");
    await apiKeys.checkApiKeyVisible("AutotestKey");
    await apiKeys.editApiKey("AutotestKeyRenamed");
    await apiKeys.checkApiKeyVisible("AutotestKeyRenamed");
  });

  test("Edit API key permissions", async () => {
    await apiKeys.createApiKey("AutotestKeyPerms");
    await apiKeys.checkApiKeyVisible("AutotestKeyPerms");
    await apiKeys.editApiKeyPermissions([
      "files:read",
      "rooms:read",
      "accounts.self:read",
    ]);
    await apiKeys.checkApiKeyVisible("AutotestKeyPerms");
    await apiKeys.checkPermissionsLabel("Restricted");
  });

  test("Delete API key", async () => {
    await apiKeys.createApiKey("AutotestKeyDelete");
    await apiKeys.checkApiKeyVisible("AutotestKeyDelete");
    await apiKeys.deleteApiKey();
  });

  test("API key grants access to user profile", async ({ api, playwright }) => {
    const apiCtx = await apiKeys.loginAsApiKeyClient(
      playwright,
      api.tokenStore.portalBaseUrl,
      "AutotestKeyLogin",
    );
    const resp = await apiCtx.get("/api/2.0/people/@self");
    expect(resp.status()).toBe(200);
    await apiCtx.dispose();
  });

  test("Deleted API key can no longer access the API", async ({
    api,
    playwright,
  }) => {
    const apiCtx = await apiKeys.loginAsApiKeyClient(
      playwright,
      api.tokenStore.portalBaseUrl,
      "AutotestKeyRevoke",
    );
    expect((await apiCtx.get("/api/2.0/people/@self")).status()).toBe(200);

    await apiKeys.deleteApiKey();

    expect((await apiCtx.get("/api/2.0/people/@self")).status()).toBe(401);
    await apiCtx.dispose();
  });
});
