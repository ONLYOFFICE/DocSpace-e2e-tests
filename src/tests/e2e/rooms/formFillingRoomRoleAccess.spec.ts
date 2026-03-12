import { test } from "@/src/fixtures";
import { expect, BrowserContext, Page } from "@playwright/test";
import { ShortTour } from "@/src/objects/rooms/ShortTourModal";
import MyRooms from "@/src/objects/rooms/Rooms";
import FilesTable from "@/src/objects/files/FilesTable";
import FilesPdfForm from "@/src/objects/files/FilesPdfForm";
import RoomInfoPanel from "@/src/objects/rooms/RoomInfoPanel";
import RoomsInviteDialog from "@/src/objects/rooms/RoomsInviteDialog";
import RoomInviteLogin from "@/src/objects/rooms/RoomInviteLogin";
import Login from "@/src/objects/common/Login";
import {
  setupClipboardPermissions,
  setupIncognitoContext,
  cleanupIncognitoContext,
  getLinkFromClipboard,
  ensureIncognitoPage,
} from "@/src/utils/helpers/linkTest";
import { formFillingRoomPdfContextMenuOption } from "@/src/utils/constants/files";

// Tests for role-based form visibility in FormFilling rooms
test.describe("FormFillingRoomRoleBasedFormVisibility", () => {
  // 5 minutes — test involves multiple browser contexts and form filling
  test.describe.configure({ timeout: 300000 });

  test("FormFiller sees only own completed forms, ContentCreator sees all", async ({
    page,
    browser,
    api,
    apiSdk,
  }) => {
    let ffData!: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    };
    let ccData!: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    };
    let myRooms: MyRooms;
    let roomInfoPanel: RoomInfoPanel;
    let roomsInviteDialog: RoomsInviteDialog;

    // Setup via API
    await test.step("Create room, upload PDF, create users", async () => {
      const roomResponse = await apiSdk.rooms.createRoom("owner", {
        title: "FormFillingRoom",
        roomType: "FillingFormsRoom",
      });
      const roomId = (await roomResponse.json()).response.id;

      await apiSdk.files.uploadToFolder(
        "owner",
        roomId,
        "data/rooms/PDF from device.pdf",
      );

      const ffResult = await apiSdk.profiles.addMember("owner", "User");
      ffData = ffResult.userData;

      const ccResult = await apiSdk.profiles.addMember("owner", "User");
      ccData = ccResult.userData;
    });

    // Owner logs in, opens room
    await test.step("Owner logs in and opens room", async () => {
      const login = new Login(page, api.portalDomain);
      await login.loginToPortal();

      myRooms = new MyRooms(page, api.portalDomain);
      await myRooms.roomsTable.openRoomByName("FormFillingRoom");

      const shortTour = new ShortTour(page);
      await shortTour.clickSkipTour();
      await myRooms.infoPanel.close();

      roomInfoPanel = new RoomInfoPanel(page);
      roomsInviteDialog = new RoomsInviteDialog(page);

      // Start filling so the form becomes accessible to room members
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      await myRooms.filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.startFilling,
      );
      await shortTour.clickModalCloseButton();
    });

    // Get FormFiller invite link (default access)
    let ffLink!: string;
    await test.step("Enable invite link with FormFiller access", async () => {
      await setupClipboardPermissions(page);
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.enableInviteViaLink();
      ffLink = await getLinkFromClipboard(page);
    });

    // Join room via invite link in incognito
    async function joinViaInviteLink(
      link: string,
      email: string,
      password: string,
    ): Promise<{ context: BrowserContext; page: Page }> {
      const { context, page: userPage } = await setupIncognitoContext(browser);
      await userPage.goto(link, { waitUntil: "load" });

      const inviteLogin = new RoomInviteLogin(userPage);
      await inviteLogin.login(email, password);

      await userPage.waitForURL(/.*rooms.*/, { waitUntil: "load" });

      const shortTour = new ShortTour(userPage);
      await shortTour.clickSkipTour();

      return { context, page: userPage };
    }

    // Fill and submit the PDF form (opens in a new tab, then closes it)
    async function fillForm(userPage: Page) {
      ensureIncognitoPage(userPage);
      await expect(userPage.getByLabel("PDF from device,")).toBeVisible();

      const filesTable = new FilesTable(userPage);
      const pagePromise = userPage.context().waitForEvent("page");
      await filesTable.openContextMenuForItem("PDF from device");
      await filesTable.contextMenu.clickOption("Fill");

      const pdfPage = await pagePromise;
      await pdfPage.waitForLoadState("load");
      await pdfPage.waitForSelector('iframe[name="frameEditor"]', {
        state: "attached",
        timeout: 60000,
      });
      const pdfForm = new FilesPdfForm(pdfPage);
      await expect(pdfForm.submitButton).toBeVisible({ timeout: 60000 });
      const pdfCompleted = await pdfForm.clickSubmitButton();
      await pdfCompleted.chooseBackToRoom();
      await pdfPage.close();

      // Ensure original page still shows the room
      await expect(userPage.getByLabel("PDF from device,")).toBeVisible();
    }

    // Navigate into Complete > PDF from device subfolder
    async function openCompleteFolder(userPage: Page) {
      await userPage.reload({ waitUntil: "load" });

      // After reload ContentCreator may land on the rooms list — navigate into the room if needed
      if (!userPage.url().includes("/rooms/shared/")) {
        const userRooms = new MyRooms(userPage, api.portalDomain);
        await userRooms.roomsTable.openRoomByName("FormFillingRoom");
      }

      await expect(userPage.getByLabel("PDF from device,")).toBeVisible();

      const filesTable = new FilesTable(userPage);
      await filesTable.openContextMenuForItem("Complete");
      await filesTable.contextMenu.clickOption("Open");
      await expect(
        userPage.getByRole("heading", { name: "Complete" }),
      ).toBeVisible();

      await filesTable.openContextMenuForItem("PDF from device");
      await filesTable.contextMenu.clickOption("Open");
    }

    // FormFiller joins and fills the form
    let ffCtx!: BrowserContext;
    let ffPage!: Page;

    await test.step("FormFiller joins via invite link and fills the form", async () => {
      ({ context: ffCtx, page: ffPage } = await joinViaInviteLink(
        ffLink,
        ffData.email,
        ffData.password,
      ));
      await fillForm(ffPage);
    });

    // Change invite link to ContentCreator access
    let ccLink!: string;
    await test.step("Change invite link to ContentCreator access", async () => {
      await page.reload({ waitUntil: "load" });
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await roomInfoPanel.clickAddUser();

      await roomsInviteDialog.openInviteLinkSettings();
      await roomsInviteDialog.roleAccess.selectRoleAccessType("contentCreator");
      await roomsInviteDialog.saveAndCopyInviteLinkSettings();
      ccLink = await getLinkFromClipboard(page);
    });

    // ContentCreator joins and fills the form
    let ccCtx!: BrowserContext;
    let ccPage!: Page;

    await test.step("ContentCreator joins via invite link and fills the form", async () => {
      ({ context: ccCtx, page: ccPage } = await joinViaInviteLink(
        ccLink,
        ccData.email,
        ccData.password,
      ));
      await fillForm(ccPage);
    });

    // Verify visibility
    const ffName = `${ffData.firstName} ${ffData.lastName}`;
    const ccName = `${ccData.firstName} ${ccData.lastName}`;

    await test.step("FormFiller sees only own form in Complete folder", async () => {
      await openCompleteFolder(ffPage);

      await expect(ffPage.getByLabel(new RegExp(ffName))).toBeVisible();
      await expect(ffPage.getByLabel(new RegExp(ccName))).not.toBeVisible();
    });

    await test.step("ContentCreator sees all forms in Complete folder", async () => {
      await openCompleteFolder(ccPage);

      await expect(ccPage.getByLabel(new RegExp(ffName))).toBeVisible();
      await expect(ccPage.getByLabel(new RegExp(ccName))).toBeVisible();
    });

    // Cleanup browser contexts
    await cleanupIncognitoContext(ffCtx, ffPage);
    await cleanupIncognitoContext(ccCtx, ccPage);
  });
});
