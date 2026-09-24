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
    await test.step("Precondition: seed a file in the agent's Chat outputs folder", async () => {
      await aiAgents.createAgent(AGENT_NAME);
      const resultStorageId = await apiSdk.folders.getSubfolderIdByTitle(
        "owner",
        aiAgents.getAgentFolderIdFromChat(),
        "Chat outputs",
      );
      const fileResponse = await apiSdk.files.createFile(
        "owner",
        resultStorageId,
        { title: "Resume" },
      );
      const file = (await fileResponse.json()).response;
      fileId = file.id;
      fileTitle = file.title;
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
