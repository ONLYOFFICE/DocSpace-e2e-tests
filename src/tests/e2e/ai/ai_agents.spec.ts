import { test } from "@/src/fixtures";
import AiAgents from "@/src/objects/ai/AiAgents";
import AiSettings from "@/src/objects/ai/AiSettings";
import config from "@/config";

test.describe("AI Agents", () => {
  let aiAgents: AiAgents;
  let aiSettings: AiSettings;

  test.beforeEach(async ({ page, api, login }) => {
    aiAgents = new AiAgents(page, api.portalDomain);
    aiSettings = new AiSettings(page, api.portalDomain);
    await login.loginToPortal();
  });

  test("Empty providers state", async () => {
    await aiAgents.open();
    await aiAgents.expectNoProvidersMessage();

    await aiAgents.goToSettings();
    await aiSettings.expectLoaded();
  });

  test("Create AI agent with DeepSeek provider", async () => {
    const agentName = "DeepSeek Agent";

    await test.step("Precondition: add DeepSeek provider", async () => {
      await aiSettings.open();
      await aiSettings.clickAddProviderButton();
      await aiSettings.selectProviderType("DeepSeek");
      await aiSettings.fillProviderTitle("DeepSeek");
      await aiSettings.fillProviderKey(config.DEEPSEEK_API_KEY!);
      await aiSettings.saveProvider();
      await aiSettings.expectProviderInList("DeepSeek");
    });

    await test.step("Create AI agent", async () => {
      await aiAgents.openDirectly();
      await aiAgents.openCreateAgentDialog();
      await aiAgents.fillAgentName(agentName);
      await aiAgents.selectProvider("DeepSeek");
      await aiAgents.fillInstructions(
        "You are a helpful assistant for DocSpace e2e tests.",
      );
      await aiAgents.saveAgent();
    });

    await test.step("Verify chat with the agent is opened", async () => {
      await aiAgents.expectChatOpened();
    });

    await test.step("Verify agent appears in the list", async () => {
      await aiAgents.openDirectly();
      await aiAgents.expectAgentInList(agentName);
    });
  });
});
