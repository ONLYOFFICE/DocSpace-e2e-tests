import Files from "@/src/objects/files/Files";
import MyRooms from "@/src/objects/rooms/Rooms";
import AiAgents from "@/src/objects/ai/AiAgents";
import { test } from "@/src/fixtures";

test.describe("Files: empty view welcome screen", () => {
  let files: Files;

  test.beforeEach(async ({ page, api, login }) => {
    files = new Files(page, api.portalDomain);
    await login.loginToPortal();
    await files.open();
    await files.deleteAllDocs();
  });

  test("Shows title, subtitle, all action items and the header AI Chat button", async () => {
    await test.step("Title and subtitle", async () => {
      await files.filesEmptyView.checkNoDocsTextExist();
      await files.filesEmptyView.checkEmptyViewSubtitleExist();
    });

    await test.step("Action items, including AI Chat", async () => {
      await files.filesEmptyView.checkEmptyViewItemsExist();
    });

    await test.step("Header AI Chat button is visible", async () => {
      await files.checkAiChatButtonVisible();
    });
  });
});

test.describe("Rooms: empty view welcome screen", () => {
  let myRooms: MyRooms;

  test.beforeEach(async ({ page, api, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    await login.loginToPortal();
    await myRooms.open();
  });

  test("Shows title, all action items and the header AI Chat button", async () => {
    await test.step("Title", async () => {
      await myRooms.roomsEmptyView.checkNoRoomsTitleExist();
    });

    await test.step("Action items, including AI Chat", async () => {
      await myRooms.roomsEmptyView.checkRoomsEmptyViewItemsExist();
    });

    await test.step("Header AI Chat button is visible", async () => {
      await myRooms.checkAiChatButtonVisible();
    });
  });
});

test.describe("Forms: empty view welcome screen", () => {
  let myRooms: MyRooms;

  test.beforeEach(async ({ page, api, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    await login.loginToPortal();
    await myRooms.openForms();
  });

  test("Shows title, subtitle, all action items and the header AI Chat button", async () => {
    await test.step("Title and subtitle", async () => {
      await myRooms.roomsEmptyView.checkNoFormSpacesExist();
    });

    await test.step("Action items, including AI Chat", async () => {
      await myRooms.roomsEmptyView.checkFormsEmptyViewItemsExist();
    });

    await test.step("Header AI Chat button is visible", async () => {
      await myRooms.checkAiChatButtonVisible();
    });
  });
});

test.describe("AI Agents: empty view has no AI Chat entry points", () => {
  let aiAgents: AiAgents;

  test.beforeEach(async ({ page, api, login }) => {
    aiAgents = new AiAgents(page, api.portalDomain);
    await login.loginToPortal();
    await aiAgents.open();
  });

  test("Shows the not-active empty state instead of a header AI Chat button", async () => {
    await test.step("Not-active empty state", async () => {
      await aiAgents.expectAiNotActive();
    });

    await test.step("Header AI Chat button is not shown", async () => {
      await aiAgents.checkAiChatButtonNotExist();
    });
  });
});
