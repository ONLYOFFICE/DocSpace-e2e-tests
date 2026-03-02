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

    await test.step("Add user with Room Manager access - should show restriction", async () => {
      await roomInfoPanel.clickAddUser();
      // Open people list to select existing user
      await roomsInviteDialog.openPeopleList();

      // Change access type to Room Manager before selecting user
      await roomsInviteDialog.contactsPanel.selectAccessType("roomManager");

      // Select user from the list
      await roomsInviteDialog.contactsPanel.selectUserByEmail(userEmail);
      await roomsInviteDialog.contactsPanel.clickSelectButton();

      // await roomsInviteDialog.checkAddedUserExist(userEmail);

      // Verify the role changed to Content creator (restriction applied)
      await roomsInviteDialog.verifyUserRole(userEmail, "Content creator");

      // Verify the warning icon about access restriction is visible
      await roomsInviteDialog.checkRoleWarningVisible();

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

    await test.step("Add user with Form filler access", async () => {
      const email = "testFormFiller@example.com";
      // Open invite dialog
      await roomInfoPanel.clickAddUser();
      // Select Form filler access
      await roomsInviteDialog.openAccessOptions();
      await roomsInviteDialog.selectAccessOption("Form filler");
      await roomsInviteDialog.fillSearchInviteInput(email);
      await roomsInviteDialog.clickAddUserToInviteList(email);
      await roomsInviteDialog.checkAddedUserExist(email);
      // Verify the role is set to Form filler at list users
      await roomsInviteDialog.verifyUserRole(email, "Form filler");
      await roomsInviteDialog.submitInviteDialog();
    });
  });

  test("RoomAdmin can be added as Room Manager", async ({ apiSdk }) => {
    // Create a RoomAdmin type member via API
    const { userData } = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const userEmail = userData.email;

    await test.step("Open room info panel", async () => {
      await shortTour.clickSkipTour();
      await myRooms.infoPanel.open();
      // Navigate to the Contacts tab to manage users
      await myRooms.infoPanel.openTab("Contacts");
    });

    await test.step("Add RoomAdmin with Room Manager access - should succeed without restriction", async () => {
      await roomInfoPanel.clickAddUser();
      // Open people list to select existing user
      await roomsInviteDialog.openPeopleList();

      // Change access type to Room Manager before selecting user
      await roomsInviteDialog.contactsPanel.selectAccessType("roomManager");

      // Select user from the list
      await roomsInviteDialog.contactsPanel.selectUserByEmail(userEmail);
      await roomsInviteDialog.contactsPanel.clickSelectButton();

      // Verify the role remains Room Manager (no restriction applied)
      await roomsInviteDialog.verifyUserRole(userEmail, "Room manager");

      await roomsInviteDialog.submitInviteDialog();
    });
  });

  test("DocspaceAdmin can be added as Room Manager", async ({ apiSdk }) => {
    // Create a DocSpaceAdmin type member via API
    const { userData } = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const userEmail = userData.email;

    await test.step("Open room info panel", async () => {
      await shortTour.clickSkipTour();
      await myRooms.infoPanel.open();
      // Navigate to the Contacts tab to manage users
      await myRooms.infoPanel.openTab("Contacts");
    });

    await test.step("Add DocspaceAdmin with Room Manager access - should succeed without restriction", async () => {
      await roomInfoPanel.clickAddUser();
      // Open people list to select existing user
      await roomsInviteDialog.openPeopleList();

      // Change access type to Room Manager before selecting user
      await roomsInviteDialog.contactsPanel.selectAccessType("roomManager");

      // Select user from the list
      await roomsInviteDialog.contactsPanel.selectUserByEmail(userEmail);
      await roomsInviteDialog.contactsPanel.clickSelectButton();

      // Verify the role remains Room Manager (no restriction applied)
      await roomsInviteDialog.verifyUserRole(userEmail, "Room manager");

      await roomsInviteDialog.submitInviteDialog();
    });
  });
});
