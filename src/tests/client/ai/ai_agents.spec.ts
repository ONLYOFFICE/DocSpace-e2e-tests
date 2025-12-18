import { test } from "@/src/fixtures";
import AiAgents from "@/src/objects/ai/AiAgents";

test.describe("AI Agents", () => {
  test("Empty providers state", async ({ page, api, login }) => {
    const aiAgents = new AiAgents(page, api.portalDomain);

    await login.loginToPortal();
    await aiAgents.open();

    await test.step("Empty state shows no providers", async () => {
      await aiAgents.expectNoProvidersMessage();
    });

    await test.step("Navigate to AI settings", async () => {
      await aiAgents.goToSettings();
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
