import { test } from "@/src/fixtures";
import AiAgents from "@/src/objects/ai/AiAgents";
import AiSettings from "@/src/objects/ai/AiSettings";
import Files from "@/src/objects/files/Files";
import { PaymentApi } from "@/src/api/payment";
import { mapInitialDocNames } from "@/src/utils/constants/files";

test.describe("Ask AI on files", () => {
  let aiAgents: AiAgents;
  let aiSettings: AiSettings;
  let files: Files;
  let paymentApi: PaymentApi;
  const AGENT_NAME = "Test AI Agent";

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

    await test.step("Precondition: create AI agent", async () => {
      await aiAgents.openDirectly();
      await aiAgents.openCreateAgentDialog();
      await aiAgents.fillAgentName(AGENT_NAME);
      await aiAgents.fillInstructions("Test agent for Ask AI scenarios.");
      await aiAgents.saveAgent();
      await aiAgents.expectChatOpened();
    });

    await files.open();
  });

  test("Ask AI on a document opens the AI chat", async () => {
    await test.step("Click Ask AI in the document context menu", async () => {
      await files.clickAskAi(mapInitialDocNames.ONLYOFFICE_SAMPLE_DOCUMENT);
    });

    await test.step("Verify the AI chat panel opens", async () => {
      await aiAgents.expectChatOpened();
    });
  });

  test("Ask AI on a PDF form opens the AI chat with the form attached", async () => {
    await test.step("Click Ask AI in the form context menu", async () => {
      await files.clickAskAi(mapInitialDocNames.ONLYOFFICE_SAMPLE_FORM);
    });

    await test.step("Verify the AI chat panel opens", async () => {
      await aiAgents.expectChatOpened();
    });

    await test.step("Verify the PDF form is attached to the chat", async () => {
      await aiAgents.expectAttachedFile(
        mapInitialDocNames.ONLYOFFICE_SAMPLE_FORM,
      );
    });
  });
});
