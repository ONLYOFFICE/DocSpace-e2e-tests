import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import MyRooms from "@/src/objects/rooms/Rooms";
import BasePasswordRequire from "@/src/objects/common/BasePasswordRequire";
import FilesEditor, {
  enableEditorConfigCapture,
} from "@/src/objects/files/FilesEditor";
import { documentContextMenuOption } from "@/src/utils/constants/files";

const ROOM_NAME = "Anonymous Room";
const FILE_PATH = "data/documents/test-document.docx";
const FILE_NAME = "test-document";
const LINK_PASSWORD = "Anon-Pass-123";

// The fixture page is never signed in, so it acts as an anonymous visitor
test.describe("Public room: anonymous visitor", () => {
  let room: MyRooms;
  let roomId: number;

  test.beforeEach(async ({ page, api, apiSdk }) => {
    room = new MyRooms(page, api.portalDomain);

    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: ROOM_NAME,
      roomType: "PublicRoom",
    });
    expect(roomResponse.ok()).toBeTruthy();
    roomId = (await roomResponse.json()).response.id;
    await apiSdk.files.uploadToFolder("owner", roomId, FILE_PATH);
  });

  test("Anonymous visitor downloads the whole room", async ({
    page,
    apiSdk,
  }) => {
    const [link] = await apiSdk.rooms.getRoomLinks("owner", roomId);

    await test.step("Open the shared link", async () => {
      await page.goto(link.sharedTo.shareLink, { waitUntil: "load" });
      await room.filesTable.expectItemVisible(FILE_NAME);
    });

    await test.step("Download the whole room from the header menu", async () => {
      const download = await room.waitForDownload(async () => {
        await room.filesNavigation.openContextMenu();
        await room.filesNavigation.contextMenu.clickOption("Download");
      });
      expect(download.suggestedFilename()).toMatch(/\.zip$/);
      await download.delete();
    });
  });

  test("Anonymous visitor downloads a single file", async ({
    page,
    apiSdk,
  }) => {
    const [link] = await apiSdk.rooms.getRoomLinks("owner", roomId);

    await test.step("Open the shared link", async () => {
      await page.goto(link.sharedTo.shareLink, { waitUntil: "load" });
      await room.filesTable.expectItemVisible(FILE_NAME);
    });

    await test.step("Download the file from its context menu", async () => {
      const download = await room.downloadFile(FILE_NAME);
      expect(download.suggestedFilename().toLowerCase()).toMatch(/\.docx$/);
      await download.delete();
    });
  });

  test("Password-protected link opens the room only with the right password", async ({
    page,
    apiSdk,
  }) => {
    const passwordPage = new BasePasswordRequire(page);
    const shareLink = await apiSdk.rooms.updatePrimaryRoomLink(
      "owner",
      roomId,
      { password: LINK_PASSWORD },
    );

    await test.step("Link asks for a password", async () => {
      await page.goto(shareLink, { waitUntil: "load" });
      await passwordPage.verifyPasswordRequiredPageVisible();
      await passwordPage.verifyRoomDescription();
    });

    await test.step("Wrong password is rejected", async () => {
      await passwordPage.enterPasswordAndContinue("wrong-password");
      await passwordPage.expectIncorrectPasswordError();
      await room.filesTable.expectItemNotVisible(FILE_NAME);
    });

    await test.step("Right password opens the room", async () => {
      await passwordPage.enterPasswordAndContinue(LINK_PASSWORD);
      await room.filesTable.expectItemVisible(FILE_NAME);
    });
  });

  test("Restrict download hides room and file downloads from the anonymous visitor", async ({
    page,
    apiSdk,
  }) => {
    const shareLink = await apiSdk.rooms.updatePrimaryRoomLink(
      "owner",
      roomId,
      { denyDownload: true },
    );
    let editor: FilesEditor;

    await test.step("Open the shared link", async () => {
      await page.goto(shareLink, { waitUntil: "load" });
      await room.filesTable.expectItemVisible(FILE_NAME);
    });

    await test.step("Header menu has no Download", async () => {
      await room.filesNavigation.openContextMenu();
      await expect(
        room.filesNavigation.contextMenu.getItemLocator("Download"),
      ).not.toBeVisible();
      await room.filesNavigation.contextMenu.close();
    });

    await test.step("File context menu has no Download", async () => {
      await room.filesTable.openContextMenuForItem(FILE_NAME);
      await expect(
        room.filesTable.contextMenu.getItemLocator(
          documentContextMenuOption.preview,
        ),
      ).toBeVisible();
      await expect(
        room.filesTable.contextMenu.getItemLocator(
          documentContextMenuOption.download,
        ),
      ).not.toBeVisible();
      await room.filesTable.contextMenu.close();
    });

    await test.step("Editor opens the file without Download, Print and Copy", async () => {
      await enableEditorConfigCapture(page.context());
      const editorPage = await room.openFileViaPreview(FILE_NAME);
      editor = new FilesEditor(editorPage);
      await editor.waitForLoad();
      const { permissions } = (await editor.getEditorConfig()).document;
      expect(permissions.download).toBe(false);
      expect(permissions.print).toBe(false);
      expect(permissions.copy).toBe(false);
      await editor.close();
    });
  });
});
