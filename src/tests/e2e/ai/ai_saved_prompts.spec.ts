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

    await files.open();
    await files.openAiChat();
    await aiAgents.expectChatOpened();

    await test.step("Precondition: send a message and wait for the reply", async () => {
      await aiAgents.sendChatMessage(MESSAGE);
      await aiAgents.expectUserMessageVisible(MESSAGE);
      // Escape in the menu helpers would stop a reply that is still streaming.
      await aiAgents.waitForAssistantReply();
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

  test("A prompt folder holds, moves, renames, and deletes its prompts", async () => {
    const FOLDER_NAME = "Weekly report prompts";
    const NEW_FOLDER_NAME = "Monthly report prompts";

    await test.step("Save the message to a new prompt folder", async () => {
      await aiAgents.saveMessageToNewFolder(MESSAGE, FOLDER_NAME);
    });

    await test.step("The folder is listed in the save-to-folder menu", async () => {
      await aiAgents.expectFolderInSaveToFolderMenu(MESSAGE, FOLDER_NAME);
    });

    await test.step("The prompt is inside the folder, not at the library root", async () => {
      await aiAgents.expectPromptInFolder(FOLDER_NAME, MESSAGE);
      await aiAgents.expectPromptNotInLibrary(MESSAGE);
    });

    await test.step("Move the prompt out of the folder to the library root", async () => {
      await aiAgents.movePromptToRoot(MESSAGE, FOLDER_NAME);
    });

    await test.step("The prompt is at the root and no longer in the folder", async () => {
      await aiAgents.expectPromptInLibrary(MESSAGE);
      await aiAgents.expectPromptNotInFolder(FOLDER_NAME, MESSAGE);
    });

    await test.step("Move the prompt back into the folder", async () => {
      await aiAgents.movePromptToFolder(MESSAGE, FOLDER_NAME);
    });

    await test.step("The prompt is in the folder and no longer at the root", async () => {
      await aiAgents.expectPromptInFolder(FOLDER_NAME, MESSAGE);
      await aiAgents.expectPromptNotInLibrary(MESSAGE);
    });

    await test.step("Rename the folder", async () => {
      await aiAgents.renamePromptFolder(FOLDER_NAME, NEW_FOLDER_NAME);
    });

    await test.step("The library shows the new folder name with the prompt inside", async () => {
      await aiAgents.expectPromptFolderNotInLibrary(FOLDER_NAME);
      await aiAgents.expectPromptInFolder(NEW_FOLDER_NAME, MESSAGE);
    });

    await test.step("Cancel folder deletion with No", async () => {
      await aiAgents.deletePromptFolder(NEW_FOLDER_NAME, { confirm: false });
    });

    await test.step("The folder and its prompt are still in the library", async () => {
      await aiAgents.expectPromptInFolder(NEW_FOLDER_NAME, MESSAGE);
    });

    await test.step("Confirm folder deletion with Yes", async () => {
      await aiAgents.deletePromptFolder(NEW_FOLDER_NAME, { confirm: true });
    });

    await test.step("The folder and its prompt no longer appear in the library", async () => {
      await aiAgents.expectPromptFolderNotInLibrary(NEW_FOLDER_NAME);
      await aiAgents.expectPromptNotInLibrary(MESSAGE);
    });
  });

  test("The save-to-folder list scrolls once many folders exist", async () => {
    // The list starts scrolling from the 10th folder - keep a margin above that
    const FOLDER_NAMES = [
      "Sales prompts",
      "Marketing prompts",
      "Support prompts",
      "HR prompts",
      "Legal prompts",
      "Finance prompts",
      "Design prompts",
      "Research prompts",
      "Product prompts",
      "Compliance prompts",
      "Operations prompts",
      "Training prompts",
    ];

    await test.step("Save the message to new folders", async () => {
      for (const folderName of FOLDER_NAMES) {
        await aiAgents.saveMessageToNewFolder(MESSAGE, folderName);
      }
    });

    await test.step("The folder list scrolls", async () => {
      await aiAgents.expectSaveToFolderListScrollable(MESSAGE, true);
    });
  });
});
