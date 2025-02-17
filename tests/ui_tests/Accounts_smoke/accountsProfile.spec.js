import { test, expect } from "@playwright/test";
import { PortalSetupApi } from "../../../api_library/portal_setup";
import { PortalLoginPage } from "../../../page_objects/portal_login_page";
import { ProfilePage } from "../../../page_objects/accounts/profilePage";

test.describe("Profile Smoke Tests", () => {
  let apiContext;
  let portalSetup;
  let portalLoginPage;
  let profilePage;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext();
    portalSetup = new PortalSetupApi(apiContext);
    await portalSetup.setupPortalUser();
  });

  test.beforeEach(async ({ page }) => {
    portalLoginPage = new PortalLoginPage(page);
    profilePage = new ProfilePage(page);
    await portalLoginPage.loginToPortal(portalSetup.portalDomain);
    await profilePage.navigateToProfile();
  });

  test.afterAll(async () => {
    await portalSetup.deletePortal(true, true);
    await apiContext.dispose();
  });

  test("edit name", async ({ page }) => {
    const firstName = "upd-admin-zero";
    const lastName = "upd-admin-zero";
    await profilePage.editName(firstName, lastName);
    const profileNameLocator = page.locator(
      `.profile-block-field >> text=${firstName} ${lastName}`,
    );
    await expect(profileNameLocator).toBeVisible();
  });

  test("change password", async ({ page }) => {
    await profilePage.changePassword();
    const changePasswordLocator = page.locator(
      "text=The password change instruction has been sent",
    );
    await expect(changePasswordLocator).toBeVisible();
  });

  test("check notifications tab", async ({ page }) => {
    await profilePage.selectNotificationsTabs();
    const notificationsTabLocator = page.locator(
      "div.notification-container >> text=Actions with files in Rooms",
    );
    await expect(notificationsTabLocator).toBeVisible();
  });

  test("check file management tab", async ({ page }) => {
    await profilePage.selectFileManagementTabs();
    const fileManagementTabLocator = page.locator(
      "div.tabs-body >> text=Don't ask file name again on creation",
    );
    await expect(fileManagementTabLocator).toBeVisible();
  });

  test("check interface theme tab", async ({ page }) => {
    await profilePage.selectInterfaceThemeTabs();
    const interfaceThemeTabLocator = page.locator(
      "div.card-header >> text=Dark theme",
    );
    await expect(interfaceThemeTabLocator).toBeVisible();
  });

  test("check authorized apps tab", async ({ page }) => {
    await profilePage.selectAuthorizedAppsTabs();
    const authorizedAppsTabLocator = page.locator(
      "[data-testid=text] >> text=No authorized apps",
    );
    await expect(authorizedAppsTabLocator).toBeVisible();
  });

  test("login tab", async ({ page }) => {
    const loginTabLocator = page.locator(
      "div.tabs-body >> text=Connect your social networks",
    );
    await expect(loginTabLocator).toBeVisible();
  });

  test("change language", async ({ page }) => {
    await profilePage.changeLanguage();
    const languageChangedLocator = page.locator(
      "data-testid=heading >> text=Mein Profil",
    );
    await expect(languageChangedLocator).toBeVisible();
  });
});
