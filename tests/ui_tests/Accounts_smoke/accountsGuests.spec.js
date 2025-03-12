import { test, expect } from "@playwright/test";
import { PortalSetupApi } from "../../../api_library/portal_setup";
import { PortalLoginPage } from "../../../page_objects/portal_login_page";
import { GuestsPage } from "../../../page_objects/accounts/guestsPage";
import { UsersPage } from "../../../page_objects/accounts/usersPage";
import { RoomsApi } from "../../../api_library/files/rooms_api";
import MailChecker from "../../../utils/mailChecker.js";
import config from "../../../config/config";

test.describe("Guests Smoke Tests", () => {
  let apiContext;
  let portalSetup;
  let portalLoginPage;
  let guestsPage;
  let roomsApi;
  let usersPage;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext();
    portalSetup = new PortalSetupApi(apiContext);
    await portalSetup.setupPortal();
  });

  test.beforeEach(async ({ page }) => {
    portalLoginPage = new PortalLoginPage(page);
    guestsPage = new GuestsPage(page);
    usersPage = new UsersPage(page);
    roomsApi = new RoomsApi(apiContext, portalSetup.portalDomain, () =>
      portalSetup.getAuthHeaders(),
    );
    await portalLoginPage.loginToPortal(portalSetup.portalDomain);
    await guestsPage.navigateToGuests();
  });

  test.afterAll(async () => {
    await portalSetup.deletePortal(true, true);
    await apiContext.dispose();
  });

  test("Invite guest", async ({ page, browser }) => {
    const originalTitle = "Test Guest";
    const email = config.DOCSPACE_USER_EMAIL;
    await roomsApi.createRoom(originalTitle, "custom");
    await roomsApi.inviteGuestInRoom(roomsApi.roomId, email);
    await guestsPage.navigateToGuests();
    const guestEmailInList = page
      .getByTestId("text")
      .filter({ hasText: email })
      .first();
    await expect(guestEmailInList).toBeVisible();

    // Wait for email to arrive
    await new Promise((resolve) => setTimeout(resolve, 10000));

    const mailChecker = new MailChecker({
      url: config.QA_MAIL_DOMAIN,
      user: config.QA_MAIL_LOGIN_USER,
      pass: config.QA_MAIL_PASSWORD_USER,
      checkedFolder: "checked",
    });

    // Extract the invitation link from the email
    const invitationLink = await mailChecker.extractPortalLink({
      subject: "Join ONLYOFFICE DocSpace",
      portalName: portalSetup.portalDomain,
      timeoutSeconds: 300,
      moveOut: true,
    });

    // Open the invitation link in a new browser context
    const incognitoContext = await browser.newContext({ incognito: true });
    const newPage = await incognitoContext.newPage();
    const userFirstName = "guest-zero";
    const userLastName = "guest-zero";
    const userPassword = config.DOCSPACE_USER_PASSWORD;
    await newPage.goto(invitationLink);

    // Create a new UsersPage instance with the new page context
    const invitationGuestPage = new UsersPage(newPage);
    await invitationGuestPage.fillInviteEmailInput(
      userFirstName,
      userLastName,
      userPassword,
    );

    const userCell = newPage.locator(`text=${userFirstName} ${userLastName}`);
    await expect(userCell).toBeVisible();

    await incognitoContext.close();
  });

  test("Delete guest", async ({ page }) => {
    const email = config.DOCSPACE_USER_EMAIL;
    await guestsPage.deleteGuest();
    const guestEmailInList = page
      .getByTestId("text")
      .filter({ hasText: email })
      .first();
    await expect(guestEmailInList).not.toBeVisible();
  });

  test("Move guest to users", async ({ page }) => {
    const originalTitle = "Test Guest 2";
    const email = config.DOCSPACE_USER_EMAIL;
    await roomsApi.createRoom(originalTitle, "custom");
    await roomsApi.inviteGuestInRoom(roomsApi.roomId, email);
    await guestsPage.moveGuestToUsers();
    const guestEmailInList = page
      .getByTestId("text")
      .filter({ hasText: email })
      .first();
    await expect(guestEmailInList).not.toBeVisible();
    await usersPage.navigateToUsers();
    const userEmailInList = page
      .getByTestId("text")
      .filter({ hasText: email })
      .first();
    await expect(userEmailInList).toBeVisible();
  });
});
