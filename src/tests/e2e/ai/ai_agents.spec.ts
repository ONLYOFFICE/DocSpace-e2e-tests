import { test } from "@/src/fixtures";
import AiAgents from "@/src/objects/ai/AiAgents";
import AiSettings from "@/src/objects/ai/AiSettings";

test.describe("AI Agents", () => {
  test("Empty providers state", async ({ page, api, login }) => {
    const aiAgents = new AiAgents(page, api.portalDomain);
    const aiSettings = new AiSettings(page, api.portalDomain);

    await login.loginToPortal();

    await test.step("Open AI Agents from navigation menu", async () => {
      await aiAgents.open();
    });

    await test.step("Empty state shows no providers", async () => {
      await aiAgents.expectNoProvidersMessage();
    });

    await test.step("Navigate to AI settings from empty state", async () => {
      await aiAgents.goToSettings();
      await aiSettings.expectLoaded();
    });

    await test.step("AI Provider tab shows Add AI provider button", async () => {
      await aiSettings.open();
      await aiSettings.openProvidersTab();
      await aiSettings.expectAddProviderButtonVisible();
    });

    await test.step("MCP Servers tab shows disabled Add MCP Server button", async () => {
      await aiSettings.openDirectly();
      await aiSettings.openMcpServersTab();
      await aiSettings.expectAddMcpServerVisible();
    });

    await test.step("Web Search tab shows disabled provider selector", async () => {
      await aiSettings.openWebSearchTab();
      await aiSettings.expectWebSearchSelectVisible();
    });

    await test.step("Knowledge tab shows disabled source selector", async () => {
      await aiSettings.openKnowledgeTab();
      await aiSettings.expectKnowledgeSelectVisible();
    });

    await test.step("Open Learn more guide", async () => {
      const popupPromise = page.waitForEvent("popup");
      await aiAgents.learnMoreLink.click();
      const popup = await popupPromise;
      await popup.waitForURL(
        /https:\/\/helpcenter\.onlyoffice\.com\/docspace\/configuration\/docspace-ai-settings\.aspx/,
      );
      await popup.close();
    });
  });
});
