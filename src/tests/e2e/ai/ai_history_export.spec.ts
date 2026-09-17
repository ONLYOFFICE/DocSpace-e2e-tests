import { test } from "@/src/fixtures";
import { expect, Page } from "@playwright/test";
import AiAgents from "@/src/objects/ai/AiAgents";
import AiSettings from "@/src/objects/ai/AiSettings";
import RoomInfoPanel from "@/src/objects/rooms/RoomInfoPanel";
import Files from "@/src/objects/files/Files";
import SpreadsheetEditor from "@/src/objects/files/SpreadsheetEditor";
import { PaymentApi } from "@/src/api/payment";
import { documentContextMenuOption } from "@/src/utils/constants/files";

const AGENT_NAME = "History Export Agent";

test.describe("AI Agents: History tab export toolbar", () => {
  let aiAgents: AiAgents;
  let aiSettings: AiSettings;
  let paymentApi: PaymentApi;
  let roomInfoPanel: RoomInfoPanel;
  let agentId: number;

  test.beforeEach(async ({ page, api, login }) => {
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    aiAgents = new AiAgents(page, api.portalDomain);
    aiSettings = new AiSettings(page, api.portalDomain);
    // AI agents are backed by the same room infrastructure as Rooms - the
    // agent's info panel reuses the shared InfoPanel/History tab component.
    roomInfoPanel = new RoomInfoPanel(page);
    await login.loginToPortal();

    await test.step("Precondition: top up wallet and activate AI features", async () => {
      await paymentApi.setupPayment();
      await paymentApi.makeWalletTopUp();
      await aiSettings.open();
      await aiSettings.activate();
    });

    await test.step("Precondition: create AI agent", async () => {
      await aiAgents.openDirectly();
      await aiAgents.openCreateAgentDialog();
      await aiAgents.fillAgentName(AGENT_NAME);
      await aiAgents.fillInstructions(
        "Test agent for history export scenarios.",
      );
      await aiAgents.saveAgent();
      await aiAgents.expectChatOpened();
      agentId = aiAgents.getAgentFolderIdFromChat();
      await aiAgents.openAndExpectAgentInList(AGENT_NAME);
    });

    await test.step("Open the agent's History tab", async () => {
      await aiAgents.openAgentInfo(AGENT_NAME);
      await roomInfoPanel.openTab("History");
    });
  });

  test("Export history: toolbar is visible and the report opens in the editor", async ({
    page,
    api,
  }) => {
    const files = new Files(page, api.portalDomain);
    let reportPage: Page;

    await test.step("Go to date and Export history are visible", async () => {
      await roomInfoPanel.checkHistoryToolbarVisible();
    });

    await test.step("Export the full activity history", async () => {
      reportPage = await roomInfoPanel.exportHistory("All history");
    });

    await test.step("A toast confirms the export", async () => {
      await roomInfoPanel.checkExportHistoryToastVisible();
    });

    await test.step("The report opens automatically in a new tab", async () => {
      const spreadsheet = new SpreadsheetEditor(reportPage);
      await spreadsheet.waitForLoad();
      await expect(reportPage).toHaveTitle(
        new RegExp(`Audit Trail Report \\(room-${agentId}\\)`),
      );
      await reportPage.close();
    });

    // The report is saved to My Documents, not into the agent's Chat outputs
    // (per the "exported to Files" toast). The editor renders it in canvas (no
    // readable cell text via Playwright), so "not empty" is verified via the
    // file's own size in the Properties panel, same as the sync-to-xlsx tests
    // do it.
    await test.step("Exported report is saved with actual data", async () => {
      await files.open();
      await files.filesTable.openContextMenuForItem(
        `Audit Trail Report (room-${agentId})`,
      );
      await files.filesTable.contextMenu.clickOption(
        documentContextMenuOption.select,
      );
      await files.infoPanel.open();
      const size = await files.infoPanel.getSizeInBytes();
      expect(size).toBeGreaterThan(0);
      await files.infoPanel.close();
    });
  });
});
