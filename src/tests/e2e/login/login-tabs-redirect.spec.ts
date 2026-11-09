import { expect, Page } from "@playwright/test";
import { test } from "@/src/fixtures";
import Login from "@/src/objects/common/Login";
import Files from "@/src/objects/files/Files";
import MyRooms from "@/src/objects/rooms/Rooms";
import Security from "@/src/objects/settings/security/Security";
import { getPortalUrl } from "@/config";

const FOREIGN_URL = "https://example.com/";
const SECURITY_SETTINGS_URL = /portal-settings\/security/;
const ROOMS_PATH = "/rooms/shared";

test.describe("Login: tabs return to portal after re-login", () => {
  let files: Files;

  test.beforeEach(async ({ page, api, login }) => {
    files = new Files(page, api.portalDomain);
    await login.loginToPortal();
    await files.open();
  });

  test("Other tabs go to login on logout and return to portal on focus after re-login", async ({
    page,
    api,
    login,
  }) => {
    let secondPage: Page;
    let secondLogin: Login;

    await test.step("Open Rooms in a second tab", async () => {
      secondPage = await login.openPortalInNewTab(ROOMS_PATH);
      secondLogin = new Login(secondPage, api.portalDomain);
    });

    await test.step("Log out in the first tab", async () => {
      await login.focusTab();
      await login.logout();
      await login.expectLoginPageShown();
    });

    await test.step("Second tab shows login page on focus", async () => {
      await secondLogin.focusTab();
      await secondLogin.expectLoginPageShown();
    });

    await test.step("Log in again in the second tab", async () => {
      await secondLogin.submitCredentials();
      await secondLogin.expectPortalOpened();
    });

    await test.step("First tab returns to Files on focus", async () => {
      await login.focusTab();
      await expect(page).toHaveURL(/.*rooms\/personal.*/, { timeout: 15000 });
      await files.filesNavigation.checkAddButtonVisible();
    });
  });

  test("Expired session returns user to the page they were on after login", async ({
    page,
    api,
    login,
  }) => {
    const rooms = new MyRooms(page, api.portalDomain);

    await test.step("Open Rooms", async () => {
      await rooms.open();
    });

    await test.step("Session expires and user is sent to login", async () => {
      await login.expireSession();
      await page.reload({ waitUntil: "load" });
      await login.expectLoginPageShown();
    });

    await test.step("Log in and return to Rooms", async () => {
      await login.submitCredentials();
      await expect(page).toHaveURL(/.*rooms\/shared.*/, { timeout: 15000 });
      await rooms.roomsEmptyView.checkNoRoomsExist();
    });
  });

  // After an expired session another user logs in and is sent to the previous
  // user's page (Settings), getting "Sorry, the resource is not currently accessible"
  test("Another user logging in after expired session does not get previous user's page", async ({
    page,
    apiSdk,
    login,
  }) => {
    const security = new Security(page);
    let userEmail: string;
    let userPassword: string;

    await test.step("Create a regular user via API", async () => {
      const { userData } = await apiSdk.profiles.addMember("owner", "User");
      userEmail = userData.email;
      userPassword = userData.password;
    });

    await test.step("Owner opens Settings > Security", async () => {
      await security.open();
      await expect(page).toHaveURL(SECURITY_SETTINGS_URL);
    });

    await test.step("Session expires and user is sent to login", async () => {
      await login.expireSession();
      await page.reload({ waitUntil: "load" });
      await login.expectLoginPageShown();
    });

    await test.step("Another user logs in - owner's Settings page is not opened", async () => {
      await login.submitCredentials(userEmail, userPassword);
      await login.expectPortalOpened();
      await expect(page).not.toHaveURL(/portal-settings/);
    });
  });

  // After login the portal follows a foreign referenceUrl
  // (https://example.com/, //example.com) - open redirect
  test("Foreign referenceUrl is ignored after login", async ({
    page,
    api,
    login,
  }) => {
    await test.step("Log out", async () => {
      await login.logout();
    });

    await test.step("Open login page with a foreign referenceUrl", async () => {
      await login.openLoginPageWithReferenceUrl(FOREIGN_URL);
    });

    await test.step("Log in - portal opens, foreign page does not", async () => {
      await login.submitCredentials();
      await expect(page).toHaveURL(
        new RegExp(`^${getPortalUrl(api.portalDomain)}`),
        { timeout: 15000 },
      );
      await login.expectPortalOpened();
    });
  });
});
