import { test } from "@/src/fixtures";
import AiAgents from "@/src/objects/ai/AiAgents";
import AiSettings from "@/src/objects/ai/AiSettings";
import Files from "@/src/objects/files/Files";
import { PaymentApi } from "@/src/api/payment";
import { mapInitialDocNames } from "@/src/utils/constants/files";

test.describe("Ask AI on files: agent picker with many agents", () => {
  let aiAgents: AiAgents;
  let aiSettings: AiSettings;
  let files: Files;
  let paymentApi: PaymentApi;
  const AGENT_NAMES = Array.from(
    { length: 8 },
    (_, i) => `Test Agent ${i + 1}`,
  );

  test.beforeEach(async ({ page, api, apiSdk, login }) => {
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    aiAgents = new AiAgents(page, api.portalDomain);
    aiSettings = new AiSettings(page, api.portalDomain);
    files = new Files(page, api.portalDomain);
    await login.loginToPortal();

    await test.step("Precondition: top up wallet and activate AI features", async () => {
      await paymentApi.setupPayment();
      await paymentApi.makeWalletTopUp();
      await aiSettings.open();
      await aiSettings.activate();
    });

    await test.step("Precondition: create more agents than fit without scrolling", async () => {
      for (const name of AGENT_NAMES) {
        await apiSdk.ai.createAgent("owner", {
          title: name,
          prompt: `Instructions for ${name}.`,
        });
      }
    });

    await files.open();
    await files.clickAskAi(mapInitialDocNames.ONLYOFFICE_SAMPLE_DOCUMENT);
  });

  test("Choose AI Agent submenu scrolls when there are more agents than fit", async () => {
    await test.step("Verify the agent submenu is scrollable", async () => {
      await aiAgents.expectQuickChatAgentSubmenuScrollable();
    });
  });
});
