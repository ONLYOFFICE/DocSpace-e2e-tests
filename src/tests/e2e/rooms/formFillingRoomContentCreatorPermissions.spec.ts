import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import MyRooms from "@/src/objects/rooms/Rooms";
import { ShortTour } from "@/src/objects/rooms/ShortTourModal";
import RoomInfoPanel from "@/src/objects/rooms/RoomInfoPanel";
import RoomsInviteDialog from "@/src/objects/rooms/RoomsInviteDialog";
import Login from "@/src/objects/common/Login";

test.describe("FormFilling room - Content creator permissions", () => {
  let myRooms: MyRooms;
  let shortTour: ShortTour;
  let roomInfoPanel: RoomInfoPanel;
  let roomsInviteDialog: RoomsInviteDialog;
  let login: Login;

  let contentCreatorEmail: string;
  let contentCreatorPassword: string;
  let roomName: string;
  let roomId: number;

  test.beforeEach(async ({ page, api, apiSdk }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    shortTour = new ShortTour(page);
    roomInfoPanel = new RoomInfoPanel(page);
    roomsInviteDialog = new RoomsInviteDialog(page);
    login = new Login(page, api.portalDomain);

    // Create FormFilling room via API
    roomName = "FormFillingRoom_ContentCreator";
    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: roomName,
      roomType: "FillingFormsRoom",
    });
    const roomBody = await roomResponse.json();
    roomId = roomBody.response.id;

    // Upload a PDF file to the room
    await apiSdk.files.uploadToFolder(
      "owner",
      roomId,
      "data/rooms/PDF from device.pdf",
    );

    // Create a User type member via API
    const { userData } = await apiSdk.profiles.addMember("owner", "User");
    contentCreatorEmail = userData.email;
    contentCreatorPassword = userData.password;
  });

  test("Add user with Content creator role and verify permissions", async ({
    page,
  }) => {
    await test.step("Setup: Login as owner and add Content creator user via UI", async () => {
      // Login as owner
      await login.loginToPortal();

      // Navigate to the room
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(roomName);
      await shortTour.clickSkipTour();

      // Add user with Content creator role via UI
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await roomInfoPanel.clickAddUser();

      // Open people list to select existing user
      await roomsInviteDialog.openPeopleList();

      // Select Content creator access
      await roomsInviteDialog.contactsPanel.selectAccessType("contentCreator");

      // Select user from the list
      await roomsInviteDialog.contactsPanel.selectUserByEmail(
        contentCreatorEmail,
      );
      await roomsInviteDialog.contactsPanel.clickSelectButton();

      // Verify the role is set to Content creator
      await roomsInviteDialog.verifyUserRole(
        contentCreatorEmail,
        "Content creator",
      );
      await roomsInviteDialog.submitInviteDialog();

      // Verify user appears in Contacts list - wait for backend to process
      await myRooms.infoPanel.openTab("Contacts");
      await expect(
        page.getByText(contentCreatorEmail),
      ).toBeVisible({ timeout: 10000 });

      // Clear cookies to logout from owner account
      await page.context().clearCookies();
    });

    await test.step("Login as Content creator", async () => {
      await login.loginWithCredentials(
        contentCreatorEmail,
        contentCreatorPassword,
      );
      // Navigate to My Rooms page
      await myRooms.openWithoutEmptyCheck();
      // Open the room
      await myRooms.roomsTable.openRoomByName(roomName);
      // Skip tour
      await shortTour.clickSkipTour();
    });

    await test.step("Verify Content creator CANNOT invite users", async () => {
      // Open info panel and navigate to Contacts tab
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");

      // Verify "Add user" button is NOT visible (Content creator doesn't have permission to invite)
      await expect(roomInfoPanel.addUserButton).not.toBeVisible();
    });

    await test.step("Verify Content creator CAN upload forms/files", async () => {
      // Verify the add button (Actions) is visible and accessible
      // This indicates Content creator can upload files to the room
      await myRooms.navigation.checkAddButtonVisible();
    });

    await test.step("Verify Content creator CAN access Complete folder", async () => {
      await myRooms.infoPanel.close();
      await myRooms.filesTable.openContextMenuForItem("Complete");
      await myRooms.filesTable.contextMenu.clickOption("Open");
      await page.waitForURL(/.*filter\?folder=.*/);
      await myRooms.navigation.gotoBack();
    });

    await test.step("Verify Content creator CAN access In Process folder", async () => {
      await myRooms.filesTable.openContextMenuForItem("In process");
      await myRooms.filesTable.contextMenu.clickOption("Open");
      await page.waitForURL(/.*filter\?folder=.*/);
      await myRooms.navigation.gotoBack();
    });

    await test.step("Verify Content creator CAN view participant list", async () => {
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await expect(page.getByText(contentCreatorEmail)).toBeVisible();
    });

    await test.step("Verify Content creator CANNOT edit room settings", async () => {
      await myRooms.navigation.openContextMenu();
      await expect(
        myRooms.navigation.contextMenu.menu.getByText("Edit room"),
      ).not.toBeVisible();
      await myRooms.navigation.closeContextMenu();
    });

    await test.step("Verify Content creator CANNOT create/edit links", async () => {
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Share");
      await expect(
        page.getByText("Create and copy"),
      ).not.toBeVisible();
    });
  });
});
