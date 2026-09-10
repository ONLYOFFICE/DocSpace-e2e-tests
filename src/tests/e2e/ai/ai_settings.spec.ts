import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import AiSettings from "@/src/objects/ai/AiSettings";
import { PaymentApi } from "@/src/api/payment";

// Public MCP server used as the remote end of the integration; the tool names
// are the ones it advertises over MCP.
const MCP_SERVER_URL = "https://mcp.deepwiki.com/mcp";
const MCP_SERVER_TOOLS = [
  "ask_question",
  "read_wiki_contents",
  "read_wiki_structure",
];

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
    await aiSettings.addMcpServer(mcpName, MCP_SERVER_URL);
    await aiSettings.expectMcpServerInList(mcpName);
  });

  test("Custom MCP server exposes its tools", async () => {
    const mcpName = "TestMCP";

    await test.step("Precondition: top up wallet and activate AI features", async () => {
      await paymentApi.setupPayment();
      await paymentApi.makeWalletTopUp();
      await aiSettings.open();
      await aiSettings.activate();
    });

    await test.step("Add the MCP server", async () => {
      await aiSettings.openMcpServersTab();
      await aiSettings.addMcpServer(mcpName, MCP_SERVER_URL);
      await aiSettings.expectMcpServerInList(mcpName);
    });

    await test.step("Server tools are discovered", async () => {
      await aiSettings.expandMcpServer(mcpName);
      await aiSettings.expectMcpServerTools(MCP_SERVER_TOOLS);
    });

    await test.step("Discovered tools are enabled by default", async () => {
      for (const tool of MCP_SERVER_TOOLS) {
        await aiSettings.expectMcpToolEnabled(tool);
      }
    });
  });

  test("Remove custom MCP server", async () => {
    const mcpName = "TestMCP";

    await test.step("Precondition: top up wallet and activate AI features", async () => {
      await paymentApi.setupPayment();
      await paymentApi.makeWalletTopUp();
      await aiSettings.open();
      await aiSettings.activate();
    });

    await test.step("Add the MCP server", async () => {
      await aiSettings.openMcpServersTab();
      await aiSettings.addMcpServer(mcpName, MCP_SERVER_URL);
      await aiSettings.expectMcpServerInList(mcpName);
    });

    await test.step("Clearing the config removes the server", async () => {
      await aiSettings.removeAllMcpServers();
      await aiSettings.expectMcpServerNotInList(mcpName);
    });

    await test.step("The server stays gone after a reload", async () => {
      await aiSettings.openMcpServersTab();
      await aiSettings.expectMcpServerNotInList(mcpName);
    });
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
