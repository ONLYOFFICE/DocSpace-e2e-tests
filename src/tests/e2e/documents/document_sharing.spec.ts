import MyDocuments from "@/src/objects/files/MyDocuments";
import InfoPanel from "@/src/objects/common/InfoPanel";
import FileLinkSettings from "@/src/objects/files/FileLinkSettings";
import BasePasswordRequire from "@/src/objects/common/BasePasswordRequire";
import FilesEditor from "@/src/objects/files/FilesEditor";
import FilesTable from "@/src/objects/files/FilesTable";
import SharedWithMe from "@/src/objects/files/SharedWithMe";
import Login from "@/src/objects/common/Login";
import { test } from "@/src/fixtures";
import { BrowserContext, expect, Page } from "@playwright/test";
import {
  setupIncognitoContext,
  cleanupIncognitoContext,
  verifyLoginPageInIncognito,
} from "@/src/utils/helpers/linkTest";
import {
  waitForShareLinkResponse,
  waitForFileRecentResponse,
} from "@/src/objects/files/api";

test.describe("Document sharing", () => {
  let myDocuments: MyDocuments;
  let infoPanel: InfoPanel;
  let incognitoContext: BrowserContext | null = null;
  let incognitoPage: Page | null = null;

  test.beforeEach(async ({ page, api, login }) => {
    myDocuments = new MyDocuments(page, api.portalDomain);
    infoPanel = new InfoPanel(page);

    await login.loginToPortal();
    await myDocuments.open();
    await myDocuments.deleteAllDocs();
    await myDocuments.createDocumentFile("TestDocument");
  });

  test.afterEach(async () => {
    await cleanupIncognitoContext(incognitoContext, incognitoPage);
  });

  test("Create shared link with 'Anyone with the link' access and open in editor", async ({
    page,
    browser,
  }) => {
    let shareLink: string;

    await test.step("Open sharing settings via context menu", async () => {
      await myDocuments.filesTable.openContextMenuForItem("TestDocument");
      await myDocuments.filesTable.contextMenu.clickSubmenuOption(
        "Share",
        "Sharing settings",
      );
    });

    await test.step("Create shared link", async () => {
      await infoPanel.checkShareExist();
      const linkPromise = waitForShareLinkResponse(page);
      await infoPanel.createFirstSharedLink();
      shareLink = await linkPromise;
      await myDocuments.dismissToastSafely("Link copied to clipboard");
    });

    await test.step("Open shared link in incognito and verify editor loads", async () => {
      const result = await setupIncognitoContext(browser);
      incognitoContext = result.context;
      incognitoPage = result.page;
      await incognitoPage.goto(shareLink, { waitUntil: "domcontentloaded" });
      const editor = new FilesEditor(incognitoPage);
      await editor.waitForLoad();
    });
  });

  test("Create shared link with 'DocSpace users only' access and verify login required", async ({
    page,
    browser,
  }) => {
    let shareLink: string;

    await test.step("Open sharing settings via context menu", async () => {
      await myDocuments.filesTable.openContextMenuForItem("TestDocument");
      await myDocuments.filesTable.contextMenu.clickSubmenuOption(
        "Share",
        "Sharing settings",
      );
    });

    await test.step("Create shared link", async () => {
      await infoPanel.checkShareExist();
      await infoPanel.createFirstSharedLink();
      await myDocuments.dismissToastSafely("Link copied to clipboard");
    });

    await test.step("Change link access to 'docspace users only' via link settings", async () => {
      await infoPanel.openLinkSettings();
      const editLink = new FileLinkSettings(page);
      await editLink.selectLinkAccess("docspace");
      const linkPromise = waitForShareLinkResponse(page);
      await editLink.clickSaveButton();
      shareLink = await linkPromise;
    });

    await test.step("Open shared link in incognito and verify login page shown", async () => {
      await verifyLoginPageInIncognito(browser, shareLink);
    });
  });

  test("Create shared link with password protection and verify password required", async ({
    page,
    browser,
  }) => {
    const linkPassword = "Test1234!";
    let shareLink: string;

    await test.step("Open sharing settings via context menu", async () => {
      await myDocuments.filesTable.openContextMenuForItem("TestDocument");
      await myDocuments.filesTable.contextMenu.clickSubmenuOption(
        "Share",
        "Sharing settings",
      );
    });

    await test.step("Create shared link", async () => {
      await infoPanel.checkShareExist();
      await infoPanel.createFirstSharedLink();
      await myDocuments.dismissToastSafely("Link copied to clipboard");
    });

    await test.step("Open link settings and set password", async () => {
      await infoPanel.openLinkSettings();
      const editLink = new FileLinkSettings(page);
      await editLink.clickTogglePassword();
      await editLink.fillPassword(linkPassword);
      const linkPromise = waitForShareLinkResponse(page);
      await editLink.clickSaveButton();
      shareLink = await linkPromise;
    });

    await test.step("Open shared link in incognito and verify password required", async () => {
      const result = await setupIncognitoContext(browser);
      incognitoContext = result.context;
      incognitoPage = result.page;
      await incognitoPage.goto(shareLink, { waitUntil: "domcontentloaded" });
      const passwordPage = new BasePasswordRequire(incognitoPage);
      await expect(incognitoPage.getByText("Password required")).toBeVisible({
        timeout: 30000,
      });
      await passwordPage.enterPasswordAndContinue(linkPassword);
      const editor = new FilesEditor(incognitoPage);
      await editor.waitForLoad();
    });
  });

  test("Share document with user", async ({ apiSdk }) => {
    let userName: string;

    await test.step("Create user via API", async () => {
      const { userData } = await apiSdk.profiles.addMember("owner", "User");
      userName = `${userData.firstName} ${userData.lastName}`;
    });

    await test.step("Open sharing settings for document", async () => {
      await myDocuments.filesTable.openContextMenuForItem("TestDocument");
      await myDocuments.filesTable.contextMenu.clickSubmenuOption(
        "Share",
        "Sharing settings",
      );
      await infoPanel.checkShareExist();
    });

    await test.step("Add user via share panel", async () => {
      await infoPanel.addUserToShare(userName);
    });

    await test.step("Verify user appears in Who has access", async () => {
      await infoPanel.checkUserHasAccess(userName);
    });
  });

  test("Share file with user and set Editing access", async ({ apiSdk }) => {
    let userName: string;

    await test.step("Create user via API", async () => {
      const { userData } = await apiSdk.profiles.addMember("owner", "User");
      userName = `${userData.firstName} ${userData.lastName}`;
    });

    await test.step("Open sharing settings for document", async () => {
      await myDocuments.filesTable.openContextMenuForItem("TestDocument");
      await myDocuments.filesTable.contextMenu.clickSubmenuOption(
        "Share",
        "Sharing settings",
      );
      await infoPanel.checkShareExist();
    });

    await test.step("Add user and set Editing access", async () => {
      await infoPanel.addUserToShare(userName);
      await infoPanel.checkMemberInList(userName);
      await infoPanel.changeUserShareRole(userName, "editing");
    });

    await test.step("Verify user has Editing role", async () => {
      await infoPanel.checkMemberHasRole(userName, "Editing");
    });
  });

  test("Share file with user and set Review access", async ({ apiSdk }) => {
    let userName: string;

    await test.step("Create user via API", async () => {
      const { userData } = await apiSdk.profiles.addMember("owner", "User");
      userName = `${userData.firstName} ${userData.lastName}`;
    });

    await test.step("Open sharing settings for document", async () => {
      await myDocuments.filesTable.openContextMenuForItem("TestDocument");
      await myDocuments.filesTable.contextMenu.clickSubmenuOption(
        "Share",
        "Sharing settings",
      );
      await infoPanel.checkShareExist();
    });

    await test.step("Add user and set Review access", async () => {
      await infoPanel.addUserToShare(userName);
      await infoPanel.checkMemberInList(userName);
      await infoPanel.changeUserShareRole(userName, "review");
    });

    await test.step("Verify user has Review role", async () => {
      await infoPanel.checkMemberHasRole(userName, "Review");
    });
  });

  test("Share file with user and set Read only access", async ({ apiSdk }) => {
    let userName: string;

    await test.step("Create user via API", async () => {
      const { userData } = await apiSdk.profiles.addMember("owner", "User");
      userName = `${userData.firstName} ${userData.lastName}`;
    });

    await test.step("Open sharing settings for document", async () => {
      await myDocuments.filesTable.openContextMenuForItem("TestDocument");
      await myDocuments.filesTable.contextMenu.clickSubmenuOption(
        "Share",
        "Sharing settings",
      );
      await infoPanel.checkShareExist();
    });

    await test.step("Add user and set Read only access", async () => {
      await infoPanel.addUserToShare(userName);
      await infoPanel.checkMemberInList(userName);
      await infoPanel.changeUserShareRole(userName, "viewing");
    });

    await test.step("Verify user has Read only role", async () => {
      await infoPanel.checkMemberHasRole(userName, "Read only");
    });
  });

  test("Share file with user and set Full access", async ({ apiSdk }) => {
    let userName: string;

    await test.step("Create user via API", async () => {
      const { userData } = await apiSdk.profiles.addMember("owner", "User");
      userName = `${userData.firstName} ${userData.lastName}`;
    });

    await test.step("Open sharing settings for document", async () => {
      await myDocuments.filesTable.openContextMenuForItem("TestDocument");
      await myDocuments.filesTable.contextMenu.clickSubmenuOption(
        "Share",
        "Sharing settings",
      );
      await infoPanel.checkShareExist();
    });

    await test.step("Add user and set Full access", async () => {
      await infoPanel.addUserToShare(userName);
      await infoPanel.checkMemberInList(userName);
      await infoPanel.changeUserShareRole(userName, "full-access");
    });

    await test.step("Verify user has Full access role", async () => {
      await infoPanel.checkMemberHasRole(userName, "Full access");
    });
  });

  test("Share file with user and set Comment access", async ({ apiSdk }) => {
    let userName: string;

    await test.step("Create user via API", async () => {
      const { userData } = await apiSdk.profiles.addMember("owner", "User");
      userName = `${userData.firstName} ${userData.lastName}`;
    });

    await test.step("Open sharing settings for document", async () => {
      await myDocuments.filesTable.openContextMenuForItem("TestDocument");
      await myDocuments.filesTable.contextMenu.clickSubmenuOption(
        "Share",
        "Sharing settings",
      );
      await infoPanel.checkShareExist();
    });

    await test.step("Add user and set Comment access", async () => {
      await infoPanel.addUserToShare(userName);
      await infoPanel.checkMemberInList(userName);
      await infoPanel.changeUserShareRole(userName, "commenting");
    });

    await test.step("Verify user has Comment role", async () => {
      await infoPanel.checkMemberHasRole(userName, "Comment");
    });
  });

  test("Deny user access to shared file", async ({ apiSdk }) => {
    let userName: string;

    await test.step("Create user via API", async () => {
      const { userData } = await apiSdk.profiles.addMember("owner", "User");
      userName = `${userData.firstName} ${userData.lastName}`;
    });

    await test.step("Open sharing settings and add user", async () => {
      await myDocuments.filesTable.openContextMenuForItem("TestDocument");
      await myDocuments.filesTable.contextMenu.clickSubmenuOption(
        "Share",
        "Sharing settings",
      );
      await infoPanel.checkShareExist();
      await infoPanel.addUserToShare(userName);
      await infoPanel.checkMemberInList(userName);
    });

    await test.step("Deny user access", async () => {
      await infoPanel.changeUserShareRole(userName, "deny-access");
    });

    await test.step("Verify user access is denied", async () => {
      await infoPanel.checkMemberHasRole(userName, "Deny access");
    });
  });

  test("Remove user from file sharing", async ({ apiSdk }) => {
    let userName: string;

    await test.step("Create user via API", async () => {
      const { userData } = await apiSdk.profiles.addMember("owner", "User");
      userName = `${userData.firstName} ${userData.lastName}`;
    });

    await test.step("Open sharing settings and add user", async () => {
      await myDocuments.filesTable.openContextMenuForItem("TestDocument");
      await myDocuments.filesTable.contextMenu.clickSubmenuOption(
        "Share",
        "Sharing settings",
      );
      await infoPanel.checkShareExist();
      await infoPanel.addUserToShare(userName);
      await infoPanel.checkMemberInList(userName);
    });

    await test.step("Remove user from sharing", async () => {
      await infoPanel.removeUserFromSharing(userName);
    });

    await test.step("Verify user is no longer in sharing list", async () => {
      await infoPanel.checkMemberNotInList(userName);
    });
  });

  test("Delete file shared link", async ({ page }) => {
    await test.step("Open sharing settings and create external link", async () => {
      await myDocuments.filesTable.openContextMenuForItem("TestDocument");
      await myDocuments.filesTable.contextMenu.clickSubmenuOption(
        "Share",
        "Sharing settings",
      );
      await infoPanel.checkShareExist();
      const linkPromise = waitForShareLinkResponse(page);
      await infoPanel.createFirstSharedLink();
      await linkPromise;
      await myDocuments.dismissToastSafely("Link copied to clipboard");
      await infoPanel.checkSharedLinkCreated();
    });

    await test.step("Delete shared link via context menu", async () => {
      await infoPanel.openLinkContextMenu();
      await infoPanel.clickDeleteLink();
    });

    await test.step("Verify link is deleted", async () => {
      await infoPanel.checkNoSharedLinks();
    });
  });
});

