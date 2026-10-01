import { test } from "@/src/fixtures";
import { AiAgents } from "@/src/objects/ai/AiAgents";
import AiSettings from "@/src/objects/ai/AiSettings";
import Files from "@/src/objects/files/Files";
import { PaymentApi } from "@/src/api/payment";

test.describe("AI Chat: saved prompts library", () => {
  let aiAgents: AiAgents;
  let aiSettings: AiSettings;
  let files: Files;
  let paymentApi: PaymentApi;
  const AGENT_NAME = "Saved Prompts Agent";
  const MESSAGE = "Message to save as a prompt";

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
        instructions: "Agent for saved prompts tests.",
      });
    });

    await files.open();
    await files.openAiChat();
    await aiAgents.expectChatOpened();

    await test.step("Precondition: send a message to save as a prompt", async () => {
      await aiAgents.sendChatMessage(MESSAGE);
      await aiAgents.expectUserMessageVisible(MESSAGE);
    });
  });

  test("Saving, deleting, and editing a prompt updates the library", async () => {
    const NEW_NAME = "Renamed prompt";

    await test.step("Save the sent message as a prompt", async () => {
      await aiAgents.saveMessageAsPrompt(MESSAGE);
    });

    await test.step("The prompt appears in the Prompts library", async () => {
      await aiAgents.expectPromptInLibrary(MESSAGE);
    });

    await test.step("Delete the prompt", async () => {
      await aiAgents.deletePrompt(MESSAGE);
    });

    await test.step("The prompt no longer appears in the library", async () => {
      await aiAgents.expectPromptNotInLibrary(MESSAGE);
    });

    await test.step("Save the message as a prompt again", async () => {
      await aiAgents.saveMessageAsPrompt(MESSAGE);
    });

    await test.step("Edit the prompt's name", async () => {
      await aiAgents.editPrompt(MESSAGE, { name: NEW_NAME });
    });

    await test.step("The library reflects the new name, not the old one", async () => {
      await aiAgents.expectPromptInLibrary(NEW_NAME);
      await aiAgents.expectPromptNotInLibrary(MESSAGE);
    });
  });
});
