import { test } from "@/src/fixtures";
import { AiAgents } from "@/src/objects/ai/AiAgents";
import AiSettings from "@/src/objects/ai/AiSettings";
import Files from "@/src/objects/files/Files";
import { PaymentApi } from "@/src/api/payment";

test.describe("AI Chat: message actions", () => {
  let aiAgents: AiAgents;
  let aiSettings: AiSettings;
  let files: Files;
  let paymentApi: PaymentApi;
  const MESSAGE = "Write a short greeting for a new colleague";

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

    await files.open();
    await files.openAiChat();
    await aiAgents.expectChatOpened();

    await test.step("Precondition: send a message and wait for the reply", async () => {
      await aiAgents.sendChatMessage(MESSAGE);
      await aiAgents.expectUserMessageVisible(MESSAGE);
      await aiAgents.waitForAssistantReply();
    });
  });

  test("Copy and Regenerate work on the sent message and the AI reply", async () => {
    await test.step("Copy the sent message", async () => {
      await aiAgents.copyUserMessage(MESSAGE);
    });

    await test.step("The clipboard holds the message text", async () => {
      await aiAgents.expectUserMessageCopied(MESSAGE);
    });

    await test.step("The reply shows Copy, Regenerate and Save as docx", async () => {
      await aiAgents.expectAssistantReplyActionsVisible();
    });

    await test.step("Copy the AI reply", async () => {
      await aiAgents.copyAssistantReply();
    });

    await test.step("The reply is copied to the clipboard", async () => {
      await aiAgents.expectAssistantReplyCopied();
    });

    await test.step("Regenerate the AI reply", async () => {
      await aiAgents.regenerateAssistantReply();
    });

    await test.step("The new reply keeps its Copy, Regenerate and Save as docx actions", async () => {
      await aiAgents.expectAssistantReplyActionsVisible();
    });
  });

  test("Save as docx saves the AI reply to Files", async () => {
    await test.step("Open the Save as docx panel", async () => {
      await aiAgents.openSaveReplyAsDocx();
    });

    await test.step("The panel lists Files, Rooms and AI agents without Forms", async () => {
      await aiAgents.expectSaveAsDocxSections();
    });

    let fileName = "";

    await test.step("Save the reply to Files and check the export toast", async () => {
      fileName = await aiAgents.saveReplyAsDocxToFiles();
    });

    await test.step("The exported file appears in Files", async () => {
      await files.open();
      await files.filesTable.checkRowExist(fileName.replace(/\.docx$/, ""));
    });
  });
});
