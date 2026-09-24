import { test } from "@/src/fixtures";
import AiAgents from "@/src/objects/ai/AiAgents";
import AiSettings from "@/src/objects/ai/AiSettings";
import { PaymentApi } from "@/src/api/payment";

test.describe("AI Agents: edit an existing agent's model", () => {
  let aiAgents: AiAgents;
  let aiSettings: AiSettings;
  let paymentApi: PaymentApi;
  const AGENT_NAME = "Edit Model Instructions Agent";
  const ORIGINAL_MODEL = "Claude Sonnet 5";
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

    await test.step("Precondition: create agent with a known model", async () => {
      await aiAgents.createAgent(AGENT_NAME, {
        model: ORIGINAL_MODEL,
        instructions: "Instructions for the model-edit test agent.",
      });
      await aiAgents.openAndExpectAgentInList(AGENT_NAME);
    });
  });

  test("Editing an agent's model persists after saving", async () => {
    await test.step("Change the agent's model", async () => {
      await aiAgents.editAgent(AGENT_NAME, { model: UPDATED_MODEL });
    });

    await test.step("Verify the new model is shown when reopening the edit dialog", async () => {
      await aiAgents.expectAgentModel(AGENT_NAME, UPDATED_MODEL);
    });
  });
});
