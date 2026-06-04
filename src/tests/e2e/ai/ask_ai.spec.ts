import { test } from "@/src/fixtures";
import AiAgents from "@/src/objects/ai/AiAgents";
import AiSettings from "@/src/objects/ai/AiSettings";
import AiAgentSelector from "@/src/objects/ai/AiAgentSelector";
import MyDocuments from "@/src/objects/files/MyDocuments";
import config from "@/config";
import { mapInitialDocNames } from "@/src/utils/constants/files";

test.describe("Ask AI on files", () => {
  let aiAgents: AiAgents;
  let aiSettings: AiSettings;
  let agentSelector: AiAgentSelector;
  let myDocuments: MyDocuments;
  const AGENT_NAME = "DeepSeek Agent";

  test.beforeEach(async ({ page, api, login }) => {
    aiAgents = new AiAgents(page, api.portalDomain);
    aiSettings = new AiSettings(page, api.portalDomain);
    agentSelector = new AiAgentSelector(page);
    myDocuments = new MyDocuments(page, api.portalDomain);
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
      await aiAgents.fillInstructions("Test agent for Ask AI scenarios.");
      await aiAgents.saveAgent();
      await aiAgents.expectChatOpened();
    });

    await myDocuments.open();
  });

  test("Ask AI on a document opens the agent chat", async () => {
    await test.step("Click Ask AI in the document context menu", async () => {
      await myDocuments.clickAskAi(
        mapInitialDocNames.ONLYOFFICE_SAMPLE_DOCUMENT,
      );
    });

    await test.step("Select the agent in the side panel", async () => {
      await agentSelector.expectOpened();
      await agentSelector.selectAgentAndSubmit(AGENT_NAME);
    });

    await test.step("Verify redirect to the agent chat", async () => {
      await aiAgents.expectChatUrl();
      await aiAgents.expectChatOpened();
    });
  });

  test("Ask AI on a PDF form opens the agent chat with form processing hint", async () => {
    await test.step("Click Ask AI in the form context menu", async () => {
      await myDocuments.clickAskAi(mapInitialDocNames.ONLYOFFICE_SAMPLE_FORM);
    });

    await test.step("Select the agent in the side panel", async () => {
      await agentSelector.expectOpened();
      await agentSelector.selectAgentAndSubmit(AGENT_NAME);
    });

    await test.step("Verify redirect to the agent chat", async () => {
      await aiAgents.expectChatUrl();
      await aiAgents.expectChatOpened();
    });

    await test.step("Verify form processing model hint is shown", async () => {
      await aiAgents.expectFormProcessingHintVisible();
    });

    await test.step("Verify hint is shown in the agent settings", async () => {
      await aiAgents.openEditAgentFromChat();
      await aiAgents.expectFormProcessingHintInEditDialog();
    });
  });
});
