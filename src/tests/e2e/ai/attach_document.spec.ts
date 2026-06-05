import { test } from "@/src/fixtures";
import AiAgents from "@/src/objects/ai/AiAgents";
import AiSettings from "@/src/objects/ai/AiSettings";
import ChatAttachmentPanel from "@/src/objects/ai/ChatAttachmentPanel";
import config from "@/config";
import { mapInitialDocNames } from "@/src/utils/constants/files";

test.describe("AI Agents: attach document", () => {
  let aiAgents: AiAgents;
  let aiSettings: AiSettings;
  let attachmentPanel: ChatAttachmentPanel;
  const AGENT_NAME = "DeepSeek Agent";
  const DOCUMENT = mapInitialDocNames.ONLYOFFICE_SAMPLE_DOCUMENT;

  test.beforeEach(async ({ page, api, login }) => {
    aiAgents = new AiAgents(page, api.portalDomain);
    aiSettings = new AiSettings(page, api.portalDomain);
    attachmentPanel = new ChatAttachmentPanel(page);
    await login.loginToPortal();

    await test.step("Precondition: add DeepSeek provider", async () => {
      await aiSettings.open();
      await aiSettings.clickAddProviderButton();
      await aiSettings.selectProviderType("DeepSeek");
      await aiSettings.fillProviderTitle("DeepSeek");
      await aiSettings.fillProviderKey(config.DEEPSEEK_API_KEY!);
      await aiSettings.selectFirstAvailableModel();
      await aiSettings.saveProvider();
      await aiSettings.expectProviderInList("DeepSeek");
    });

    await test.step("Precondition: create AI agent", async () => {
      await aiAgents.openDirectly();
      await aiAgents.openCreateAgentDialog();
      await aiAgents.fillAgentName(AGENT_NAME);
      await aiAgents.selectProvider("DeepSeek");
      await aiAgents.fillInstructions("Test agent for attachment scenarios.");
      await aiAgents.saveAgent();
    });
  });

  test("Attach a document from My Documents to the agent chat", async () => {
    await test.step("Open the agent chat", async () => {
      await aiAgents.openAndExpectAgentInList(AGENT_NAME);
      await aiAgents.openAgent(AGENT_NAME);
      await aiAgents.expectChatOpened();
    });

    await test.step("Open the attachment files selector", async () => {
      await aiAgents.openAttachmentPanel();
    });

    await test.step("Open My Documents", async () => {
      await attachmentPanel.openFolder("My documents");
    });

    await test.step("Search for a non-existent file shows no results", async () => {
      await attachmentPanel.search("non-existent-file-xyz");
      await attachmentPanel.expectNoResults();
    });

    await test.step("Clear search and pick a real document", async () => {
      await attachmentPanel.search("");
      await attachmentPanel.selectFile(DOCUMENT);
      await attachmentPanel.add();
    });

    await test.step("Verify the document is attached to the chat", async () => {
      await aiAgents.expectAttachedFile(DOCUMENT);
    });
  });
});
