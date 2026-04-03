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
});
