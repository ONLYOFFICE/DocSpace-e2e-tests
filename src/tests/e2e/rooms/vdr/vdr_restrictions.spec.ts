import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import MyRooms from "@/src/objects/rooms/Rooms";
import VdrRoomSettings from "@/src/objects/rooms/VdrRoomSettings";
import LifetimeDialog from "@/src/objects/rooms/LifetimeDialog";
import FilesEditor, {
  enableEditorConfigCapture,
} from "@/src/objects/files/FilesEditor";
import {
  documentContextMenuOption,
  pdfFormMoveOrCopySubmenu,
} from "@/src/utils/constants/files";
import {
  roomContextMenuOption,
  vdrLifetimePeriod,
  vdrWatermarkAdditions,
} from "@/src/utils/constants/rooms";

const ROOM_NAME = "VDR Restrictions";
const VDR_ROOM = { title: ROOM_NAME, roomType: "VirtualDataRoom" };
const FILE_PATH = "data/documents/test-document.docx";
const FILE_NAME = "test-document";

test.describe("VDR room: Restrict copy and download", () => {
  let myRooms: MyRooms;
  let roomId: number;

  test.beforeEach(async ({ page, api, apiSdk }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    roomId = await apiSdk.rooms.createRoomWithSettings("owner", VDR_ROOM, {
      denyDownload: true,
      watermark: { enabled: false },
    });
    await apiSdk.files.uploadToFolder("owner", roomId, FILE_PATH);
  });

  test("Viewer does not see Download and Copy", async ({ apiSdk, login }) => {
    const { userData: viewer, userId } = await apiSdk.profiles.addMemberWithId(
      "owner",
      "User",
    );
    await apiSdk.rooms.inviteToRoom("owner", roomId, userId, "Read");

    await test.step("Log in as Viewer and open the room", async () => {
      await login.loginWithCredentials(viewer.email, viewer.password);
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(ROOM_NAME);
    });

    await test.step("File context menu has no Download and Copy", async () => {
      await myRooms.filesTable.openContextMenuForItem(FILE_NAME);
      const menu = myRooms.filesTable.contextMenu;
      await expect(
        menu.getItemLocator(documentContextMenuOption.preview),
      ).toBeVisible();
      await expect(
        menu.getItemLocator(documentContextMenuOption.download),
      ).not.toBeVisible();
      await expect(
        menu.getItemLocator(documentContextMenuOption.moveOrCopy),
      ).not.toBeVisible();
      await expect(
        menu.getItemLocator(documentContextMenuOption.copy),
      ).not.toBeVisible();
      await menu.close();
    });
  });

  test("Editor still sees Download and Copy", async ({ apiSdk, login }) => {
    const { userData: editor, userId } = await apiSdk.profiles.addMemberWithId(
      "owner",
      "User",
    );
    await apiSdk.rooms.inviteToRoom("owner", roomId, userId, "Editing");

    await test.step("Log in as Editor and open the room", async () => {
      await login.loginWithCredentials(editor.email, editor.password);
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(ROOM_NAME);
    });

    await test.step("File context menu has Download and Copy", async () => {
      // Editor cannot move, so "Move or copy" collapses into a single "Copy"
      await myRooms.filesTable.openContextMenuForItem(FILE_NAME);
      const menu = myRooms.filesTable.contextMenu;
      await expect(
        menu.getItemLocator(documentContextMenuOption.download),
      ).toBeVisible();
      await expect(
        menu.getItemLocator(documentContextMenuOption.copy),
      ).toBeVisible();
      await menu.close();
    });
  });

  test("Room manager still sees Download, Copy and Duplicate", async ({
    apiSdk,
    login,
  }) => {
    const { userData: manager, userId } = await apiSdk.profiles.addMemberWithId(
      "owner",
      "RoomAdmin",
    );
    await apiSdk.rooms.inviteToRoom("owner", roomId, userId, "RoomManager");

    await test.step("Log in as Room manager and open the room", async () => {
      await login.loginWithCredentials(manager.email, manager.password);
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(ROOM_NAME);
    });

    await test.step("File context menu has Download, Copy and Duplicate", async () => {
      await myRooms.filesTable.openContextMenuForItem(FILE_NAME);
      const menu = myRooms.filesTable.contextMenu;
      await expect(
        menu.getItemLocator(documentContextMenuOption.download),
      ).toBeVisible();
      await menu.hoverOption(documentContextMenuOption.moveOrCopy);
      await expect(
        menu.submenu.getByTestId(pdfFormMoveOrCopySubmenu.copy.value),
      ).toBeVisible();
      await expect(
        menu.submenu.getByTestId(pdfFormMoveOrCopySubmenu.duplicate.value),
      ).toBeVisible();
      await menu.close();
    });
  });

  test("DocSpace admin who is not a room member loses Download and Copy", async ({
    apiSdk,
    login,
  }) => {
    const { userData: admin } = await apiSdk.profiles.addMemberWithId(
      "owner",
      "DocSpaceAdmin",
    );

    await test.step("Log in as DocSpace admin and open the room", async () => {
      await login.loginWithCredentials(admin.email, admin.password);
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(ROOM_NAME);
    });

    await test.step("File context menu has no Download and Copy", async () => {
      await myRooms.filesTable.openContextMenuForItem(FILE_NAME);
      const menu = myRooms.filesTable.contextMenu;
      await expect(
        menu.getItemLocator(documentContextMenuOption.preview),
      ).toBeVisible();
      await expect(
        menu.getItemLocator(documentContextMenuOption.download),
      ).not.toBeVisible();
      await expect(
        menu.getItemLocator(documentContextMenuOption.moveOrCopy),
      ).not.toBeVisible();
      await expect(
        menu.getItemLocator(documentContextMenuOption.copy),
      ).not.toBeVisible();
      await menu.close();
    });
  });

  test("Viewer can download after the restriction is turned off", async ({
    apiSdk,
    login,
  }) => {
    const { userData: viewer, userId } = await apiSdk.profiles.addMemberWithId(
      "owner",
      "User",
    );
    await apiSdk.rooms.inviteToRoom("owner", roomId, userId, "Read");

    await test.step("Owner turns off Restrict copy and download", async () => {
      const response = await apiSdk.rooms.updateRoom("owner", roomId, {
        denyDownload: false,
      });
      expect(response.ok()).toBeTruthy();
    });

    await test.step("Log in as Viewer and open the room", async () => {
      await login.loginWithCredentials(viewer.email, viewer.password);
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(ROOM_NAME);
    });

    await test.step("Viewer downloads the file in its original format", async () => {
      const download = await myRooms.downloadFile(FILE_NAME);
      expect(download.suggestedFilename().toLowerCase()).toMatch(/\.docx$/);
      await download.delete();
    });
  });
});

