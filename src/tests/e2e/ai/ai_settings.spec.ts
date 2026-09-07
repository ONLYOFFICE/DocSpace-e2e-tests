import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import AiSettings from "@/src/objects/ai/AiSettings";
import { PaymentApi } from "@/src/api/payment";

test.describe("AI Settings", () => {
  let aiSettings: AiSettings;
  let paymentApi: PaymentApi;

  test.beforeEach(async ({ page, api, login }) => {
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    aiSettings = new AiSettings(page, api.portalDomain);
    await login.loginToPortal();
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
    await aiSettings.addMcpServer(mcpName, "https://mcp.deepwiki.com/mcp");
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
