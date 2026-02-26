import { test } from "@/src/fixtures";
import { ShortTour } from "@/src/objects/rooms/ShortTourModal";
import MyRooms from "@/src/objects/rooms/Rooms";
import { expect } from "@playwright/test";
import RoomInfoPanel from "@/src/objects/rooms/RoomInfoPanel";
import RoomsInviteDialog from "@/src/objects/rooms/RoomsInviteDialog";
import Login from "@/src/objects/common/Login";
import RoomGuestRegistration from "@/src/objects/rooms/RoomGuestRegistration";
import RoomInviteLogin from "@/src/objects/rooms/RoomInviteLogin";
import { BrowserContext, Page } from "@playwright/test";
import {
  setupClipboardPermissions,
  setupIncognitoContext,
  cleanupIncognitoContext,
  getLinkFromClipboard,
  ensureIncognitoPage,
} from "@/src/utils/helpers/linkTest";

/**
 * Test suite for "Invite via link" functionality in FormFilling rooms.
 *
 * Covers:
 * - Enabling/disabling invite via link toggle and toast notification
 * - Changing access type for the invite link (Form Filler, Content Creator)
 * - Configuring link settings: user limit, expiration date
 * - Verifying that Room Manager role is disabled for invite links
 * - Enforcing user limit: "Link no longer available" after limit is reached
 * - Opening invite link in incognito: anonymous email input page
 * - Existing user login via invite link (Form Filler and Content Creator)
 * - New user registration via invite link as a guest
 * - Verifying that joined users appear in room contacts on the owner's page
 *
 * Prerequisites:
 * - Each test creates a new FormFilling room via API with a PDF form uploaded
 * - Owner logs in, opens the room, and closes the info panel before each test
 * - Incognito browser contexts are used to simulate anonymous/guest access
 */