test.describe("VDR room: Watermarks", () => {
  let myRooms: MyRooms;
  let roomId: number;

  test.beforeEach(async ({ page, api, apiSdk }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    roomId = await apiSdk.rooms.createRoomWithSettings("owner", VDR_ROOM, {
      denyDownload: false,
      watermark: {
        enabled: true,
        additions:
          vdrWatermarkAdditions.userName | vdrWatermarkAdditions.roomName,
        rotate: -45,
      },
    });
    await apiSdk.files.uploadToFolder("owner", roomId, FILE_PATH);
  });

  test("Document is downloaded as PDF", async ({ login }) => {
    await test.step("Owner opens the room", async () => {
      await login.loginToPortal();
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(ROOM_NAME);
    });

    await test.step("Downloaded .docx comes as .pdf", async () => {
      const download = await myRooms.downloadFile(FILE_NAME);
      expect(download.suggestedFilename().toLowerCase()).toMatch(/\.pdf$/);
      await download.delete();
    });
  });

  test("Viewer opens a document: editor config has the watermark and no Download", async ({
    page,
    apiSdk,
    login,
  }) => {
    const { userData: viewer, userId } = await apiSdk.profiles.addMemberWithId(
      "owner",
      "User",
    );
    await apiSdk.rooms.inviteToRoom("owner", roomId, userId, "Read");
    let editor: FilesEditor;

    await test.step("Log in as Viewer and open the room", async () => {
      await login.loginWithCredentials(viewer.email, viewer.password);
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(ROOM_NAME);
    });

    await test.step("Open the document via Preview", async () => {
      await enableEditorConfigCapture(page.context());
      const editorPage = await myRooms.openFileViaPreview(FILE_NAME);
      editor = new FilesEditor(editorPage);
      await editor.waitForLoad();
    });

    await test.step("Config has a watermark with viewer name and room name", async () => {
      const config = await editor.getEditorConfig();
      const runs =
        config.document.options?.watermark_on_draw?.paragraphs.flatMap(
          (paragraph) => paragraph.runs.map((run) => run.text),
        ) ?? [];
      expect(runs).toContain(`${viewer.firstName} ${viewer.lastName}`);
      expect(runs).toContain(ROOM_NAME);
    });

    await test.step("Download is disabled while Print and Copy stay allowed", async () => {
      const { permissions } = (await editor.getEditorConfig()).document;
      expect(permissions.download).toBe(false);
      expect(permissions.print).toBe(true);
      expect(permissions.copy).toBe(true);
      await editor.close();
    });
  });
});

