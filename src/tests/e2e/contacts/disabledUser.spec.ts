import { test } from "@/src/fixtures";
import { expect, BrowserContext } from "@playwright/test";
import Contacts from "@/src/objects/contacts/Contacts";
import Login from "@/src/objects/common/Login";
import MyDocuments from "@/src/objects/files/MyDocuments";
import InfoPanel from "@/src/objects/common/InfoPanel";
import FileLinkSettings from "@/src/objects/files/FileLinkSettings";
import { waitForShareLinkResponse } from "@/src/objects/files/api";

test.describe("Contacts - Disabled user: login", () => {
  let contacts: Contacts;
  let userEmail: string;
  let userPassword: string;
  let userDisplayName: string;

  test.beforeEach(async ({ page, api, login, apiSdk }) => {
    contacts = new Contacts(page, api.portalDomain);

    const { userData } = await apiSdk.profiles.addMember("owner", "User");
    userEmail = userData.email;
    userPassword = userData.password;
    userDisplayName = `${userData.firstName} ${userData.lastName}`;

    await login.loginToPortal();

    await contacts.open();
    await contacts.table.selectRow(userDisplayName);
    await contacts.disableUser();
  });

  test("Disabled user cannot log in", async ({ page, api }) => {
    const loginPage = new Login(page, api.portalDomain);

    await test.step("Log out as owner", async () => {
      await loginPage.logout();
    });

    await test.step("Attempt to log in as disabled user", async () => {
      await loginPage.openLoginPage();
      await loginPage.emailInput.fill(userEmail);
      await loginPage.passwordInput.fill(userPassword);
      await loginPage.loginButton.click();
    });

    await test.step("Verify login fails and user stays on login page", async () => {
      await expect(loginPage.userDisabledError).toBeVisible();
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test("Re-enabled user can log in again", async ({ page, api }) => {
    const loginPage = new Login(page, api.portalDomain);

    await test.step("Re-enable the user in Contacts", async () => {
      await contacts.table.selectRow(userDisplayName);
      await contacts.enableUser();
    });

    await test.step("Log out as owner", async () => {
      await loginPage.logout();
    });

    await test.step("Log in as re-enabled user", async () => {
      await loginPage.loginWithCredentials(userEmail, userPassword);
    });

    await test.step("Verify user is on the portal", async () => {
      await expect(page).toHaveURL(/rooms\/shared\/filter/);
    });
  });
});

test.describe("Contacts - Disabled user: document link access", () => {
  let contacts: Contacts;
  let userEmail: string;
  let userPassword: string;
  let userDisplayName: string;
  let shareLink: string;

  test.beforeEach(async ({ page, api, login, apiSdk }) => {
    contacts = new Contacts(page, api.portalDomain);
    const myDocuments = new MyDocuments(page, api.portalDomain);
    const infoPanel = new InfoPanel(page);

    const { userData } = await apiSdk.profiles.addMember("owner", "User");
    userEmail = userData.email;
    userPassword = userData.password;
    userDisplayName = `${userData.firstName} ${userData.lastName}`;

    await login.loginToPortal();

    await myDocuments.open();
    await myDocuments.deleteAllDocs();
    await myDocuments.createDocumentFile("TestDocument");

    await myDocuments.filesTable.openContextMenuForItem("TestDocument");
    await myDocuments.filesTable.contextMenu.clickSubmenuOption(
      "Share",
      "Sharing settings",
    );
    await infoPanel.checkShareExist();
    await infoPanel.createFirstSharedLink();
    await myDocuments.dismissToastSafely("Link copied to clipboard");

    await infoPanel.openLinkSettings();
    const linkSettings = new FileLinkSettings(page);
    await linkSettings.selectLinkAccess("docspace");
    const linkPromise = waitForShareLinkResponse(page);
    await linkSettings.clickSaveButton();
    shareLink = await linkPromise;

    await contacts.open();
    await contacts.table.selectRow(userDisplayName);
    await contacts.disableUser();
  });

  test("Disabled user cannot open document link", async ({ page, api }) => {
    const loginPage = new Login(page, api.portalDomain);

    await test.step("Log out as owner", async () => {
      await loginPage.logout();
    });

    await test.step("Verify disabled user cannot log in", async () => {
      await loginPage.openLoginPage();
      await loginPage.emailInput.fill(userEmail);
      await loginPage.passwordInput.fill(userPassword);
      await loginPage.loginButton.click();
      await expect(loginPage.userDisabledError).toBeVisible();
    });

    await test.step("Navigate to document share link and verify access is denied", async () => {
      await page.goto(shareLink, { waitUntil: "domcontentloaded" });
      await expect(loginPage.loginButton).toBeVisible({ timeout: 15000 });
      await expect(page).toHaveURL(/\/login/);
    });
  });
});

test.describe("Contacts - Disabled user: active session redirect", () => {
  let userEmail: string;
  let userPassword: string;
  let userDisplayName: string;
  let portalDomain: string;

  test.beforeEach(async ({ api, apiSdk }) => {
    portalDomain = api.portalDomain;

    const { userData } = await apiSdk.profiles.addMember("owner", "User");
    userEmail = userData.email;
    userPassword = userData.password;
    userDisplayName = `${userData.firstName} ${userData.lastName}`;
  });

  test("Active session is terminated when user is disabled", async ({
    page,
    login,
    browser,
  }) => {
    let userContext: BrowserContext | null = null;

    try {
      await test.step("Log in user in a separate browser context", async () => {
        userContext = await browser.newContext();
        const userPage = await userContext.newPage();
        await userPage.bringToFront();
        const userLogin = new Login(userPage, portalDomain);
        await userLogin.loginWithCredentials(userEmail, userPassword);
      });

      const userPage = userContext!.pages()[0];

      await test.step("Log in as owner and disable the user", async () => {
        await page.bringToFront();
        await login.loginToPortal();
        const contacts = new Contacts(page, portalDomain);
        await contacts.open();
        await contacts.table.selectRow(userDisplayName);
        await contacts.disableUser();
      });

      await test.step("Reload user page to trigger session check", async () => {
        await userPage.bringToFront();
        await userPage.reload({ waitUntil: "load" });
      });

      await test.step("Verify user is redirected to login page", async () => {
        const userLogin = new Login(userPage, portalDomain);
        await expect(userLogin.loginButton).toBeVisible({ timeout: 15000 });
        await expect(userPage).toHaveURL(/\/login/);
      });
    } finally {
      if (userContext) {
        await (userContext as BrowserContext).close();
      }
    }
  });
});

test.describe("Contacts - Disabled user: file sharing selector", () => {
  let myDocuments: MyDocuments;
  let infoPanel: InfoPanel;
  let userEmail: string;
  let userDisplayName: string;

  test.beforeEach(async ({ page, api, login, apiSdk }) => {
    myDocuments = new MyDocuments(page, api.portalDomain);
    infoPanel = new InfoPanel(page);
    const contacts = new Contacts(page, api.portalDomain);

    const { userData } = await apiSdk.profiles.addMember("owner", "User");
    userEmail = userData.email;
    userDisplayName = `${userData.firstName} ${userData.lastName}`;

    await login.loginToPortal();

    await myDocuments.open();
    await myDocuments.deleteAllDocs();
    await myDocuments.createDocumentFile("TestDocument");

    await contacts.open();
    await contacts.table.selectRow(userDisplayName);
    await contacts.disableUser();

    await myDocuments.open();
    await myDocuments.filesTable.openContextMenuForItem("TestDocument");
    await myDocuments.filesTable.contextMenu.clickSubmenuOption(
      "Share",
      "Sharing settings",
    );
    await infoPanel.checkShareExist();
  });

  test("Disabled user is not shown in file sharing selector", async () => {
    await test.step("Open user selector and search for disabled user", async () => {
      await infoPanel.checkUserNotInShareSelector(userEmail);
    });
  });
});

test.describe("Contacts - Members tab: disable and enable user", () => {
  let contacts: Contacts;
  let userDisplayName: string;

  test.beforeEach(async ({ page, api, login, apiSdk }) => {
    contacts = new Contacts(page, api.portalDomain);

    const { userData } = await apiSdk.profiles.addMember("owner", "User");
    userDisplayName = `${userData.firstName} ${userData.lastName}`;

    await login.loginToPortal();
    await contacts.open();
  });

  test("Disable and enable user", async () => {
    await test.step("Select user and disable", async () => {
      await contacts.table.selectRow(userDisplayName);
      await contacts.disableUser();
    });

    await test.step("Verify disabled badge is shown", async () => {
      await contacts.table.checkDisabledUserExist(userDisplayName);
    });

    await test.step("Select user and enable", async () => {
      await contacts.table.selectRow(userDisplayName);
      await contacts.enableUser();
    });

    await test.step("Verify disabled badge is gone", async () => {
      await contacts.table.checkEnabledUserExist(userDisplayName);
    });
  });
});
