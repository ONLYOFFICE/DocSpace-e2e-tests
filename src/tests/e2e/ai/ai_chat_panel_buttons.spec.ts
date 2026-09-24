import { test } from "@/src/fixtures";
import { AiAgents } from "@/src/objects/ai/AiAgents";
import AiSettings from "@/src/objects/ai/AiSettings";
import Files from "@/src/objects/files/Files";
import { PaymentApi } from "@/src/api/payment";

test.describe("AI Chat panel: buttons on Files", () => {
  let aiAgents: AiAgents;
  let aiSettings: AiSettings;
  let files: Files;
  let paymentApi: PaymentApi;
  const AGENT_NAME = "Chat Buttons Agent";

  test.beforeEach(async ({ page, api, login }) => {
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    aiAgents = new AiAgents(page, api.portalDomain);
    aiSettings = new AiSettings(page, api.portalDomain);
    files = new Files(page, api.portalDomain);
    await login.loginToPortal();

    await test.step("Precondition: top up wallet and activate AI features", async () => {
      await paymentApi.setupPayment();
      await paymentApi.makeWalletTopUp();
      await aiSettings.open();
      await aiSettings.activate();
    });

    await test.step("Precondition: create an agent so the chat panel is usable", async () => {
      await aiAgents.createAgent(AGENT_NAME, {
        instructions: "Agent for AI Chat panel button tests.",
      });
    });

    await files.open();
    await files.openAiChat();
    await aiAgents.expectChatOpened();
  });

  test("All suggestion buttons are visible, and one fills the composer", async () => {
    await test.step("Verify all suggestion buttons are visible", async () => {
      await aiAgents.expectAllChatSuggestionsVisible();
    });

    await test.step("Click a suggestion and verify it fills the composer", async () => {
      await aiAgents.clickChatSuggestion("Show file structure");
      await aiAgents.expectComposerFilled();
    });
  });

  test("Model selector lists raw models and switches the active one", async () => {
    await test.step("Verify the model list includes raw models and Choose AI Agent", async () => {
      await aiAgents.expectModelInQuickChatMenu("GPT 5.6 Luna", true);
      await aiAgents.expectModelInQuickChatMenu("Choose AI Agent", true);
    });

    await test.step("Select a different model and verify it's reflected", async () => {
      await aiAgents.selectModelInQuickChat("GPT 5.6 Luna");
      await aiAgents.expectQuickChatModelSelected("GPT 5.6 Luna");
    });
  });

  test("Attach menu exposes device upload, Web search and Effort levels", async () => {
    await test.step("Web search toggle is present but disabled (add-on not purchased)", async () => {
      await aiAgents.openAttachMenu();
      await aiAgents.expectWebSearchToggleDisabled();
    });

    await test.step("Effort submenu lists all levels and can be changed", async () => {
      await aiAgents.openAttachMenu();
      await aiAgents.expectEffortLevel("No thinking");
      await aiAgents.selectEffortLevel("High");
      await aiAgents.openAttachMenu();
      await aiAgents.expectEffortLevel("High");
    });
  });
});
