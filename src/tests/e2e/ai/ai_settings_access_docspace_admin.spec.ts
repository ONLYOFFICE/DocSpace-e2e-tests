import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import AiSettings from "@/src/objects/ai/AiSettings";
import Login from "@/src/objects/common/Login";
import { PaymentApi } from "@/src/api/payment";

// Public MCP server used as the remote end of the integration; the tool names
// are the ones it advertises over MCP.
const MCP_SERVER_URL = "https://mcp.deepwiki.com/mcp";
const MCP_SERVER_TOOLS = [
  "ask_wiki_question",
  "read_wiki_contents",
  "read_wiki_structure",
];

test.describe("AI Settings - DocSpace Admin access", () => {
  let aiSettings: AiSettings;
  let login: Login;

  test.beforeEach(async ({ page, api, apiSdk }) => {
    const paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    await paymentApi.setupPayment();
    await paymentApi.makeWalletTopUp();

    const { userData: dsaData } = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );

    aiSettings = new AiSettings(page, api.portalDomain);
    login = new Login(page, api.portalDomain);
    await login.loginWithCredentials(dsaData.email, dsaData.password);
    await aiSettings.open();
    await aiSettings.activate();
  });

  test("DocSpace Admin can add a custom MCP server and see its tools", async () => {
    const mcpName = "TestMCP";

    await test.step("Add the MCP server", async () => {
      await aiSettings.openMcpServersTab();
      await aiSettings.addMcpServer(mcpName, MCP_SERVER_URL);
      await aiSettings.expectMcpServerInList(mcpName);
    });

    await test.step("Server tools are discovered and enabled", async () => {
      await aiSettings.expandMcpServer(mcpName);
      await aiSettings.expectMcpServerTools(MCP_SERVER_TOOLS);
      for (const tool of MCP_SERVER_TOOLS) {
        await aiSettings.expectMcpToolEnabled(tool);
      }
    });

    await test.step("Removing the server clears it from the list", async () => {
      await aiSettings.removeAllMcpServers();
      await aiSettings.expectMcpServerNotInList(mcpName);
    });
  });

  test("DocSpace Admin can view Web search and Knowledge base tabs", async () => {
    await test.step("Web search tab links", async () => {
      await aiSettings.openWebSearchTab();

      const learnMore = await aiSettings.openLinkInNewTab(
        aiSettings.webSearchLearnMoreLink,
      );
      expect(learnMore.url()).toContain("docspace-ai-settings");
      await learnMore.close();

      const pricing = await aiSettings.openLinkInNewTab(
        aiSettings.webSearchPricingLink,
      );
      expect(pricing.url()).toContain("exa.ai/pricing");
      await pricing.close();
    });

    await test.step("Knowledge base tab links", async () => {
      await aiSettings.openKnowledgeTab();

      const learnMore = await aiSettings.openLinkInNewTab(
        aiSettings.knowledgeLearnMoreLink,
      );
      expect(learnMore.url()).toContain("docspace-ai-settings");
      await learnMore.close();

      const pricing = await aiSettings.openLinkInNewTab(
        aiSettings.knowledgePricingLink,
      );
      expect(pricing.url()).toContain("openrouter.ai/openai/text-embedding");
      await pricing.close();
    });
  });
});
