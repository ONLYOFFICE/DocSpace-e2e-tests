import { test } from "@/src/fixtures";
import AiSettings from "@/src/objects/ai/AiSettings";
import config from "@/config";

test.describe("AI Settings", () => {
  let aiSettings: AiSettings;

  test.beforeEach(async ({ page, api, login }) => {
    aiSettings = new AiSettings(page, api.portalDomain);
    await login.loginToPortal();
  });

  test("Add DeepSeek provider", async () => {
    await aiSettings.open();
    await aiSettings.clickAddProviderButton();
    await aiSettings.selectProviderType("DeepSeek");
    await aiSettings.fillProviderTitle("DeepSeek");
    await aiSettings.fillProviderKey(config.DEEPSEEK_API_KEY!);
    await aiSettings.selectFirstAvailableModel();
    await aiSettings.saveProvider();
    await aiSettings.expectProviderInList("DeepSeek");
  });

  test("Add xAI provider", async () => {
    await aiSettings.open();
    await aiSettings.clickAddProviderButton();
    await aiSettings.selectProviderType("xAI");
    await aiSettings.fillProviderTitle("xAI");
    await aiSettings.fillProviderKey(config.XAI_API_KEY!);
    await aiSettings.saveProvider();
    await aiSettings.expectProviderInList("xAI");
  });

  test("Add Google AI provider", async () => {
    await aiSettings.open();
    await aiSettings.clickAddProviderButton();
    await aiSettings.selectProviderType("Google AI");
    await aiSettings.fillProviderTitle("Google AI");
    await aiSettings.fillProviderKey(config.GOOGLE_AI_API_KEY!);
    await aiSettings.saveProvider();
    await aiSettings.expectProviderInList("Google AI");
  });

  test("Add OpenRouter provider", async () => {
    await aiSettings.open();
    await aiSettings.clickAddProviderButton();
    await aiSettings.selectProviderType("OpenRouter");
    await aiSettings.fillProviderTitle("OpenRouter");
    await aiSettings.fillProviderKey(config.OPENROUTER_API_KEY!);
    await aiSettings.saveProvider();
    await aiSettings.expectProviderInList("OpenRouter");
  });

  test("Add OpenAI provider", async () => {
    await aiSettings.open();
    await aiSettings.clickAddProviderButton();
    await aiSettings.selectProviderType("OpenAI");
    await aiSettings.fillProviderTitle("OpenAI");
    await aiSettings.fillProviderKey(config.OPENAI_API_KEY!);
    await aiSettings.saveProvider();
    await aiSettings.expectProviderInList("OpenAI");
  });

  test("Add Anthropic provider", async () => {
    await aiSettings.open();
    await aiSettings.clickAddProviderButton();
    await aiSettings.selectProviderType("Anthropic");
    await aiSettings.fillProviderTitle("Anthropic");
    await aiSettings.fillProviderKey(config.ANTHROPIC_API_KEY!);
    await aiSettings.saveProvider();
    await aiSettings.expectProviderInList("Anthropic");
  });

  test("Add Together AI provider", async () => {
    await aiSettings.open();
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

  test("Add custom MCP server", async ({ page }) => {
    const mcpName = "TestMCP";

    await test.step("Precondition: add AI provider to enable MCP servers", async () => {
      await aiSettings.open();
      await aiSettings.clickAddProviderButton();
      await page.waitForTimeout(3000);
      await aiSettings.selectProviderType("OpenAI");
      await aiSettings.fillProviderTitle("OpenAI");
      await aiSettings.fillProviderKey(config.OPENAI_API_KEY!);
      await aiSettings.saveProvider();
      await aiSettings.expectProviderInList("OpenAI");
    });

    await aiSettings.openMcpServersTab();
    await aiSettings.clickAddMcpServerButton();
    await aiSettings.fillMcpServerName(mcpName);
    await aiSettings.fillMcpServerUrl("https://mcp.deepwiki.com/mcp");
    await aiSettings.fillMcpServerDescription("MCP server added by e2e test");
    await aiSettings.saveMcpServer();
    await aiSettings.expectMcpServerInList(mcpName);
  });

  test("Configure Knowledge base", async () => {
    await test.step("Precondition: add DeepSeek provider to enable knowledge base", async () => {
      await aiSettings.open();
      await aiSettings.clickAddProviderButton();
      await aiSettings.selectProviderType("DeepSeek");
      await aiSettings.fillProviderTitle("DeepSeek");
      await aiSettings.fillProviderKey(config.DEEPSEEK_API_KEY!);
      await aiSettings.saveProvider();
      await aiSettings.expectProviderInList("DeepSeek");
    });

    await aiSettings.openKnowledgeTab();
    await aiSettings.selectKnowledgeProvider("OpenAI");
    await aiSettings.fillKnowledgeKey(config.OPENAI_API_KEY!);
    await aiSettings.saveKnowledge();
    await aiSettings.expectKnowledgeSaved();
  });
});
