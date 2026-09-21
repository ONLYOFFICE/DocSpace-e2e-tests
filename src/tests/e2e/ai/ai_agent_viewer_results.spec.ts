import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import AiAgents from "@/src/objects/ai/AiAgents";
import AiSettings from "@/src/objects/ai/AiSettings";
import { PaymentApi } from "@/src/api/payment";
import { documentContextMenuOption } from "@/src/utils/constants/files";

const AGENT_NAME = "Viewer Result Agent";
// GPT reliably calls the document tool; the default DeepSeek model often does not.
const GENERATION_MODEL = "GPT 5.6 Luna";

// File rows display the title without its extension.
const baseName = (title: string) => title.replace(/\.[^.]+$/, "");

test.describe("AI Agents: Viewer sees generated results", () => {
  let aiAgents: AiAgents;
  let aiSettings: AiSettings;
  let paymentApi: PaymentApi;

  test.beforeEach(async ({ page, api, login }) => {
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    aiAgents = new AiAgents(page, api.portalDomain);
    aiSettings = new AiSettings(page, api.portalDomain);
    await login.loginToPortal();

    await test.step("Precondition: top up wallet and activate AI features", async () => {
      await paymentApi.setupPayment();
      await paymentApi.makeWalletTopUp();
      await aiSettings.open();
      await aiSettings.activate();
    });
  });

  test("Viewer sees the file the owner generated and has no management options for it", async ({
    page,
    apiSdk,
    login,
  }) => {
    let fileTitle = "";

    await test.step("Owner creates the agent and generates a document", async () => {
      await aiAgents.createAgent(AGENT_NAME, { model: GENERATION_MODEL });
      const resultStorageId = await apiSdk.folders.getSubfolderIdByTitle(
        "owner",
        aiAgents.getAgentFolderIdFromChat(),
        "Result Storage",
      );
      ({ fileTitle } = await aiAgents.generateResumeDocument(() =>
        apiSdk.folders.listFiles("owner", resultStorageId),
      ));
    });

    const { userData } = await apiSdk.profiles.addMember("owner", "User");

    await test.step("Owner invites the user to the agent with default (Viewer) access", async () => {
      await aiAgents.openDirectly();
      await aiAgents.inviteUserToAgent(AGENT_NAME, userData.email);
    });

    await test.step("Viewer opens the agent and sees the generated file", async () => {
      // Clear cookies to log out from the owner account
      await page.context().clearCookies();
      await login.loginWithCredentials(userData.email, userData.password);
      await aiAgents.openDirectly();
      await aiAgents.openAgent(AGENT_NAME);
      await aiAgents.expectViewerModeToast();
      await aiAgents.filesTable.checkRowExist(baseName(fileTitle));
    });

    await test.step("Viewer's context menu on the file has no management options", async () => {
      await aiAgents.filesTable.openContextMenuForItem(baseName(fileTitle));

      for (const option of [
        documentContextMenuOption.preview,
        documentContextMenuOption.download,
      ]) {
        await expect(
          aiAgents.filesTable.contextMenu.getItemLocator(option),
        ).toBeVisible();
      }

      for (const option of [
        documentContextMenuOption.edit,
        documentContextMenuOption.share,
        documentContextMenuOption.moveOrCopy,
        documentContextMenuOption.rename,
        documentContextMenuOption.delete,
      ]) {
        await expect(
          aiAgents.filesTable.contextMenu.getItemLocator(option),
        ).not.toBeVisible();
      }

      await aiAgents.filesTable.contextMenu.close();
    });
  });
});
