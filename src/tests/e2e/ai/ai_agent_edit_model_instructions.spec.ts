import { test } from "@/src/fixtures";
import AiAgents from "@/src/objects/ai/AiAgents";
import AiSettings from "@/src/objects/ai/AiSettings";
import { PaymentApi } from "@/src/api/payment";

test.describe("AI Agents: edit an existing agent's model and instructions", () => {
  let aiAgents: AiAgents;
  let aiSettings: AiSettings;
  let paymentApi: PaymentApi;
  const AGENT_NAME = "Edit Model Instructions Agent";
  const ORIGINAL_MODEL = "Claude Sonnet 5";
  const UPDATED_MODEL = "DeepSeek V4 Pro";
  const INSTRUCTIONS_BEFORE_EDIT = "BEFORE EDIT: original instructions.";
  const INSTRUCTIONS_AFTER_EDIT = "AFTER EDIT: instructions were changed.";

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

    // createAgent() leaves the agent's own chat open, so edits below go
    // through its chat header menu instead of navigating back to the list.
    await test.step("Precondition: create agent with a known model", async () => {
      await aiAgents.createAgent(AGENT_NAME, {
        model: ORIGINAL_MODEL,
        instructions: INSTRUCTIONS_BEFORE_EDIT,
      });
    });
  });

  test("Editing an agent's model persists after saving", async () => {
    await test.step("Change the agent's model", async () => {
      await aiAgents.editAgentFromChat({ model: UPDATED_MODEL });
    });

    await test.step("Verify the new model is shown when reopening the edit dialog", async () => {
      await aiAgents.expectAgentModelFromChat(UPDATED_MODEL);
    });
  });

  test("Editing an agent's instructions persists after saving", async () => {
    await test.step("Change the agent's instructions", async () => {
      await aiAgents.editAgentFromChat({
        instructions: INSTRUCTIONS_AFTER_EDIT,
      });
    });

    await test.step("Verify the new instructions are shown when reopening the edit dialog", async () => {
      await aiAgents.expectAgentInstructionsFromChat(INSTRUCTIONS_AFTER_EDIT);
    });
  });
});
