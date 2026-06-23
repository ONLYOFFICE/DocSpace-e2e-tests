import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import AiSettings from "@/src/objects/ai/AiSettings";
import { PaymentApi } from "@/src/api/payment";
import config from "@/config";

test.describe("AI Settings", () => {
  let aiSettings: AiSettings;
  let paymentApi: PaymentApi;

  test.beforeEach(async ({ page, api, login }) => {
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    aiSettings = new AiSettings(page, api.portalDomain);
    await login.loginToPortal();
  });

  // AI settings was redesigned
  test.skip("Add DeepSeek provider", async () => {
    await aiSettings.open();
    await aiSettings.clickAddProviderButton();
    await aiSettings.selectProviderType("DeepSeek");
    await aiSettings.fillProviderTitle("DeepSeek");
    await aiSettings.fillProviderKey(config.DEEPSEEK_API_KEY!);
    await aiSettings.selectFirstAvailableModel();
    await aiSettings.saveProvider();
    await aiSettings.expectProviderInList("DeepSeek");
  });

  test.skip("Add xAI provider", async () => {
    await aiSettings.open();
    await aiSettings.clickAddProviderButton();
    await aiSettings.selectProviderType("xAI");
    await aiSettings.fillProviderTitle("xAI");
    await aiSettings.fillProviderKey(config.XAI_API_KEY!);
    await aiSettings.saveProvider();
    await aiSettings.expectProviderInList("xAI");
  });

  test.skip("Add Google AI provider", async () => {
    await aiSettings.open();
    await aiSettings.clickAddProviderButton();
    await aiSettings.selectProviderType("Google AI");
    await aiSettings.fillProviderTitle("Google AI");
    await aiSettings.fillProviderKey(config.GOOGLE_AI_API_KEY!);
    await aiSettings.selectFirstAvailableModel();
    await aiSettings.saveProvider();
    await aiSettings.expectProviderInList("Google AI");
  });

  test.skip("Add OpenRouter provider", async () => {
    await aiSettings.open();
    await aiSettings.clickAddProviderButton();
    await aiSettings.selectProviderType("OpenRouter");
    await aiSettings.fillProviderTitle("OpenRouter");
    await aiSettings.fillProviderKey(config.OPENROUTER_API_KEY!);
    await aiSettings.selectFirstAvailableModel();
    await aiSettings.saveProvider();
    await aiSettings.expectProviderInList("OpenRouter");
  });

  test.skip("Add OpenAI provider", async () => {
    await aiSettings.open();
    await aiSettings.clickAddProviderButton();
    await aiSettings.selectProviderType("OpenAI");
    await aiSettings.fillProviderTitle("OpenAI");
    await aiSettings.fillProviderKey(config.OPENAI_API_KEY!);
    await aiSettings.saveProvider();
    await aiSettings.expectProviderInList("OpenAI");
  });

  test.skip("Add Anthropic provider", async () => {
    await aiSettings.open();
    await aiSettings.clickAddProviderButton();
    await aiSettings.selectProviderType("Anthropic");
    await aiSettings.fillProviderTitle("Anthropic");
    await aiSettings.fillProviderKey(config.ANTHROPIC_API_KEY!);
    await aiSettings.selectFirstAvailableModel();
    await aiSettings.saveProvider();
    await aiSettings.expectProviderInList("Anthropic");
  });

  test.skip("Add Together AI provider", async () => {
    await aiSettings.open();
    await aiSettings.clickAddProviderButton();
    await aiSettings.selectProviderType("TogetherAI");
    await aiSettings.fillProviderTitle("Together AI");
    await aiSettings.fillProviderKey(config.TOGETHER_AI_API_KEY!);
    await aiSettings.selectFirstAvailableModel();
    await aiSettings.saveProvider();
    await aiSettings.expectProviderInList("Together AI");
  });

  test.skip("Rename AI provider", async () => {
    const initialName = "DeepSeek";
    const newName = "DeepSeek Renamed";

    await test.step("Precondition: add DeepSeek provider", async () => {
      await aiSettings.open();
      await aiSettings.clickAddProviderButton();
      await aiSettings.selectProviderType("DeepSeek");
      await aiSettings.fillProviderTitle(initialName);
      await aiSettings.fillProviderKey(config.DEEPSEEK_API_KEY!);
      await aiSettings.selectFirstAvailableModel();
      await aiSettings.saveProvider();
      await aiSettings.expectProviderInList(initialName);
    });

    await aiSettings.renameProvider(initialName, newName);
    await aiSettings.checkToastMessage("AI provider updated successfully");
    await aiSettings.expectProviderInList(newName);
  });

  test.skip("Delete AI provider", async () => {
    const providerName = "DeepSeek";

    await test.step("Precondition: add DeepSeek provider", async () => {
      await aiSettings.open();
      await aiSettings.clickAddProviderButton();
      await aiSettings.selectProviderType("DeepSeek");
      await aiSettings.fillProviderTitle(providerName);
      await aiSettings.fillProviderKey(config.DEEPSEEK_API_KEY!);
      await aiSettings.selectFirstAvailableModel();
      await aiSettings.saveProvider();
      await aiSettings.expectProviderInList(providerName);
    });

    await aiSettings.openDeleteProviderDialog(providerName);
    await aiSettings.confirmDeleteProvider();
    await aiSettings.expectProviderNotInList(providerName);
  });

  test("Web search tab: switching and links", async () => {
    await test.step("Precondition: top up wallet and activate AI features", async () => {
      await paymentApi.setupPayment();
      await paymentApi.makeWalletTopUp();
      await aiSettings.open();
      await aiSettings.activate();
    });

    await aiSettings.openWebSearchTab();

    await test.step("Learn more link opens the help center article", async () => {
      const learnMore = await aiSettings.openLinkInNewTab(
        aiSettings.webSearchLearnMoreLink,
      );
      expect(learnMore.url()).toContain("docspace-ai-settings");
      await learnMore.close();
    });

    await test.step("Engine pricing link opens the Exa pricing page", async () => {
      const pricing = await aiSettings.openLinkInNewTab(
        aiSettings.webSearchPricingLink,
      );
      expect(pricing.url()).toContain("exa.ai/pricing");
      await pricing.close();
    });
  });

  test("Add custom MCP server", async () => {
    const mcpName = "TestMCP";

    await test.step("Precondition: top up wallet and activate AI features", async () => {
      await paymentApi.setupPayment();
      await paymentApi.makeWalletTopUp();
      await aiSettings.open();
      await aiSettings.activate();
    });

    await aiSettings.openMcpServersTab();
    await aiSettings.clickAddMcpServerButton();
    await aiSettings.fillMcpServerName(mcpName);
    await aiSettings.fillMcpServerUrl("https://mcp.deepwiki.com/mcp");
    await aiSettings.fillMcpServerDescription("MCP server added by e2e test");
    await aiSettings.saveMcpServer();
    await aiSettings.expectMcpServerInList(mcpName);
  });

  test("Knowledge base tab: switching and links", async () => {
    await test.step("Precondition: top up wallet and activate AI features", async () => {
      await paymentApi.setupPayment();
      await paymentApi.makeWalletTopUp();
      await aiSettings.open();
      await aiSettings.activate();
    });

    await aiSettings.openKnowledgeTab();

    await test.step("Learn more link opens the help center article", async () => {
      const learnMore = await aiSettings.openLinkInNewTab(
        aiSettings.knowledgeLearnMoreLink,
      );
      expect(learnMore.url()).toContain("docspace-ai-settings");
      await learnMore.close();
    });

    await test.step("Vectorization model link opens the OpenRouter page", async () => {
      const pricing = await aiSettings.openLinkInNewTab(
        aiSettings.knowledgePricingLink,
      );
      expect(pricing.url()).toContain("openrouter.ai/openai/text-embedding");
      await pricing.close();
    });
  });
});
