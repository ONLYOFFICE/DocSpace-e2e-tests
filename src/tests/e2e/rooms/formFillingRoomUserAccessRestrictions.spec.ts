import { test } from "@/src/fixtures";
import MyRooms from "@/src/objects/rooms/Rooms";
import { ShortTour } from "@/src/objects/rooms/ShortTourModal";
import RoomInfoPanel from "@/src/objects/rooms/RoomInfoPanel";
import RoomsInviteDialog from "@/src/objects/rooms/RoomsInviteDialog";
import Login from "@/src/objects/common/Login";

test.describe("FormFilling room - User access restrictions", () => {
  let myRooms: MyRooms;
  let shortTour: ShortTour;
  let roomInfoPanel: RoomInfoPanel;
  let roomsInviteDialog: RoomsInviteDialog;
  let login: Login;

  test.beforeEach(async ({ page, api }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    shortTour = new ShortTour(page);
    roomInfoPanel = new RoomInfoPanel(page);
    roomsInviteDialog = new RoomsInviteDialog(page);
    login = new Login(page, api.portalDomain);

    // Login and create FormFilling room
    await login.loginToPortal();
    await myRooms.createFormFillingRoom("FormFillingRoom");
  });

  test("Add manually user to room", async ({ apiSdk }) => {
    // Create a User type member via API
    const { userData } = await apiSdk.profiles.addMember("owner", "User");
    const userEmail = userData.email;

    await test.step("Open room info panel", async () => {
      await shortTour.clickSkipTour();
      await myRooms.infoPanel.open();
      // Navigate to the Contacts tab to manage users
      await myRooms.infoPanel.openTab("Contacts");
    });

    await test.step("Add user with default access Form filler", async () => {
      await roomInfoPanel.clickAddUser();
      // Open people list to select existing user
      await roomsInviteDialog.openPeopleList();
      await roomsInviteDialog.contactsPanel.selectUserByEmail(userEmail);
      await roomsInviteDialog.contactsPanel.clickSelectButton();
      await roomsInviteDialog.checkAddedUserExist(userEmail);
      // Verify the default role is set to Form filler
      await roomsInviteDialog.verifyUserRole(userEmail, "Form filler");
      await roomsInviteDialog.submitInviteDialog();
    });

    await test.step("Add user with Content creator access", async () => {
      const email = "testContentCreator@example.com";
      // Open invite dialog
      await roomInfoPanel.clickAddUser();
      // Select Content creator access
      await roomsInviteDialog.openAccessOptions();
      await roomsInviteDialog.selectAccessOption("Content creator");
      await roomsInviteDialog.fillSearchInviteInput(email);
      await roomsInviteDialog.clickAddUserToInviteList(email);
      await roomsInviteDialog.checkAddedUserExist(email);
      // Verify the role is set to Content creator at list users
      await roomsInviteDialog.verifyUserRole(email, "Content creator");
      await roomsInviteDialog.submitInviteDialog();
    });

    await test.step("User can't be added as Room Manager", async () => {
      const email = "testRoomManager@example.com";
      // Open invite dialog
      await roomInfoPanel.clickAddUser();
      // Select Room manager access
      await roomsInviteDialog.openAccessOptions();
      await roomsInviteDialog.selectAccessOption("Room manager");
      await roomsInviteDialog.fillSearchInviteInput(email);
      await roomsInviteDialog.clickAddUserToInviteList(email);
      await roomsInviteDialog.checkAddedUserExist(email);
      // Verify the role changed to Content creator at list users
      await roomsInviteDialog.verifyUserRole(email, "Content creator");
      // Verify the warning icon is visible
      await roomsInviteDialog.checkRoleWarningVisible();
      await roomsInviteDialog.submitInviteDialog();
    });
  });
});
