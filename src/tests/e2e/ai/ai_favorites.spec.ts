import AiAgents from "@/src/objects/ai/AiAgents";
import AiSettings from "@/src/objects/ai/AiSettings";
import { PaymentApi } from "@/src/api/payment";
import { test } from "@/src/fixtures";

const baseName = (title: string) => title.replace(/\.[^.]+$/, "");

test.describe("AI agents: Favorites", () => {
  let aiAgents: AiAgents;

  test.beforeEach(async ({ page, api, login }) => {
    aiAgents = new AiAgents(page, api.portalDomain);
    await login.loginToPortal();
    await aiAgents.open();
  });

  test("Favorites is empty by default", async () => {
    await test.step("Open Favorites from the AI agents sidebar", async () => {
      await aiAgents.openFavoritesFromNavigation();
    });

    await test.step("Verify Favorites sub-item is active", async () => {
      await aiAgents.expectFavoritesSubItemActive();
    });

    await test.step("Verify Favorites empty view is shown", async () => {
      await aiAgents.expectFavoritesEmptyView();
    });
  });
});

test.describe("AI agents: Favorites", () => {
  const AGENT_NAME = "Favorite File Agent";

  test("Starring a generated file adds it to Favorites", async ({
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
      fileTitle = (await fileResponse.json()).response.title;
    });

    await test.step("Mark the generated file as favorite from Result Storage", async () => {
      await aiAgents.openResultStorageTab();
      await aiAgents.filesTable.markAsFavorite(baseName(fileTitle));
    });

    await test.step("Verify the file appears in the Favorites section", async () => {
      await aiAgents.openDirectly();
      await aiAgents.expectFileInFavorites(baseName(fileTitle));
    });
  });
});
