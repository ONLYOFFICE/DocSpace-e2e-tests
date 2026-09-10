import { test } from "@/src/fixtures";
import { expect, Page } from "@playwright/test";
import MyRooms from "@/src/objects/rooms/Rooms";
import RoomInfoPanel from "@/src/objects/rooms/RoomInfoPanel";
import Files from "@/src/objects/files/Files";
import Login from "@/src/objects/common/Login";
import SpreadsheetEditor from "@/src/objects/files/SpreadsheetEditor";
import { PaymentApi } from "@/src/api/payment";

const ROOM_NAME = "History Export Room";
const HISTORY_FILE_NAME = "history-source.docx";

test.describe("Rooms: History tab export toolbar", () => {
  let myRooms: MyRooms;
  let roomInfoPanel: RoomInfoPanel;
  let roomId: number;

  test.beforeEach(async ({ page, api, apiSdk, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    roomInfoPanel = new RoomInfoPanel(page);

    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: ROOM_NAME,
      roomType: "CustomRoom",
    });
    roomId = (await roomResponse.json()).response.id;
    await apiSdk.files.createFile("owner", roomId, {
      title: HISTORY_FILE_NAME,
    });

    await login.loginToPortal();
    await myRooms.openWithoutEmptyCheck();
    await myRooms.roomsTable.openRoomByName(ROOM_NAME);
    await roomInfoPanel.open();
    await roomInfoPanel.openTab("History");
  });

  test("Toolbar is visible for all room types", async ({ apiSdk }) => {
    const rooms = await apiSdk.rooms.createAllRoomTypes("owner");

    for (const room of rooms) {
      await test.step(`${room.title}: Go to date and Export history are visible`, async () => {
        await myRooms.openWithoutEmptyCheck();
        await myRooms.roomsTable.openRoomByName(room.title);
        await roomInfoPanel.open();
        await roomInfoPanel.openTab("History");
        await roomInfoPanel.checkHistoryToolbarVisible();
      });
    }
  });

  test("Export history: all history report opens in the editor", async ({
    api,
  }) => {
    let reportPage: Page;

    await test.step("Precondition: upgrade the portal to a paid plan", async () => {
      // Export history is a paid feature - see the free-plan warning test below.
      const paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
      await paymentApi.setupPayment();
    });

    await test.step("Export the full activity history", async () => {
      reportPage = await roomInfoPanel.exportHistory("All history");
    });

    await test.step("A toast confirms the export", async () => {
      await roomInfoPanel.checkExportHistoryToastVisible();
    });

    await test.step("The report opens automatically in a new tab", async () => {
      const spreadsheet = new SpreadsheetEditor(reportPage);
      await spreadsheet.waitForLoad();
      await expect(reportPage).toHaveTitle(
        new RegExp(`Audit Trail Report \\(room-${roomId}\\)`),
      );
      await reportPage.close();
    });
  });

  test("Export history: custom date range report opens in the editor", async ({
    api,
  }) => {
    let reportPage: Page;

    await test.step("Precondition: upgrade the portal to a paid plan", async () => {
      const paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
      await paymentApi.setupPayment();
    });

    await test.step("Export a date range", async () => {
      reportPage = await roomInfoPanel.exportHistory("Date range");
    });

    await test.step("A toast confirms the export", async () => {
      await roomInfoPanel.checkExportHistoryToastVisible();
    });

    await test.step("The report opens automatically in a new tab", async () => {
      const spreadsheet = new SpreadsheetEditor(reportPage);
      await spreadsheet.waitForLoad();
      await expect(reportPage).toHaveTitle(
        new RegExp(`Audit Trail Report \\(room-${roomId}\\)`),
      );
      await reportPage.close();
    });
  });

  test("Export history: Cancel closes the popup without exporting", async () => {
    await roomInfoPanel.openExportHistoryMenu();
    await roomInfoPanel.cancelExportHistoryMenu();
  });

  // Export history should be available on the free plan too, but a pricing
  // plan warning blocks it instead - see Bug 83796.
  test.fail(
    "Export history: works on the free plan too [Bug 83796]",
    async () => {
      let reportPage: Page;

      await test.step("Export the full activity history", async () => {
        reportPage = await roomInfoPanel.exportHistory("All history");
      });

      await test.step("A toast confirms the export", async () => {
        await roomInfoPanel.checkExportHistoryToastVisible();
      });

      await test.step("The report opens automatically in a new tab", async () => {
        const spreadsheet = new SpreadsheetEditor(reportPage);
        await spreadsheet.waitForLoad();
        await expect(reportPage).toHaveTitle(
          new RegExp(`Audit Trail Report \\(room-${roomId}\\)`),
        );
        await reportPage.close();
      });
    },
  );

  test("Go to date: only the day with activity is selectable", async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayCrossesMonth = yesterday.getMonth() !== today.getMonth();

    await test.step("Open the calendar", async () => {
      await roomInfoPanel.checkHistoryExist(HISTORY_FILE_NAME);
      await roomInfoPanel.openGoToDateCalendar();
    });

    await test.step("A day with no history is disabled", async () => {
      // The room (and all its history) was just created today, so yesterday
      // has no activity to jump to - it's still shown in the grid (as a
      // leading/trailing cell of the adjacent month when today is the 1st).
      await roomInfoPanel.checkHistoryDayDisabled(
        yesterday.getDate(),
        yesterdayCrossesMonth,
      );
    });

    await test.step("Today is selectable and keeps the activity feed", async () => {
      await roomInfoPanel.selectHistoryDay(today.getDate());
      await roomInfoPanel.checkHistoryExist(HISTORY_FILE_NAME);
    });
  });
});