test.describe("Document sharing: access verification", () => {
  test("User with Editing access opens document in edit mode", async ({
    page,
    api,
    apiSdk,
  }) => {
    const fileName = "EditableDocument";
    let fileId: number;
    let userEmail: string;
    let userPassword: string;

    await test.step("Create file via API", async () => {
      const fileResponse = await apiSdk.files.createFileInMyDocuments("owner", {
        title: fileName,
      });
      const fileBody = await fileResponse.json();
      fileId = fileBody.response.id;
    });

    await test.step("Create user and share file with Editing access", async () => {
      const { userData, response } = await apiSdk.profiles.addMember(
        "owner",
        "User",
      );
      userEmail = userData.email;
      userPassword = userData.password;
      const userBody = await response.json();
      const userId = userBody.response.id;

      await apiSdk.files.shareFile("owner", fileId, {
        share: [{ shareTo: userId, access: 10 }],
        notify: false,
      });
    });

    await test.step("Login as user", async () => {
      const userLogin = new Login(page, api.portalDomain);
      await userLogin.loginWithCredentials(userEmail, userPassword);
    });

    await test.step("Open Shared with me", async () => {
      const sharedWithMe = new SharedWithMe(page, api.portalDomain);
      await sharedWithMe.open();
    });

    const recentResponsePromise = waitForFileRecentResponse(page.context());

    await test.step("Open file", async () => {
      const editorPagePromise = page.context().waitForEvent("page");
      const filesTable = new FilesTable(page);
      await filesTable.openItem(fileName);
      await editorPagePromise;
    });

    await test.step("Verify Edit access is enabled in file security", async () => {
      const recentData = await recentResponsePromise;
      expect(recentData.security.Edit).toBe(true);
    });
  });

  test("User with Read only access opens document in view mode", async ({
    page,
    api,
    apiSdk,
  }) => {
    const fileName = "ReadOnlyDocument";
    let fileId: number;
    let userEmail: string;
    let userPassword: string;

    await test.step("Create file via API", async () => {
      const fileResponse = await apiSdk.files.createFileInMyDocuments("owner", {
        title: fileName,
      });
      const fileBody = await fileResponse.json();
      fileId = fileBody.response.id;
    });

    await test.step("Create user and share file with Read only access", async () => {
      const { userData, response } = await apiSdk.profiles.addMember(
        "owner",
        "User",
      );
      userEmail = userData.email;
      userPassword = userData.password;
      const userBody = await response.json();
      const userId = userBody.response.id;

      await apiSdk.files.shareFile("owner", fileId, {
        share: [{ shareTo: userId, access: 2 }],
        notify: false,
      });
    });

    await test.step("Login as user", async () => {
      const userLogin = new Login(page, api.portalDomain);
      await userLogin.loginWithCredentials(userEmail, userPassword);
    });

    await test.step("Open Shared with me", async () => {
      const sharedWithMe = new SharedWithMe(page, api.portalDomain);
      await sharedWithMe.open();
    });

    const recentResponsePromise = waitForFileRecentResponse(page.context());

    await test.step("Open file", async () => {
      const editorPagePromise = page.context().waitForEvent("page");
      const filesTable = new FilesTable(page);
      await filesTable.openItem(fileName);
      await editorPagePromise;
    });

    await test.step("Verify commenting is disabled in file security", async () => {
      const recentData = await recentResponsePromise;
      expect(recentData.security.Comment).toBe(false);
    });
  });

  test("User with Comment access opens document with commenting enabled", async ({
    page,
    api,
    apiSdk,
  }) => {
    const fileName = "CommentDocument";
    let fileId: number;
    let userEmail: string;
    let userPassword: string;

    await test.step("Create file via API", async () => {
      const fileResponse = await apiSdk.files.createFileInMyDocuments("owner", {
        title: fileName,
      });
      const fileBody = await fileResponse.json();
      fileId = fileBody.response.id;
    });

    await test.step("Create user and share file with Comment access", async () => {
      const { userData, response } = await apiSdk.profiles.addMember(
        "owner",
        "User",
      );
      userEmail = userData.email;
      userPassword = userData.password;
      const userBody = await response.json();
      const userId = userBody.response.id;

      await apiSdk.files.shareFile("owner", fileId, {
        share: [{ shareTo: userId, access: 6 }],
        notify: false,
      });
    });

    await test.step("Login as user", async () => {
      const userLogin = new Login(page, api.portalDomain);
      await userLogin.loginWithCredentials(userEmail, userPassword);
    });

    await test.step("Open Shared with me", async () => {
      const sharedWithMe = new SharedWithMe(page, api.portalDomain);
      await sharedWithMe.open();
    });

    const recentResponsePromise = waitForFileRecentResponse(page.context());

    await test.step("Open file", async () => {
      const editorPagePromise = page.context().waitForEvent("page");
      const filesTable = new FilesTable(page);
      await filesTable.openItem(fileName);
      await editorPagePromise;
    });

    await test.step("Verify Comment access is enabled in file security", async () => {
      const recentData = await recentResponsePromise;
      expect(recentData.security.Comment).toBe(true);
    });
  });

  test("User with Review access opens document with review enabled", async ({
    page,
    api,
    apiSdk,
  }) => {
    const fileName = "ReviewDocument";
    let fileId: number;
    let userEmail: string;
    let userPassword: string;

    await test.step("Create file via API", async () => {
      const fileResponse = await apiSdk.files.createFileInMyDocuments("owner", {
        title: fileName,
      });
      const fileBody = await fileResponse.json();
      fileId = fileBody.response.id;
    });

    await test.step("Create user and share file with Review access", async () => {
      const { userData, response } = await apiSdk.profiles.addMember(
        "owner",
        "User",
      );
      userEmail = userData.email;
      userPassword = userData.password;
      const userBody = await response.json();
      const userId = userBody.response.id;

      await apiSdk.files.shareFile("owner", fileId, {
        share: [{ shareTo: userId, access: 5 }],
        notify: false,
      });
    });

    await test.step("Login as user", async () => {
      const userLogin = new Login(page, api.portalDomain);
      await userLogin.loginWithCredentials(userEmail, userPassword);
    });

    await test.step("Open Shared with me", async () => {
      const sharedWithMe = new SharedWithMe(page, api.portalDomain);
      await sharedWithMe.open();
    });

    const recentResponsePromise = waitForFileRecentResponse(page.context());

    await test.step("Open file", async () => {
      const editorPagePromise = page.context().waitForEvent("page");
      const filesTable = new FilesTable(page);
      await filesTable.openItem(fileName);
      await editorPagePromise;
    });

    await test.step("Verify Review access is enabled in file security", async () => {
      const recentData = await recentResponsePromise;
      expect(recentData.security.Review).toBe(true);
      expect(recentData.security.Edit).toBe(false);
    });
  });

  test("User with Full access opens document with full permissions", async ({
    page,
    api,
    apiSdk,
  }) => {
    const fileName = "FullAccessDocument";
    let fileId: number;
    let userEmail: string;
    let userPassword: string;

    await test.step("Create file via API", async () => {
      const fileResponse = await apiSdk.files.createFileInMyDocuments("owner", {
        title: fileName,
      });
      const fileBody = await fileResponse.json();
      fileId = fileBody.response.id;
    });

    await test.step("Create user and share file with Full access", async () => {
      const { userData, response } = await apiSdk.profiles.addMember(
        "owner",
        "User",
      );
      userEmail = userData.email;
      userPassword = userData.password;
      const userBody = await response.json();
      const userId = userBody.response.id;

      await apiSdk.files.shareFile("owner", fileId, {
        share: [{ shareTo: userId, access: 1 }],
        notify: false,
      });
    });

    await test.step("Login as user", async () => {
      const userLogin = new Login(page, api.portalDomain);
      await userLogin.loginWithCredentials(userEmail, userPassword);
    });

    await test.step("Open Shared with me", async () => {
      const sharedWithMe = new SharedWithMe(page, api.portalDomain);
      await sharedWithMe.open();
    });

    const recentResponsePromise = waitForFileRecentResponse(page.context());

    await test.step("Open file", async () => {
      const editorPagePromise = page.context().waitForEvent("page");
      const filesTable = new FilesTable(page);
      await filesTable.openItem(fileName);
      await editorPagePromise;
    });

    await test.step("Verify Full access permissions in file security", async () => {
      const recentData = await recentResponsePromise;
      expect(recentData.security.Rename).toBe(true);
      expect(recentData.canShare).toBe(true);
    });
  });

  test("File disappears from Shared with me after access is denied", async ({
    page,
    api,
    apiSdk,
  }) => {
    const fileName = "DeniedFile";
    let fileId: number;
    let userId: string;
    let userEmail: string;
    let userPassword: string;

    await test.step("Create file and share with user via API", async () => {
      const fileResponse = await apiSdk.files.createFileInMyDocuments("owner", {
        title: fileName,
      });
      const fileBody = await fileResponse.json();
      fileId = fileBody.response.id;

      const { userData, response } = await apiSdk.profiles.addMember(
        "owner",
        "User",
      );
      userEmail = userData.email;
      userPassword = userData.password;
      const userBody = await response.json();
      userId = userBody.response.id;

      await apiSdk.files.shareFile("owner", fileId, {
        share: [{ shareTo: userId, access: 10 }],
        notify: false,
      });
    });

    await test.step("Login as user and verify file appears in Shared with me", async () => {
      const userLogin = new Login(page, api.portalDomain);
      await userLogin.loginWithCredentials(userEmail, userPassword);
      const sharedWithMe = new SharedWithMe(page, api.portalDomain);
      await sharedWithMe.open();
      const filesTable = new FilesTable(page);
      await filesTable.checkRowExist(fileName);
    });

    await test.step("Deny access via API", async () => {
      await apiSdk.files.shareFile("owner", fileId, {
        share: [{ shareTo: userId, access: 3 }],
        notify: false,
      });
    });

    await test.step("Verify file is no longer visible in Shared with me", async () => {
      const sharedWithMe = new SharedWithMe(page, api.portalDomain);
      await sharedWithMe.open();
      const filesTable = new FilesTable(page);
      await filesTable.checkRowNotExist(fileName);
    });
  });
});
