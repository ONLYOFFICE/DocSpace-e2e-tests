import { test } from "@/src/fixtures";
import { AiAgents } from "@/src/objects/ai/AiAgents";
import AiSettings from "@/src/objects/ai/AiSettings";
import Files from "@/src/objects/files/Files";
import { PaymentApi } from "@/src/api/payment";

test.describe("AI Chat panel: model list follows AI Settings", () => {
  let aiAgents: AiAgents;
  let aiSettings: AiSettings;
  let files: Files;
  let paymentApi: PaymentApi;
  const AGENT_NAME = "Model Settings Dependency Agent";
  const MODEL_NAME = "Gemini 3.7 Flash";

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
        instructions: "Agent for AI Chat model-settings dependency tests.",
      });
    });
  });

  test("Disabling a model in AI Settings removes it from the chat's model list", async () => {
    await test.step("Verify the model is offered in the chat by default", async () => {
      await files.open();
      await files.openAiChat();
      await aiAgents.expectChatOpened();
      await aiAgents.expectModelInQuickChatMenu(MODEL_NAME, true);
    });

    await test.step("Disable the model in AI Settings", async () => {
      await aiSettings.openModelsTab();
      await aiSettings.setModelEnabled(MODEL_NAME, false);
      await aiSettings.expectModelEnabled(MODEL_NAME, false);
    });

    await test.step("Verify the model no longer appears in the chat's model list", async () => {
      await files.open();
      await files.openAiChat();
      await aiAgents.expectChatOpened();
      await aiAgents.expectModelInQuickChatMenu(MODEL_NAME, false);
    });

    await test.step("Re-enable the model and verify it's offered again", async () => {
      await aiSettings.openModelsTab();
      await aiSettings.setModelEnabled(MODEL_NAME, true);
      await aiSettings.expectModelEnabled(MODEL_NAME, true);

      await files.open();
      await files.openAiChat();
      await aiAgents.expectChatOpened();
      await aiAgents.expectModelInQuickChatMenu(MODEL_NAME, true);
    });
  });
});