test.describe("Rooms: History export toolbar - access by user type", () => {
  let myRooms: MyRooms;
  let login: Login;
  let roomInfoPanel: RoomInfoPanel;
  let docSpaceAdminCreds: { email: string; password: string };
  let roomAdminCreds: { email: string; password: string };
  let userCreds: { email: string; password: string };
  let guestCreds: { email: string; password: string };

  test.beforeEach(async ({ page, api, apiSdk }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    login = new Login(page, api.portalDomain);
    roomInfoPanel = new RoomInfoPanel(page);

    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: ROOM_NAME,
      roomType: "CustomRoom",
    });
    const roomId = (await roomResponse.json()).response.id;

    const [docSpaceAdmin, roomAdmin, user, guest] = await Promise.all([
      apiSdk.profiles.addMember("owner", "DocSpaceAdmin"),
      apiSdk.profiles.addMember("owner", "RoomAdmin"),
      apiSdk.profiles.addMember("owner", "User"),
      apiSdk.profiles.addMember("owner", "Guest"),
    ]);
    docSpaceAdminCreds = docSpaceAdmin.userData;
    roomAdminCreds = roomAdmin.userData;
    userCreds = user.userData;
    guestCreds = guest.userData;

    const roomAdminId = (await roomAdmin.response.json()).response.id;
    const userId = (await user.response.json()).response.id;
    const guestId = (await guest.response.json()).response.id;

    await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
      invitations: [
        { id: roomAdminId, access: "Editing" },
        { id: userId, access: "Editing" },
        { id: guestId, access: "Editing" },
      ],
      notify: false,
    });
    // DocSpaceAdmin has portal-wide access to every room without an explicit invite.
  });

  async function openHistoryTabAs(email: string, password: string) {
    await login.loginWithCredentials(email, password);
    await myRooms.openWithoutEmptyCheck();
    await myRooms.roomsTable.openRoomByName(ROOM_NAME);
    await roomInfoPanel.open();
    await roomInfoPanel.openTab("History");
  }

  test("DocSpace Admin sees the Go to date / Export history toolbar", async () => {
    await openHistoryTabAs(
      docSpaceAdminCreds.email,
      docSpaceAdminCreds.password,
    );
    await roomInfoPanel.checkHistoryToolbarVisible();
  });

  test("Room Admin sees the Go to date / Export history toolbar", async () => {
    await openHistoryTabAs(roomAdminCreds.email, roomAdminCreds.password);
    await roomInfoPanel.checkHistoryToolbarVisible();
  });

  test("User sees the Go to date / Export history toolbar", async () => {
    await openHistoryTabAs(userCreds.email, userCreds.password);
    await roomInfoPanel.checkHistoryToolbarVisible();
  });

  test("Guest does NOT see the Go to date / Export history toolbar", async () => {
    await openHistoryTabAs(guestCreds.email, guestCreds.password);
    await roomInfoPanel.checkHistoryToolbarHidden();
  });
});