test.describe("FormFilling room - Invite via link tests", () => {
  let myRooms: MyRooms;
  let shortTour: ShortTour;
  let roomInfoPanel: RoomInfoPanel;
  let roomsInviteDialog: RoomsInviteDialog;
  let login: Login;
  let incognitoContext: BrowserContext | null = null;
  let incognitoPage: Page | null = null;

  // Create a FormFilling room with a PDF form, login as owner and open the room
  test.beforeEach(async ({ page, api, apiSdk }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    shortTour = new ShortTour(page);
    roomInfoPanel = new RoomInfoPanel(page);
    roomsInviteDialog = new RoomsInviteDialog(page);
    login = new Login(page, api.portalDomain);

    const response = await apiSdk.rooms.createRoom("owner", {
      title: "FormFillingRoom",
      roomType: "FillingFormsRoom",
    });
    const body = await response.json();
    const roomId = body.response.id;
    await apiSdk.files.uploadToFolder(
      "owner",
      roomId,
      "data/rooms/PDF from device.pdf",
    );

    await login.loginToPortal();
    await myRooms.roomsTable.openRoomByName("FormFillingRoom");
    await shortTour.clickSkipTour();
    await myRooms.infoPanel.close();
  });

  // Clean up incognito browser context after each test
  test.afterEach(async () => {
    await cleanupIncognitoContext(incognitoContext, incognitoPage);
  });

  // Verify that enabling the toggle copies the link and shows a toast notification
  test("Enable invite via link and verify toast", async () => {
    await test.step("Open invite dialog from info panel", async () => {
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.checkInviteTitleExist();
    });

    await test.step("Enable invite via link toggle", async () => {
      await roomsInviteDialog.enableInviteViaLink();
    });
  });

  // Verify that the access type dropdown can be changed and the UI updates accordingly
  test("Change invite link access type to Content Creator", async () => {
    await test.step("Open invite dialog and enable invite via link", async () => {
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.enableInviteViaLink();
    });

    await test.step("Open invite link settings", async () => {
      await roomsInviteDialog.openInviteLinkSettings();
    });

    await test.step("Select Content Creator access type", async () => {
      await roomsInviteDialog.roleAccess.selectRoleAccessType("contentCreator");
    });

    await test.step("Verify access selector updated", async () => {
      await expect(roomsInviteDialog.roleAccess.accessSelector).toContainText(
        "Content creator",
      );
    });
  });

  // Verify link settings panel: set user limit to 10, change expiration date to tomorrow, save
  test("Configure invite link settings", async () => {
    await test.step("Open invite dialog and enable invite via link", async () => {
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.enableInviteViaLink();
    });

    await test.step("Open invite link settings panel", async () => {
      await roomsInviteDialog.openInviteLinkSettings();
    });

    await test.step("Enable and set user limit", async () => {
      await roomsInviteDialog.inviteLinkSettings.clickUserLimitToggle();
      await roomsInviteDialog.inviteLinkSettings.fillUserLimit("10");
    });

    await test.step("Remove default expiration date and set tomorrow", async () => {
      await expect(
        roomsInviteDialog.inviteLinkSettings.datePicker,
      ).toBeVisible();
      await roomsInviteDialog.inviteLinkSettings.removeDatePicker();
      await roomsInviteDialog.inviteLinkSettings.selectTomorrow();
    });

    await test.step("Save and copy link settings", async () => {
      await roomsInviteDialog.saveAndCopyInviteLinkSettings();
    });
  });

  // Room Manager role should be disabled in the access type dropdown for invite links
  test("Room Manager access is not available for invite via link", async () => {
    await test.step("Open invite dialog and enable invite via link", async () => {
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.enableInviteViaLink();
    });

    await test.step("Open access type dropdown", async () => {
      await roomsInviteDialog.openInviteLinkSettings();
      await expect(roomsInviteDialog.roleAccess.accessSelector).toBeVisible();
      await roomsInviteDialog.roleAccess.accessSelector.click();
    });

    await test.step("Verify Room Manager option is not available", async () => {
      await roomsInviteDialog.roleAccess.checkRoleAccessTypeDisabled(
        "roomManager",
      );
    });
  });

  // Set user limit to 1, register first guest via link, then verify second guest
  // sees "Link no longer available" message when the limit is exceeded
  test("Invite link respects user limit", async ({ page, browser }) => {
    const firstGuest = {
      firstName: "LimitGuestOne",
      lastName: "TestUser",
      password: "TestPassword123!",
      email: `limit_guest_one_${Date.now()}@test.com`,
    };

    await test.step("Enable invite via link with user limit 1", async () => {
      await setupClipboardPermissions(page);
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.enableInviteViaLink();
      await roomsInviteDialog.openInviteLinkSettings();
      await roomsInviteDialog.inviteLinkSettings.clickUserLimitToggle();
      await roomsInviteDialog.inviteLinkSettings.fillUserLimit("1");
      await roomsInviteDialog.saveAndCopyInviteLinkSettings();
    });

    let inviteLink: string;

    await test.step("Get invite link from clipboard", async () => {
      inviteLink = await getLinkFromClipboard(page);
    });

    await test.step("First guest registers via invite link", async () => {
      const result = await setupIncognitoContext(browser);
      incognitoContext = result.context;
      incognitoPage = result.page;

      await incognitoPage.goto(inviteLink, { waitUntil: "load" });

      const inviteLogin = new RoomInviteLogin(incognitoPage);
      await inviteLogin.fillEmail(firstGuest.email);
      await inviteLogin.clickContinue();

      ensureIncognitoPage(incognitoPage);
      const registration = new RoomGuestRegistration(incognitoPage);
      await registration.register(
        firstGuest.firstName,
        firstGuest.lastName,
        firstGuest.password,
      );

      await incognitoPage.waitForURL(/.*rooms.*/, { waitUntil: "load" });
    });

    await test.step("Close first incognito session", async () => {
      await cleanupIncognitoContext(incognitoContext, incognitoPage);
      incognitoContext = null;
      incognitoPage = null;
    });

    await test.step("Second guest opens same invite link and sees limit message", async () => {
      const result = await setupIncognitoContext(browser);
      incognitoContext = result.context;
      incognitoPage = result.page;

      await incognitoPage.goto(inviteLink, { waitUntil: "load" });

      await expect(
        incognitoPage.getByText("Link no longer available"),
      ).toBeVisible();
    });
  });

  // Create a user via API, generate invite link with default Form Filler access,
  // login in incognito, verify room with PDF opens, and check user in contacts
  test("Existing user opens invite link with Form Filler access and logs in", async ({
    page,
    browser,
    apiSdk,
  }) => {
    let userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    };

    await test.step("Create user via API", async () => {
      const result = await apiSdk.profiles.addMember("owner", "User");
      userData = result.userData;
    });

    await test.step("Open invite dialog and enable invite via link", async () => {
      await setupClipboardPermissions(page);
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.enableInviteViaLink();
    });

    let inviteLink: string;

    await test.step("Get invite link from clipboard", async () => {
      inviteLink = await getLinkFromClipboard(page);
    });

    await test.step("Open invite link in incognito and login", async () => {
      const result = await setupIncognitoContext(browser);
      incognitoContext = result.context;
      incognitoPage = result.page;

      await incognitoPage.goto(inviteLink, { waitUntil: "load" });

      const inviteLogin = new RoomInviteLogin(incognitoPage);
      await inviteLogin.login(userData.email, userData.password);
    });

    await test.step("Verify FormFillingRoom opens with welcome page", async () => {
      ensureIncognitoPage(incognitoPage);

      await incognitoPage.waitForURL(/.*rooms.*/, { waitUntil: "load" });

      const incognitoShortTour = new ShortTour(incognitoPage);
      const tourVisible = await incognitoShortTour.isTourVisible(6000);
      if (tourVisible) {
        await incognitoShortTour.clickSkipTour();
      }
    });

    await test.step("Verify PDF form is visible in room", async () => {
      ensureIncognitoPage(incognitoPage);

      await expect(incognitoPage.getByLabel("PDF from device,")).toBeVisible();
    });

    await test.step("Verify user appears in room contacts on owner page", async () => {
      await page.reload({ waitUntil: "load" });
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await roomInfoPanel.search(userData.firstName);
      await expect(
        page
          .locator("p")
          .filter({ hasText: `${userData.firstName} ${userData.lastName}` })
          .first(),
      ).toBeVisible();
    });
  });

  // Same as Form Filler test, but set Content Creator access type before copying the link
  test("Existing user opens invite link with Content Creator access and logs in", async ({
    page,
    browser,
    apiSdk,
  }) => {
    let userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    };

    await test.step("Create user via API", async () => {
      const result = await apiSdk.profiles.addMember("owner", "User");
      userData = result.userData;
    });

    await test.step("Open invite dialog and enable invite via link", async () => {
      await setupClipboardPermissions(page);
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.enableInviteViaLink();
    });

    await test.step("Open invite link settings and set Content Creator access", async () => {
      await roomsInviteDialog.openInviteLinkSettings();
      await roomsInviteDialog.roleAccess.selectRoleAccessType("contentCreator");
      await roomsInviteDialog.saveAndCopyInviteLinkSettings();
    });

    let inviteLink: string;

    await test.step("Get invite link from clipboard", async () => {
      inviteLink = await getLinkFromClipboard(page);
    });

    await test.step("Open invite link in incognito and login", async () => {
      const result = await setupIncognitoContext(browser);
      incognitoContext = result.context;
      incognitoPage = result.page;

      await incognitoPage.goto(inviteLink, { waitUntil: "load" });

      const inviteLogin = new RoomInviteLogin(incognitoPage);
      await inviteLogin.login(userData.email, userData.password);
    });

    await test.step("Verify FormFillingRoom opens with welcome page", async () => {
      ensureIncognitoPage(incognitoPage);

      await incognitoPage.waitForURL(/.*rooms.*/, { waitUntil: "load" });

      const incognitoShortTour = new ShortTour(incognitoPage);
      const tourVisible = await incognitoShortTour.isTourVisible(6000);
      if (tourVisible) {
        await incognitoShortTour.clickSkipTour();
      }
    });

    await test.step("Verify PDF form is visible in room", async () => {
      ensureIncognitoPage(incognitoPage);

      await expect(incognitoPage.getByLabel("PDF from device,")).toBeVisible();
    });

    await test.step("Verify user appears in room contacts on owner page", async () => {
      await page.reload({ waitUntil: "load" });
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await roomInfoPanel.search(userData.firstName);
      await expect(
        page
          .locator("p")
          .filter({ hasText: `${userData.firstName} ${userData.lastName}` })
          .first(),
      ).toBeVisible();
    });
  });

  // Open invite link with a non-existing email, complete guest registration,
  // verify room with PDF opens, and check guest appears in room contacts
  test("Non-existing user registers via invite link and joins room as guest", async ({
    page,
    browser,
  }) => {
    const guestData = {
      firstName: "InviteGuest",
      lastName: "TestUser",
      password: "TestPassword123!",
      email: `guest_${Date.now()}@test.com`,
    };

    await test.step("Open invite dialog and enable invite via link", async () => {
      await setupClipboardPermissions(page);
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.enableInviteViaLink();
    });

    let inviteLink: string;

    await test.step("Get invite link from clipboard", async () => {
      inviteLink = await getLinkFromClipboard(page);
    });

    await test.step("Open invite link in incognito and enter non-existing email", async () => {
      const result = await setupIncognitoContext(browser);
      incognitoContext = result.context;
      incognitoPage = result.page;

      await incognitoPage.goto(inviteLink, { waitUntil: "load" });

      const inviteLogin = new RoomInviteLogin(incognitoPage);
      await inviteLogin.fillEmail(guestData.email);
      await inviteLogin.clickContinue();
    });

    await test.step("Fill registration form and submit", async () => {
      ensureIncognitoPage(incognitoPage);

      const registration = new RoomGuestRegistration(incognitoPage);
      await registration.register(
        guestData.firstName,
        guestData.lastName,
        guestData.password,
      );
    });

    await test.step("Verify FormFillingRoom opens with welcome page", async () => {
      ensureIncognitoPage(incognitoPage);

      await incognitoPage.waitForURL(/.*rooms.*/, { waitUntil: "load" });

      const incognitoShortTour = new ShortTour(incognitoPage);
      const tourVisible = await incognitoShortTour.isTourVisible(6000);
      if (tourVisible) {
        await incognitoShortTour.clickSkipTour();
      }
    });

    await test.step("Verify PDF form is visible in room", async () => {
      ensureIncognitoPage(incognitoPage);

      await expect(incognitoPage.getByLabel("PDF from device,")).toBeVisible();
    });

    await test.step("Verify guest appears in room contacts on owner page", async () => {
      await page.reload({ waitUntil: "load" });
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await roomInfoPanel.search(guestData.firstName);
      await expect(
        page
          .locator("p")
          .filter({ hasText: `${guestData.firstName} ${guestData.lastName}` })
          .first(),
      ).toBeVisible();
    });
  });
});
