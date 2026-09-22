import { test } from "@/src/fixtures";
import AiAgents from "@/src/objects/ai/AiAgents";
import AiSettings from "@/src/objects/ai/AiSettings";
import Files from "@/src/objects/files/Files";
import { PaymentApi } from "@/src/api/payment";
import { mapInitialDocNames } from "@/src/utils/constants/files";

test.describe("Ask AI on files: choosing a custom agent", () => {
  let aiAgents: AiAgents;
  let aiSettings: AiSettings;
  let files: Files;
  let paymentApi: PaymentApi;
  const AGENT_A_NAME = "Test AI Agent A";
  const AGENT_B_NAME = "Test AI Agent B";

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

    await test.step("Precondition: create two AI agents", async () => {
      await aiAgents.createAgent(AGENT_A_NAME, {
        instructions: "First test agent for Ask AI selector scenarios.",
      });
      await aiAgents.createAgent(AGENT_B_NAME, {
        instructions: "Second test agent for Ask AI selector scenarios.",
      });
    });

    await files.open();
  });

  test("Ask AI's model picker lets you bind the chat to a specific custom agent", async () => {
    await test.step("Click Ask AI in the document context menu", async () => {
      await files.clickAskAi(mapInitialDocNames.ONLYOFFICE_SAMPLE_DOCUMENT);
    });

    await test.step("Verify the quick AI chat opens with the file attached", async () => {
      await aiAgents.expectChatOpened();
      await aiAgents.expectAttachedFile(
        mapInitialDocNames.ONLYOFFICE_SAMPLE_DOCUMENT,
      );
    });

    await test.step("Pick the second agent from the model selector's 'Choose AI Agent' submenu", async () => {
      await aiAgents.selectAgentInQuickChat(AGENT_B_NAME);
    });

    await test.step("Verify the chat is now bound to the selected agent, not the other one", async () => {
      await aiAgents.expectQuickChatAgentSelected(AGENT_B_NAME);
      await aiAgents.expectChatOpened();
      await aiAgents.expectAttachedFile(
        mapInitialDocNames.ONLYOFFICE_SAMPLE_DOCUMENT,
      );
    });
  });

  test("Ask AI on a PDF form keeps the form attached after switching to a custom agent", async () => {
    await test.step("Click Ask AI in the form context menu", async () => {
      await files.clickAskAi(mapInitialDocNames.ONLYOFFICE_SAMPLE_FORM);
    });

    await test.step("Pick the first agent from the model selector", async () => {
      await aiAgents.selectAgentInQuickChat(AGENT_A_NAME);
    });

    await test.step("Verify the selected agent is bound and the form stays attached", async () => {
      await aiAgents.expectQuickChatAgentSelected(AGENT_A_NAME);
      await aiAgents.expectAttachedFile(
        mapInitialDocNames.ONLYOFFICE_SAMPLE_FORM,
      );
    });
  });
});
