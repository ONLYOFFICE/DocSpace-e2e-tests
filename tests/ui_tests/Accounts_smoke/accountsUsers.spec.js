import { test, expect } from "@playwright/test";
import { PortalSetupApi } from "../../../api_library/portal_setup";
import { PortalLoginPage } from "../../../page_objects/portal_login_page";
import { UsersPage } from "../../../page_objects/accounts/usersPage";
import MailChecker from "../../../utils/mailChecker.js";
import config from "../../../config/config";

test.describe("Users Smoke Tests", () => {
  let apiContext;
  let portalSetup;
  let portalLoginPage;
  let usersPage;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext();
    portalSetup = new PortalSetupApi(apiContext);
    await portalSetup.setupPortal();
  });

  test.beforeEach(async ({ page }) => {
    portalLoginPage = new PortalLoginPage(page);
    usersPage = new UsersPage(page);
    await portalLoginPage.loginToPortal(portalSetup.portalDomain);
    await usersPage.navigateToUsers();
  });

  test.afterAll(async () => {
    await portalSetup.deletePortal(true, true);
    await apiContext.dispose();
  });

  test("Invite user by email", async ({ page, browser }) => {
    const userEmail = config.DOCSPACE_USER_EMAIL;
    const portalName = portalSetup.portalDomain;
    await usersPage.inviteUserByEmail(userEmail);
    const userEmailInList = page
      .getByTestId("text")
      .filter({ hasText: userEmail })
      .first();
    await expect(userEmailInList).toBeVisible();

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
      portalName,
      timeoutSeconds: 300,
      moveOut: true,
    });

    // Open the invitation link in a new browser context
    const incognitoContext = await browser.newContext({ incognito: true });
    const newPage = await incognitoContext.newPage();
    const userFirstName = "user-zero";
    const userLastName = "user-zero";
    const userPassword = config.DOCSPACE_USER_PASSWORD;
    await newPage.goto(invitationLink);

    // Create a new UsersPage instance with the new page context
    const invitationUsersPage = new UsersPage(newPage);
    await invitationUsersPage.fillInviteEmailInput(
      userFirstName,
      userLastName,
      userPassword,
    );

    const userCell = newPage.locator(`text=${userFirstName} ${userLastName}`);
    await expect(userCell).toBeVisible();

    await incognitoContext.close();
  });

  test("Delete user from list", async ({ page }) => {
    await usersPage.deleteUser();
    const userEmailInList = page
      .getByTestId("text")
      .filter({ hasText: config.DOCSPACE_USER_EMAIL })
      .first();
    await expect(userEmailInList).not.toBeVisible();
  });

  test("invite user via link", async ({ browser, page }) => {
    // Get the invitation link
    await usersPage.inviteUserViaLink();

    // Wait for success message
    const copySuccess = await page.getByText(
      /Link has been copied to the clipboard. This link is valid for 7 days only./i,
    );
    await expect(copySuccess).toBeVisible();

    // Get the invitation link value
    const portalName = portalSetup.portalDomain;
    const invitationLink = page.locator(`input[value*="${portalName}"]`);
    const invitationLinkValue = await invitationLink.evaluate((el) => el.value);

    // Open the invitation link in a new incognito context
    const incognitoContext = await browser.newContext({ incognito: true });
    const newPage = await incognitoContext.newPage();
    const userEmail = config.DOCSPACE_USER_EMAIL;
    const userFirstName = "user-zero";
    const userLastName = "user-zero";
    const userPassword = config.DOCSPACE_USER_PASSWORD;
    await newPage.goto(invitationLinkValue);

    // Create a new UsersPage instance with the new page context
    const invitationUsersPage = new UsersPage(newPage);
    await invitationUsersPage.fillInviteLinkInput(
      userEmail,
      userFirstName,
      userLastName,
      userPassword,
    );

    const userCell = newPage.locator(`text=${userFirstName} ${userLastName}`);
    await expect(userCell).toBeVisible();

    await incognitoContext.close();
  });
});
