import { test } from "@/src/fixtures";
import EmbedSDK from "@/src/objects/settings/developerTools/EmbedSDK";

test.describe("Embed SDK tests", () => {
  let embedSDK: EmbedSDK;

  test.beforeEach(async ({ page, login }) => {
    embedSDK = new EmbedSDK(page);

    await login.loginToPortal();
    await embedSDK.open();
  });

  test("Add allowed domain", async () => {
    await embedSDK.addAllowedDomain("https://example.com");
    await embedSDK.checkDomainVisible("https://example.com");
  });
});
