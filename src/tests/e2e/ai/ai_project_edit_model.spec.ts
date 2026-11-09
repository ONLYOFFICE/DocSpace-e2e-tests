import { test } from "@/src/fixtures";
import AiAgents from "@/src/objects/ai/AiAgents";
import AiSettings from "@/src/objects/ai/AiSettings";
import { PaymentApi } from "@/src/api/payment";

test.describe("AI Projects: edit an existing project's model", () => {
  let aiAgents: AiAgents;
  let aiSettings: AiSettings;
  let paymentApi: PaymentApi;
  const PROJECT_NAME = "Edit Model Project";
  const ORIGINAL_MODEL = "Claude Sonnet 5.5";
  const UPDATED_MODEL = "DeepSeek V4 Pro";

  test.beforeEach(async ({ page, api, login }) => {
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    aiAgents = new AiAgents(page, api.portalDomain);
    aiSettings = new AiSettings(page, api.portalDomain);
    await login.loginToPortal();

    await test.step("Precondition: top up wallet and activate AI features", async () => {
      await paymentApi.setupPayment();
      await paymentApi.makeWalletTopUp();
      await aiSettings.open();
      await aiSettings.activate();
    });

    await test.step("Precondition: create project with a known model", async () => {
      await aiAgents.createAgent(PROJECT_NAME, {
        model: ORIGINAL_MODEL,
      });
      await aiAgents.openAndExpectAgentInList(PROJECT_NAME);
    });
  });

  test("Editing a project's model persists after saving", async () => {
    await test.step("Change the project's model", async () => {
      await aiAgents.editAgent(PROJECT_NAME, { model: UPDATED_MODEL });
    });

    await test.step("Verify the new model is shown when reopening the edit dialog", async () => {
      await aiAgents.expectAgentModel(PROJECT_NAME, UPDATED_MODEL);
    });
  });
});
