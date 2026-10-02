import { test } from "@/src/fixtures";
import { AiAgents } from "@/src/objects/ai/AiAgents";
import AiSettings from "@/src/objects/ai/AiSettings";
import Files from "@/src/objects/files/Files";
import { PaymentApi } from "@/src/api/payment";
import { aiChatExportFormats } from "@/src/utils/constants/ai";
test.describe("AI Chat: chat history context menu", () => {
  let aiAgents: AiAgents;
  let aiSettings: AiSettings;
  let files: Files;
  let paymentApi: PaymentApi;
  const MESSAGE = "Write a short greeting for a new colleague";
  const RENAMED_CHAT = "Renamed history chat";
  const SEARCH_QUERY = "history";
  const UNKNOWN_SEARCH_QUERY = "zzz-no-such-chat";

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

    await test.step("Precondition: send a message so the chat lands in history", async () => {
      await aiAgents.sendChatMessage(MESSAGE);
      await aiAgents.expectUserMessageVisible(MESSAGE);
      await aiAgents.waitForAssistantReply();
    });
  });

  test("Chat menu: Open, Export to, Rename and Delete work on a history chat", async () => {
    let chatTitle = "";

    await test.step("Open the chat history", async () => {
      await aiAgents.openChatList();
      chatTitle = await aiAgents.getChatHistoryItemTitle();
    });

    await test.step("The chat menu shows Open, Export to, Rename and Delete", async () => {
      await aiAgents.openChatHistoryItemMenu(chatTitle);
      await aiAgents.expectChatHistoryItemMenuOptions();
    });

    await test.step("Export to lists .pdf, .docx and .md formats", async () => {
      await aiAgents.expectChatExportFormats();
    });

    const exportedFiles: string[] = [];

    for (const format of aiChatExportFormats) {
      await test.step(`Export the chat to ${format.label}`, async () => {
        exportedFiles.push(
          await aiAgents.exportChatFromHistory(format, chatTitle),
        );
      });
    }

    await test.step("Rename the chat", async () => {
      await aiAgents.renameChatInHistory(RENAMED_CHAT, chatTitle);
      await aiAgents.expectChatInHistory(RENAMED_CHAT);
      await aiAgents.expectChatNotInHistory(chatTitle);
    });

    await test.step("Search by part of the title finds the chat", async () => {
      await aiAgents.searchChatHistory(SEARCH_QUERY);
      await aiAgents.expectChatInHistory(RENAMED_CHAT);
    });

    await test.step("Search by unknown text finds nothing", async () => {
      await aiAgents.searchChatHistory(UNKNOWN_SEARCH_QUERY);
      await aiAgents.expectChatHistorySearchEmpty();
    });

    await test.step("Clearing the search shows the chat again", async () => {
      await aiAgents.searchChatHistory("");
      await aiAgents.expectChatInHistory(RENAMED_CHAT);
    });

    await test.step("Start a new chat and reopen the renamed one via Open", async () => {
      await aiAgents.startNewChat();
      await aiAgents.openChatList();
      await aiAgents.openChatFromHistory(RENAMED_CHAT);
    });

    await test.step("The chat with the sent message is opened", async () => {
      await aiAgents.expectUserMessageVisible(MESSAGE);
      await aiAgents.openChatList();
      await aiAgents.expectChatActive(RENAMED_CHAT);
    });

    await test.step("Delete the chat and confirm", async () => {
      await aiAgents.deleteChatFromHistory(RENAMED_CHAT);
    });

    await test.step("The chat is gone and history is empty", async () => {
      await aiAgents.expectChatNotInHistory(RENAMED_CHAT);
      await aiAgents.expectChatHistoryEmpty();
    });

    await test.step("All exported files are in Files", async () => {
      // The list hides extensions, so the .pdf/.docx/.md exports of one chat
      // show up as rows with the same title.
      const countsByTitle = new Map<string, number>();
      for (const fileName of exportedFiles) {
        const title = fileName.slice(0, fileName.lastIndexOf("."));
        countsByTitle.set(title, (countsByTitle.get(title) ?? 0) + 1);
      }
      await files.open();
      for (const [title, count] of countsByTitle) {
        await files.filesTable.checkRowsCountByTitle(title, count);
      }
    });
  });
});
