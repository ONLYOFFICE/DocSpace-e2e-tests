import AiAgents from "@/src/objects/ai/AiAgents";
import AiSettings from "@/src/objects/ai/AiSettings";
import { PaymentApi } from "@/src/api/payment";
import { test } from "@/src/fixtures";

const baseName = (title: string) => title.replace(/\.[^.]+$/, "");

test.describe("AI agents: Recent", () => {
  let aiAgents: AiAgents;

  test.beforeEach(async ({ page, api, login }) => {
    aiAgents = new AiAgents(page, api.portalDomain);
    await login.loginToPortal();
    await aiAgents.open();
  });

  test("Recent is empty by default", async () => {
    await test.step("Open Recent from the AI agents sidebar", async () => {
      await aiAgents.openRecentFromNavigation();
    });

    await test.step("Verify Recent sub-item is active", async () => {
      await aiAgents.expectRecentSubItemActive();
    });

    await test.step("Verify Recent empty view is shown", async () => {
      await aiAgents.expectRecentEmptyView();
    });
  });
});

test.describe("AI agents: Recent", () => {
  const AGENT_NAME = "Recent File Agent";
  // GPT reliably calls the document tool; the default DeepSeek model often does not.
  const GENERATION_MODEL = "GPT 5.6 Luna";

  test("Opening a generated file adds it to Recent", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    const aiAgents = new AiAgents(page, api.portalDomain);
    const aiSettings = new AiSettings(page, api.portalDomain);
    const paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);

    await test.step("Precondition: top up wallet and activate AI features", async () => {
      await login.loginToPortal();
      await paymentApi.setupPayment();
      await paymentApi.makeWalletTopUp();
      await aiSettings.open();
      await aiSettings.activate();
    });

    let fileId = 0;
    let fileTitle = "";
    await test.step("Create an agent that generates a document", async () => {
      await aiAgents.createAgent(AGENT_NAME, { model: GENERATION_MODEL });
      const resultStorageId = await apiSdk.folders.getSubfolderIdByTitle(
        "owner",
        aiAgents.getAgentFolderIdFromChat(),
        "Result Storage",
      );
      ({ fileId, fileTitle } = await aiAgents.generateResumeDocument(() =>
        apiSdk.folders.listFiles("owner", resultStorageId),
      ));
    });

    await test.step("Open the generated file in the editor", async () => {
      await aiAgents.openFileInEditor(fileId);
    });

    await test.step("Verify the file appears in the Recent section", async () => {
      await aiAgents.openDirectly();
      await aiAgents.expectFileInRecent(baseName(fileTitle));
    });
  });
});
