import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import AiAgents from "@/src/objects/ai/AiAgents";
import AiSettings from "@/src/objects/ai/AiSettings";
import ChatAttachmentPanel from "@/src/objects/ai/ChatAttachmentPanel";
import { PaymentApi } from "@/src/api/payment";
import { mapInitialDocNames } from "@/src/utils/constants/files";

const PDF_FORM_FILE = "data/rooms/PDF from device.pdf";
// File rows display the title without its extension.
const baseName = (title: string) => title.replace(/\.[^.]+$/, "");

test.describe("AI Chat attach panel: Recent/Favorites are scoped per section", () => {
  const AGENT_NAME = "Attach Panel Agent";
  const FILES_FAVORITE = mapInitialDocNames.ONLYOFFICE_SAMPLE_DOCUMENT;
  const FILES_RECENT = mapInitialDocNames.ONLYOFFICE_SAMPLE_SPREADSHEETS;
  const FORM_ROOM_NAME = "Attach Panel Form Room";
  const ROOM_NAME = "Attach Panel Room";
  const ROOM_FAVORITE = "Room Favorite File";
  const ROOM_RECENT = "Room Recent File";

  let aiAgents: AiAgents;
  let aiSettings: AiSettings;
  let attachmentPanel: ChatAttachmentPanel;
  let paymentApi: PaymentApi;
  let formsFavorite = "";

  test.beforeEach(async ({ page, api, apiSdk, login }) => {
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    aiAgents = new AiAgents(page, api.portalDomain);
    aiSettings = new AiSettings(page, api.portalDomain);
    attachmentPanel = new ChatAttachmentPanel(page);
    await login.loginToPortal();

    await test.step("Precondition: top up wallet and activate AI features", async () => {
      await paymentApi.setupPayment();
      await paymentApi.makeWalletTopUp();
      await aiSettings.open();
      await aiSettings.activate();
    });

    await test.step("Precondition: favorite one file and open another in My Documents", async () => {
      const myDocsId = await apiSdk.folders.getMyDocumentsFolderId("owner");
      const files = await apiSdk.folders.listFiles("owner", myDocsId);
      const findByTitle = (title: string) => {
        const match = files.find((f) => f.title.startsWith(title));
        if (!match) {
          throw new Error(
            `"${title}" not found in My Documents. Available: ${files
              .map((f) => f.title)
              .join(", ")}`,
          );
        }
        return match;
      };
      const favorite = findByTitle(FILES_FAVORITE);
      const recent = findByTitle(FILES_RECENT);
      await apiSdk.files.addToFavorites("owner", [favorite.id]);
      // Favoriting doesn't touch "recently opened" - open a different file so
      // Favorite and Recent are driven by independent, controlled signals.
      await aiAgents.openFileInEditor(recent.id);
    });

    await test.step("Precondition: favorite and open an uploaded PDF form in a form-filling room", async () => {
      const formRoomResponse = await apiSdk.rooms.createRoom("owner", {
        title: FORM_ROOM_NAME,
        roomType: "FillingFormsRoom",
      });
      const formRoomId = (await formRoomResponse.json()).response.id;
      const form = await apiSdk.files.uploadToFolder(
        "owner",
        formRoomId,
        PDF_FORM_FILE,
      );
      formsFavorite = baseName(form.title);
      await apiSdk.files.addToFavorites("owner", [form.id]);
      // A folder can be favorited but never shows under Recent - only an
      // opened file does, so Forms > Recent needs this extra step.
      await aiAgents.openFileInEditor(form.id);
    });

    await test.step("Precondition: favorite one file and open another in a room", async () => {
      const roomResponse = await apiSdk.rooms.createRoom("owner", {
        title: ROOM_NAME,
        roomType: "EditingRoom",
      });
      const roomId = (await roomResponse.json()).response.id;
      const favoriteFileResponse = await apiSdk.files.createFile(
        "owner",
        roomId,
        { title: ROOM_FAVORITE },
      );
      const recentFileResponse = await apiSdk.files.createFile(
        "owner",
        roomId,
        {
          title: ROOM_RECENT,
        },
      );
      const favoriteFile = (await favoriteFileResponse.json()).response;
      const recentFile = (await recentFileResponse.json()).response;
      await apiSdk.files.addToFavorites("owner", [favoriteFile.id]);
      await aiAgents.openFileInEditor(recentFile.id);
    });

    await test.step("Precondition: create an AI agent", async () => {
      await aiAgents.createAgent(AGENT_NAME);
    });
  });

  // Regression test for a bug where the attach-from-storage selector's
  // per-section "Recent files" / "Favorite files" leaked items belonging to
  // other sections (e.g. a My Documents favorite showing up under AI agents).
  test("Favorites and Recent don't leak items across AI agents/Forms/Rooms/Files", async () => {
    await test.step("AI agents > Favorite files has no leftovers from Files", async () => {
      await aiAgents.openAttachmentPanel();
      await attachmentPanel.openFolder("AI agents");
      await attachmentPanel.openFolder("Favorite files");
      await attachmentPanel.expectFileNotVisible(FILES_FAVORITE);
      await attachmentPanel.close();
    });

    await test.step("AI agents > Recent files has no leftovers from Files", async () => {
      await aiAgents.openAttachmentPanel();
      await attachmentPanel.openFolder("AI agents");
      await attachmentPanel.openFolder("Recent files");
      await attachmentPanel.expectFileNotVisible(FILES_FAVORITE);
      await attachmentPanel.close();
    });

    await test.step("Forms > Favorite files shows exactly the one form favorite", async () => {
      await aiAgents.openAttachmentPanel();
      await attachmentPanel.openFolder("Forms");
      await attachmentPanel.openFolder("Favorite files");
      await attachmentPanel.getItemByName(formsFavorite);
      await attachmentPanel.expectFileNotVisible(FILES_FAVORITE);
      await attachmentPanel.expectItemCount(1);
      await attachmentPanel.close();
    });

    await test.step("Forms > Recent files shows exactly the one opened form", async () => {
      await aiAgents.openAttachmentPanel();
      await attachmentPanel.openFolder("Forms");
      await attachmentPanel.openFolder("Recent files");
      await attachmentPanel.getItemByName(formsFavorite);
      await attachmentPanel.expectFileNotVisible(FILES_FAVORITE);
      await attachmentPanel.expectItemCount(1);
      await attachmentPanel.close();
    });

    await test.step("Rooms > Favorite files shows exactly the one room favorite", async () => {
      await aiAgents.openAttachmentPanel();
      await attachmentPanel.openFolder("Rooms");
      await attachmentPanel.openFolder("Favorite files");
      await attachmentPanel.getItemByName(ROOM_FAVORITE);
      await attachmentPanel.expectFileNotVisible(ROOM_RECENT);
      await attachmentPanel.expectItemCount(1);
      await attachmentPanel.close();
    });

    await test.step("Rooms > Recent files shows exactly the one opened room file", async () => {
      await aiAgents.openAttachmentPanel();
      await attachmentPanel.openFolder("Rooms");
      await attachmentPanel.openFolder("Recent files");
      await attachmentPanel.getItemByName(ROOM_RECENT);
      await attachmentPanel.expectFileNotVisible(ROOM_FAVORITE);
      await attachmentPanel.expectItemCount(1);
      await attachmentPanel.close();
    });

    await test.step("Files > Favorite files shows exactly the one favorite", async () => {
      await aiAgents.openAttachmentPanel();
      await attachmentPanel.openFolder("Files");
      await attachmentPanel.openFolder("Favorite files");
      await attachmentPanel.getItemByName(FILES_FAVORITE);
      await attachmentPanel.expectFileNotVisible(FILES_RECENT);
      await attachmentPanel.expectItemCount(1);
      await attachmentPanel.close();
    });

    await test.step("Files > Recent files shows exactly the one opened file", async () => {
      await aiAgents.openAttachmentPanel();
      await attachmentPanel.openFolder("Files");
      await attachmentPanel.openFolder("Recent files");
      await attachmentPanel.getItemByName(FILES_RECENT);
      await attachmentPanel.expectFileNotVisible(FILES_FAVORITE);
      await attachmentPanel.expectItemCount(1);
      await attachmentPanel.close();
    });
  });
});

