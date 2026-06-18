import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import Contacts from "@/src/objects/contacts/Contacts";
import InfoPanel from "@/src/objects/common/InfoPanel";
import Login from "@/src/objects/common/Login";
import FilesTable from "@/src/objects/files/FilesTable";
import SharedWithMe from "@/src/objects/files/SharedWithMe";
import MyDocuments from "@/src/objects/files/MyDocuments";
import {
  waitForFileRecentResponse,
  waitForShareLinkResponse,
} from "@/src/objects/files/api";

// Access codes: Full=1, Read only=2, Deny=3, Review=5, Comment=6, Editing=10

test.describe("Document sharing: access priority (Personal > Group > Link)", () => {
  const GROUP_NAME = "Access Priority Group";
  const FILE_NAME = "PriorityTestDoc";

  test("Personal Read only overrides group Editing access", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    let userEmail: string;
    let userPassword: string;
    let userId: string;
    let fileId: number;

    await test.step("Create file and user via API", async () => {
      const fileResponse = await apiSdk.files.createFileInMyDocuments("owner", {
        title: FILE_NAME,
      });
      const fileBody = await fileResponse.json();
      fileId = fileBody.response.id;

      const { userData, response: userResponse } =
        await apiSdk.profiles.addMember("owner", "User");
      userEmail = userData.email;
      userPassword = userData.password;
      const userBody = await userResponse.json();
      userId = userBody.response.id;
    });

    await test.step("Create group with user", async () => {
      await login.loginToPortal();
      const contacts = new Contacts(page, api.portalDomain);
      await contacts.open();
      await contacts.createGroupWithMembers(GROUP_NAME, [userEmail]);
    });

    await test.step("Share file with group (Editing access)", async () => {
      const myDocuments = new MyDocuments(page, api.portalDomain);
      const infoPanel = new InfoPanel(page);
      await myDocuments.open();
      await myDocuments.filesTable.openContextMenuForItem(FILE_NAME);
      await myDocuments.filesTable.contextMenu.clickSubmenuOption(
        "Share",
        "Sharing settings",
      );
      await infoPanel.checkShareExist();
      await infoPanel.addGroupToShare(GROUP_NAME);
      await infoPanel.checkMemberInList(GROUP_NAME);
      await infoPanel.changeUserShareRole(GROUP_NAME, "editing");
    });

    await test.step("Set personal Read only access via API", async () => {
      await apiSdk.files.shareFile("owner", fileId, {
        share: [{ shareTo: userId, access: 2 }],
        notify: false,
      });
    });

    const recentResponsePromise = waitForFileRecentResponse(page.context());

    await test.step("Login as user and open file from Shared with Me", async () => {
      const userLogin = new Login(page, api.portalDomain);
      await userLogin.logout();
      await userLogin.loginWithCredentials(userEmail, userPassword);
      const sharedWithMe = new SharedWithMe(page, api.portalDomain);
      await sharedWithMe.open();
      const editorPagePromise = page.context().waitForEvent("page");
      const filesTable = new FilesTable(page);
      await filesTable.openItem(FILE_NAME);
      await editorPagePromise;
    });

    await test.step("Verify Read only is effective (Edit disabled)", async () => {
      const recentData = await recentResponsePromise;
      expect(recentData.security.Edit).toBe(false);
    });
  });

  test("Personal Editing access overrides group Read only access", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    let userEmail: string;
    let userPassword: string;
    let userId: string;
    let fileId: number;

    await test.step("Create file and user via API", async () => {
      const fileResponse = await apiSdk.files.createFileInMyDocuments("owner", {
        title: FILE_NAME,
      });
      const fileBody = await fileResponse.json();
      fileId = fileBody.response.id;

      const { userData, response: userResponse } =
        await apiSdk.profiles.addMember("owner", "User");
      userEmail = userData.email;
      userPassword = userData.password;
      const userBody = await userResponse.json();
      userId = userBody.response.id;
    });

    await test.step("Create group with user", async () => {
      await login.loginToPortal();
      const contacts = new Contacts(page, api.portalDomain);
      await contacts.open();
      await contacts.createGroupWithMembers(GROUP_NAME, [userEmail]);
    });

    await test.step("Share file with group (Read only access)", async () => {
      const myDocuments = new MyDocuments(page, api.portalDomain);
      const infoPanel = new InfoPanel(page);
      await myDocuments.open();
      await myDocuments.filesTable.openContextMenuForItem(FILE_NAME);
      await myDocuments.filesTable.contextMenu.clickSubmenuOption(
        "Share",
        "Sharing settings",
      );
      await infoPanel.checkShareExist();
      await infoPanel.addGroupToShare(GROUP_NAME);
      await infoPanel.checkMemberInList(GROUP_NAME);
    });

    await test.step("Set personal Editing access via API", async () => {
      await apiSdk.files.shareFile("owner", fileId, {
        share: [{ shareTo: userId, access: 10 }],
        notify: false,
      });
    });

    const recentResponsePromise = waitForFileRecentResponse(page.context());

    await test.step("Login as user and open file from Shared with Me", async () => {
      const userLogin = new Login(page, api.portalDomain);
      await userLogin.logout();
      await userLogin.loginWithCredentials(userEmail, userPassword);
      const sharedWithMe = new SharedWithMe(page, api.portalDomain);
      await sharedWithMe.open();
      const editorPagePromise = page.context().waitForEvent("page");
      const filesTable = new FilesTable(page);
      await filesTable.openItem(FILE_NAME);
      await editorPagePromise;
    });

    await test.step("Verify Editing access is effective (personal wins over group)", async () => {
      const recentData = await recentResponsePromise;
      expect(recentData.security.Edit).toBe(true);
    });
  });

  test("Personal Deny access overrides group Editing access", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    let userEmail: string;
    let userPassword: string;
    let userId: string;
    let fileId: number;

    await test.step("Create file and user via API", async () => {
      const fileResponse = await apiSdk.files.createFileInMyDocuments("owner", {
        title: FILE_NAME,
      });
      const fileBody = await fileResponse.json();
      fileId = fileBody.response.id;

      const { userData, response: userResponse } =
        await apiSdk.profiles.addMember("owner", "User");
      userEmail = userData.email;
      userPassword = userData.password;
      const userBody = await userResponse.json();
      userId = userBody.response.id;
    });

    await test.step("Create group with user", async () => {
      await login.loginToPortal();
      const contacts = new Contacts(page, api.portalDomain);
      await contacts.open();
      await contacts.createGroupWithMembers(GROUP_NAME, [userEmail]);
    });

    await test.step("Share file with group (Editing access)", async () => {
      const myDocuments = new MyDocuments(page, api.portalDomain);
      const infoPanel = new InfoPanel(page);
      await myDocuments.open();
      await myDocuments.filesTable.openContextMenuForItem(FILE_NAME);
      await myDocuments.filesTable.contextMenu.clickSubmenuOption(
        "Share",
        "Sharing settings",
      );
      await infoPanel.checkShareExist();
      await infoPanel.addGroupToShare(GROUP_NAME);
      await infoPanel.checkMemberInList(GROUP_NAME);
      await infoPanel.changeUserShareRole(GROUP_NAME, "editing");
    });

    await test.step("Login as user and verify file visible in Shared with Me", async () => {
      const userLogin = new Login(page, api.portalDomain);
      await userLogin.logout();
      await userLogin.loginWithCredentials(userEmail, userPassword);
      const sharedWithMe = new SharedWithMe(page, api.portalDomain);
      await sharedWithMe.open();
      await sharedWithMe.filesTable.checkRowExist(FILE_NAME);
    });

    await test.step("Set personal Deny access via API", async () => {
      await apiSdk.files.shareFile("owner", fileId, {
        share: [{ shareTo: userId, access: 3 }],
        notify: false,
      });
    });

    await test.step("Verify file no longer visible in Shared with Me", async () => {
      const sharedWithMe = new SharedWithMe(page, api.portalDomain);
      await sharedWithMe.open();
      await sharedWithMe.filesTable.checkRowNotExist(FILE_NAME);
    });
  });

  test("Group Editing access takes priority over link Read only", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    let userEmail: string;
    let userPassword: string;

    await test.step("Create file and user via API", async () => {
      await apiSdk.files.createFileInMyDocuments("owner", { title: FILE_NAME });

      const { userData } = await apiSdk.profiles.addMember("owner", "User");
      userEmail = userData.email;
      userPassword = userData.password;
    });

    await test.step("Create group with user", async () => {
      await login.loginToPortal();
      const contacts = new Contacts(page, api.portalDomain);
      await contacts.open();
      await contacts.createGroupWithMembers(GROUP_NAME, [userEmail]);
    });

    await test.step("Share file with group (Editing access) and create external link", async () => {
      const myDocuments = new MyDocuments(page, api.portalDomain);
      const infoPanel = new InfoPanel(page);
      await myDocuments.open();
      await myDocuments.filesTable.openContextMenuForItem(FILE_NAME);
      await myDocuments.filesTable.contextMenu.clickSubmenuOption(
        "Share",
        "Sharing settings",
      );
      await infoPanel.checkShareExist();
      await infoPanel.addGroupToShare(GROUP_NAME);
      await infoPanel.checkMemberInList(GROUP_NAME);
      await infoPanel.changeUserShareRole(GROUP_NAME, "editing");
      const linkPromise = waitForShareLinkResponse(page);
      await infoPanel.createFirstSharedLink(); // Read only by default
      await linkPromise;
      await myDocuments.dismissToastSafely("Link copied to clipboard");
    });

    const recentResponsePromise = waitForFileRecentResponse(page.context());

    await test.step("Login as user and open file from Shared with Me", async () => {
      const userLogin = new Login(page, api.portalDomain);
      await userLogin.logout();
      await userLogin.loginWithCredentials(userEmail, userPassword);
      const sharedWithMe = new SharedWithMe(page, api.portalDomain);
      await sharedWithMe.open();
      const editorPagePromise = page.context().waitForEvent("page");
      const filesTable = new FilesTable(page);
      await filesTable.openItem(FILE_NAME);
      await editorPagePromise;
    });

    await test.step("Verify Editing access is preserved (group wins over link)", async () => {
      const recentData = await recentResponsePromise;
      expect(recentData.security.Edit).toBe(true);
    });
  });

  test("Personal Full access overrides group Read only and link when all three sources present", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    let userEmail: string;
    let userPassword: string;
    let userId: string;
    let fileId: number;

    await test.step("Create file and user via API", async () => {
      const fileResponse = await apiSdk.files.createFileInMyDocuments("owner", {
        title: FILE_NAME,
      });
      const fileBody = await fileResponse.json();
      fileId = fileBody.response.id;

      const { userData, response: userResponse } =
        await apiSdk.profiles.addMember("owner", "User");
      userEmail = userData.email;
      userPassword = userData.password;
      const userBody = await userResponse.json();
      userId = userBody.response.id;
    });

    await test.step("Create group with user", async () => {
      await login.loginToPortal();
      const contacts = new Contacts(page, api.portalDomain);
      await contacts.open();
      await contacts.createGroupWithMembers(GROUP_NAME, [userEmail]);
    });

    await test.step("Share file with group (Read only), create Anyone-with-link external link", async () => {
      const myDocuments = new MyDocuments(page, api.portalDomain);
      const infoPanel = new InfoPanel(page);
      await myDocuments.open();
      await myDocuments.filesTable.openContextMenuForItem(FILE_NAME);
      await myDocuments.filesTable.contextMenu.clickSubmenuOption(
        "Share",
        "Sharing settings",
      );
      await infoPanel.checkShareExist();
      await infoPanel.addGroupToShare(GROUP_NAME);
      await infoPanel.checkMemberInList(GROUP_NAME);
      // group stays at default Read only — no role change needed
      const linkPromise = waitForShareLinkResponse(page);
      await infoPanel.createFirstSharedLink(); // Anyone with the link, Read only
      await linkPromise;
      await myDocuments.dismissToastSafely("Link copied to clipboard");
    });

    await test.step("Set personal Full access via API", async () => {
      await apiSdk.files.shareFile("owner", fileId, {
        share: [{ shareTo: userId, access: 1 }],
        notify: false,
      });
    });

    const recentResponsePromise = waitForFileRecentResponse(page.context());

    await test.step("Login as user and open file from Shared with Me", async () => {
      const userLogin = new Login(page, api.portalDomain);
      await userLogin.logout();
      await userLogin.loginWithCredentials(userEmail, userPassword);
      const sharedWithMe = new SharedWithMe(page, api.portalDomain);
      await sharedWithMe.open();
      const editorPagePromise = page.context().waitForEvent("page");
      const filesTable = new FilesTable(page);
      await filesTable.openItem(FILE_NAME);
      await editorPagePromise;
    });

    await test.step("Verify Full access (personal wins over group Read only and link)", async () => {
      const recentData = await recentResponsePromise;
      expect(recentData.security.Rename).toBe(true);
      expect(recentData.canShare).toBe(true);
    });
  });

  test("Personal Deny access blocks user when group Editing and public link also present", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    let userEmail: string;
    let userPassword: string;
    let userId: string;
    let fileId: number;

    await test.step("Create file and user via API", async () => {
      const fileResponse = await apiSdk.files.createFileInMyDocuments("owner", {
        title: FILE_NAME,
      });
      const fileBody = await fileResponse.json();
      fileId = fileBody.response.id;

      const { userData, response: userResponse } =
        await apiSdk.profiles.addMember("owner", "User");
      userEmail = userData.email;
      userPassword = userData.password;
      const userBody = await userResponse.json();
      userId = userBody.response.id;
    });

    await test.step("Create group with user", async () => {
      await login.loginToPortal();
      const contacts = new Contacts(page, api.portalDomain);
      await contacts.open();
      await contacts.createGroupWithMembers(GROUP_NAME, [userEmail]);
    });

    await test.step("Share file with group (Editing), create Anyone-with-link external link", async () => {
      const myDocuments = new MyDocuments(page, api.portalDomain);
      const infoPanel = new InfoPanel(page);
      await myDocuments.open();
      await myDocuments.filesTable.openContextMenuForItem(FILE_NAME);
      await myDocuments.filesTable.contextMenu.clickSubmenuOption(
        "Share",
        "Sharing settings",
      );
      await infoPanel.checkShareExist();
      await infoPanel.addGroupToShare(GROUP_NAME);
      await infoPanel.checkMemberInList(GROUP_NAME);
      await infoPanel.changeUserShareRole(GROUP_NAME, "editing");
      const linkPromise = waitForShareLinkResponse(page);
      await infoPanel.createFirstSharedLink(); // Anyone with the link, Read only
      await linkPromise;
      await myDocuments.dismissToastSafely("Link copied to clipboard");
    });

    await test.step("Login as user and verify file visible in Shared with Me", async () => {
      const userLogin = new Login(page, api.portalDomain);
      await userLogin.logout();
      await userLogin.loginWithCredentials(userEmail, userPassword);
      const sharedWithMe = new SharedWithMe(page, api.portalDomain);
      await sharedWithMe.open();
      await sharedWithMe.filesTable.checkRowExist(FILE_NAME);
    });

    await test.step("Set personal Deny access via API", async () => {
      await apiSdk.files.shareFile("owner", fileId, {
        share: [{ shareTo: userId, access: 3 }],
        notify: false,
      });
    });

    await test.step("Verify file no longer visible despite group Editing and public link", async () => {
      const sharedWithMe = new SharedWithMe(page, api.portalDomain);
      await sharedWithMe.open();
      await sharedWithMe.filesTable.checkRowNotExist(FILE_NAME);
    });
  });
});
