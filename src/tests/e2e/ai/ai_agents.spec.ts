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

  test("Empty providers state", async ({ page }) => {
    await aiAgents.open();
    await aiAgents.expectNoProvidersMessage();

    await aiAgents.goToSettings();
    await aiSettings.expectLoaded();

    await aiSettings.open();
    await aiSettings.openProvidersTab();
    await aiSettings.expectAddProviderButtonVisible();

    await aiSettings.openDirectly();
    await aiSettings.openMcpServersTab();
    await aiSettings.expectAddMcpServerVisible();

    await aiSettings.openWebSearchTab();
    await aiSettings.expectWebSearchSelectVisible();

    await aiSettings.openKnowledgeTab();
    await aiSettings.expectKnowledgeSelectVisible();

    const popupPromise = page.waitForEvent("popup");
    await aiAgents.learnMoreLink.click();
    const popup = await popupPromise;
    await popup.waitForURL(
      /https:\/\/helpcenter\.onlyoffice\.com\/docspace\/configuration\/docspace-ai-settings\.aspx/,
    );
    await popup.close();
  });

  test("Add DeepSeek provider", async () => {
    await aiSettings.openDirectly();
    await aiSettings.clickAddProviderButton();
    await aiSettings.selectProviderType("DeepSeek");
    await aiSettings.fillProviderTitle("DeepSeek");
    await aiSettings.fillProviderKey(config.DEEPSEEK_API_KEY!);
    await aiSettings.saveProvider();
    await aiSettings.expectProviderInList("DeepSeek");
  });

  test("Add xAI provider", async () => {
    await aiSettings.openDirectly();
    await aiSettings.clickAddProviderButton();
    await aiSettings.selectProviderType("xAI");
    await aiSettings.fillProviderTitle("xAI");
    await aiSettings.fillProviderKey(config.XAI_API_KEY!);
    await aiSettings.saveProvider();
    await aiSettings.expectProviderInList("xAI");
  });

  test("Add Google AI provider", async () => {
    await aiSettings.openDirectly();
    await aiSettings.clickAddProviderButton();
    await aiSettings.selectProviderType("Google AI");
    await aiSettings.fillProviderTitle("Google AI");
    await aiSettings.fillProviderKey(config.GOOGLE_AI_API_KEY!);
    await aiSettings.saveProvider();
    await aiSettings.expectProviderInList("Google AI");
  });

  test("Add OpenRouter provider", async () => {
    await aiSettings.openDirectly();
    await aiSettings.clickAddProviderButton();
    await aiSettings.selectProviderType("OpenRouter");
    await aiSettings.fillProviderTitle("OpenRouter");
    await aiSettings.fillProviderKey(config.OPENROUTER_API_KEY!);
    await aiSettings.saveProvider();
    await aiSettings.expectProviderInList("OpenRouter");
  });

  test("Add OpenAI provider", async () => {
    await aiSettings.openDirectly();
    await aiSettings.clickAddProviderButton();
    await aiSettings.selectProviderType("OpenAI");
    await aiSettings.fillProviderTitle("OpenAI");
    await aiSettings.fillProviderKey(config.OPENAI_API_KEY!);
    await aiSettings.saveProvider();
    await aiSettings.expectProviderInList("OpenAI");
  });

  test("Add Anthropic provider", async () => {
    await aiSettings.openDirectly();
    await aiSettings.clickAddProviderButton();
    await aiSettings.selectProviderType("Anthropic");
    await aiSettings.fillProviderTitle("Anthropic");
    await aiSettings.fillProviderKey(config.ANTHROPIC_API_KEY!);
    await aiSettings.saveProvider();
    await aiSettings.expectProviderInList("Anthropic");
  });

  test("Add Together AI provider", async () => {
    await aiSettings.openDirectly();
    await aiSettings.clickAddProviderButton();
    await aiSettings.selectProviderType("TogetherAI");
    await aiSettings.fillProviderTitle("Together AI");
    await aiSettings.fillProviderKey(config.TOGETHER_AI_API_KEY!);
    await aiSettings.saveProvider();
    await aiSettings.expectProviderInList("Together AI");
  });

  test("Configure Exa web search", async () => {
    await test.step("Precondition: add AI provider to enable web search", async () => {
      await aiSettings.openDirectly();
      await aiSettings.clickAddProviderButton();
      await aiSettings.selectProviderType("OpenAI");
      await aiSettings.fillProviderTitle("OpenAI");
      await aiSettings.fillProviderKey(config.OPENAI_API_KEY!);
      await aiSettings.saveProvider();
    });

    await aiSettings.openWebSearchTab();
    await aiSettings.selectWebSearchEngine("Exa");
    await aiSettings.fillWebSearchKey(config.EXA_API_KEY!);
    await aiSettings.saveWebSearch();
    await aiSettings.expectWebSearchSaved();
  });
});