test.describe("AI Chat attach panel: selecting an agent", () => {
  const AGENT_NAME = "Attach Panel Agent";

  let aiAgents: AiAgents;
  let aiSettings: AiSettings;
  let attachmentPanel: ChatAttachmentPanel;
  let paymentApi: PaymentApi;

  test.beforeEach(async ({ page, api, login }) => {
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    aiAgents = new AiAgents(page, api.portalDomain);
    aiSettings = new AiSettings(page, api.portalDomain);
    attachmentPanel = new ChatAttachmentPanel(page);
    await login.loginToPortal();

    await test.step("Precondition: top up wallet and activate AI features", async () => {
      await paymentApi.setupPayment();
      await paymentApi.makeWalletTopUp();
      await aiSettings.open();
      await aiSettings.activate();
    });

    await test.step("Precondition: create an AI agent", async () => {
      await aiAgents.createAgent(AGENT_NAME);
    });
  });

  // The agent's row in the AI agents section of the attach-from-storage
  // selector renders disabled, so it can't be selected and attached to a chat.
  test.fail(
    "Selecting an agent from the AI agents section attaches it to the chat [Bug 84000]",
    async ({ page }) => {
      await test.step("Open the AI agents section in the attach selector", async () => {
        await aiAgents.openAttachmentPanel();
        await attachmentPanel.openFolder("AI agents");
      });

      await test.step("Select the agent and submit", async () => {
        await attachmentPanel.selectItemByText(AGENT_NAME);
        // The agent's row can't actually be selected, so this stays disabled -
        // check with a short timeout instead of letting add() hang on a click
        // retry for the whole test timeout.
        await expect(page.getByTestId("selector_submit_button")).toBeEnabled({
          timeout: 5000,
        });
        await attachmentPanel.add();
      });

      await test.step("Verify the agent is attached to the chat", async () => {
        await aiAgents.expectAttachedFile(AGENT_NAME);
      });
    },
  );
});