test.describe("VDR room: File lifetime", () => {
  let myRooms: MyRooms;

  test.beforeEach(async ({ page, api }) => {
    myRooms = new MyRooms(page, api.portalDomain);
  });

  const lifetimeCases = [
    {
      title: "moved to Trash",
      deletePermanently: false,
      tooltip: "The file will be moved to Trash",
    },
    {
      title: "deleted permanently",
      deletePermanently: true,
      tooltip: "The file will be deleted permanently",
    },
  ];

  for (const lifetimeCase of lifetimeCases) {
    test(`Lifetime badge warns that the file will be ${lifetimeCase.title}`, async ({
      page,
      apiSdk,
      login,
    }) => {
      const roomId = await apiSdk.rooms.createRoomWithSettings(
        "owner",
        VDR_ROOM,
        {
          denyDownload: false,
          watermark: { enabled: false },
          lifetime: {
            enabled: true,
            value: 1,
            period: vdrLifetimePeriod.day,
            deletePermanently: lifetimeCase.deletePermanently,
          },
        },
      );
      await apiSdk.files.uploadToFolder("owner", roomId, FILE_PATH);

      await test.step("Owner logs in", async () => {
        await login.loginToPortal();
      });

      await test.step("Move the browser clock into the last 10% of the lifetime", async () => {
        await page.clock.setFixedTime(Date.now() + 23 * 60 * 60 * 1000);
      });

      await test.step("Open the room", async () => {
        await myRooms.openWithoutEmptyCheck();
        await myRooms.roomsTable.openRoomByName(ROOM_NAME);
      });

      await test.step("File shows the lifetime badge with the right tooltip text", async () => {
        await myRooms.filesTable.expectLifetimeIconVisible(FILE_NAME);
        await myRooms.filesTable.expectLifetimeTooltipContains(
          FILE_NAME,
          lifetimeCase.tooltip,
        );
      });
    });
  }

  test("Enabling lifetime for a room with files asks for confirmation", async ({
    page,
    apiSdk,
    login,
  }) => {
    const vdr = new VdrRoomSettings(page);
    const lifetimeDialog = new LifetimeDialog(page);

    const roomId = await apiSdk.rooms.createRoomWithSettings(
      "owner",
      VDR_ROOM,
      { lifetime: { enabled: false } },
    );
    await apiSdk.files.uploadToFolder("owner", roomId, FILE_PATH);

    await test.step("Owner opens Edit room", async () => {
      await login.loginToPortal();
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openContextMenu(ROOM_NAME);
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.editRoom,
      );
      await vdr.expectFileLifetimeChecked(false);
    });

    await test.step("Cancel in the warning keeps File lifetime off", async () => {
      await vdr.clickFileLifetimeToggle();
      await lifetimeDialog.expectVisible();
      await lifetimeDialog.clickCancel();
      await vdr.expectFileLifetimeChecked(false);
    });

    await test.step("OK in the warning turns File lifetime on", async () => {
      await vdr.clickFileLifetimeToggle();
      await lifetimeDialog.expectVisible();
      await lifetimeDialog.clickOk();
      await vdr.expectFileLifetimeChecked(true);
    });
  });
});