// The "Go to date" / "Export history" toolbar is a room-level History feature.
// It must NOT leak into the History tab of an individual file or folder,
// wherever that item lives - My Documents, inside a room, or the Forms app.
test.describe("History toolbar does not appear outside a room's own History tab", () => {
  const MY_DOCS_FILE_NAME = "outside-room-file.docx";
  const MY_DOCS_FOLDER_NAME = "Outside Room Folder";
  const ROOM_FILE_NAME = "room-inner-file.docx";
  const PDF_FORM_FILE = "data/rooms/PDF from device.pdf";
  const PDF_FORM_NAME = "PDF from device";

  test("My Documents: a file's own history has no toolbar", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    const files = new Files(page, api.portalDomain);
    await apiSdk.files.createFileInMyDocuments("owner", {
      title: MY_DOCS_FILE_NAME,
    });

    await login.loginToPortal();
    await files.open();
    await files.filesTable.selectFolderByName(MY_DOCS_FILE_NAME);
    await files.infoPanel.openTab("History");
    await files.infoPanel.checkHistoryToolbarHidden();
  });

  test("My Documents: a folder's own history has no toolbar", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    const files = new Files(page, api.portalDomain);
    const myDocumentsId = await apiSdk.folders.getMyDocumentsFolderId("owner");
    await apiSdk.files.createFolder(
      "owner",
      myDocumentsId,
      MY_DOCS_FOLDER_NAME,
    );

    await login.loginToPortal();
    await files.open();
    await files.filesTable.selectFolderByName(MY_DOCS_FOLDER_NAME);
    await files.infoPanel.openTab("History");
    await files.infoPanel.checkHistoryToolbarHidden();
  });

  test("Room: a file's own history has no toolbar (only the room's History does)", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    const myRooms = new MyRooms(page, api.portalDomain);
    const roomName = "Room With File History";
    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: roomName,
      roomType: "CustomRoom",
    });
    const roomId = (await roomResponse.json()).response.id;
    await apiSdk.files.createFile("owner", roomId, { title: ROOM_FILE_NAME });

    await login.loginToPortal();
    await myRooms.openWithoutEmptyCheck();
    await myRooms.roomsTable.openRoomByName(roomName);
    await myRooms.filesTable.selectFolderByName(ROOM_FILE_NAME);
    await myRooms.infoPanel.openTab("History");
    await myRooms.infoPanel.checkHistoryToolbarHidden();
  });

  test("Forms > Recent: a form's own history has no toolbar", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    const myRooms = new MyRooms(page, api.portalDomain);
    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: "FormFillingRoom_ToolbarCheck",
      roomType: "FillingFormsRoom",
    });
    const roomBody = await roomResponse.json();
    const uploadedFile = await apiSdk.files.uploadToFolder(
      "owner",
      roomBody.response.id,
      PDF_FORM_FILE,
    );
    await apiSdk.files.addToRecent("owner", uploadedFile.id);

    await login.loginToPortal();
    await myRooms.openFormsRecent();
    await myRooms.filesTable.selectFolderByName(PDF_FORM_NAME);
    await myRooms.infoPanel.openTab("History");
    await myRooms.infoPanel.checkHistoryToolbarHidden();
  });
});
