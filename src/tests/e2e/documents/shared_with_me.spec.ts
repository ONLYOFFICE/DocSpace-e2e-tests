import SharedWithMe from "@/src/objects/files/SharedWithMe";
import FilesTable from "@/src/objects/files/FilesTable";
import FolderDeleteModal from "@/src/objects/files/FolderDeleteModal";
import Login from "@/src/objects/common/Login";
import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import { documentContextMenuOption } from "@/src/utils/constants/files";

test.describe("Shared with me", () => {
  test("Empty view is shown when nothing is shared", async ({
    page,
    api,
    login,
  }) => {
    await login.loginToPortal();
    const sharedWithMe = new SharedWithMe(page, api.portalDomain);

    await test.step("Open Shared with me", async () => {
      await sharedWithMe.open();
    });

    await test.step("Check empty view", async () => {
      await sharedWithMe.checkEmptyViewVisible();
    });
  });

  test("Shared file appears in Shared with me for invited user", async ({
    page,
    api,
    apiSdk,
  }) => {
    const fileName = "SharedDocument";
    let fileId: number;
    let userEmail: string;
    let userPassword: string;

    await test.step("Create file in My Documents via API", async () => {
      const fileResponse = await apiSdk.files.createFileInMyDocuments("owner", {
        title: fileName,
      });
      const fileBody = await fileResponse.json();
      fileId = fileBody.response.id;
    });

    await test.step("Create user and share file with them", async () => {
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

    await test.step("Login as user and check Shared with me", async () => {
      const userLogin = new Login(page, api.portalDomain);
      await userLogin.loginWithCredentials(userEmail, userPassword);

      const sharedWithMe = new SharedWithMe(page, api.portalDomain);
      await sharedWithMe.open();

      const filesTable = new FilesTable(page);
      await filesTable.checkRowExist(fileName);
    });
  });

  test.describe("File actions in Shared with me", () => {
    const fileName = "SharedDocument";
    let sharedWithMe: SharedWithMe;

    test.beforeEach(async ({ page, api, apiSdk }) => {
      const fileResponse = await apiSdk.files.createFileInMyDocuments("owner", {
        title: fileName,
      });
      const fileBody = await fileResponse.json();
      const fileId = fileBody.response.id;

      const { userData, response } = await apiSdk.profiles.addMember(
        "owner",
        "User",
      );
      const userBody = await response.json();
      const userId = userBody.response.id;

      await apiSdk.files.shareFile("owner", fileId, {
        share: [{ shareTo: userId, access: 2 }],
        notify: false,
      });

      const userLogin = new Login(page, api.portalDomain);
      await userLogin.loginWithCredentials(userData.email, userData.password);

      sharedWithMe = new SharedWithMe(page, api.portalDomain);
      await sharedWithMe.open();
      await sharedWithMe.filesTable.checkRowExist(fileName);
    });

    test("Remove file from Shared with me", async ({ page }) => {
      await test.step("Remove file via context menu", async () => {
        await sharedWithMe.filesTable.openContextMenuForItem(fileName, true);
        await sharedWithMe.filesTable.contextMenu.clickOption(
          documentContextMenuOption.removeFromShared,
        );
        const confirmModal = new FolderDeleteModal(page);
        await confirmModal.clickDeleteFolder();
        await sharedWithMe.filesTable.checkRowNotExist(fileName);
      });
    });

    test("Download file from Shared with me", async () => {
      const download = await sharedWithMe.waitForDownload(async () => {
        await sharedWithMe.filesTable.openContextMenuForItem(fileName, true);
        await sharedWithMe.filesTable.contextMenu.clickSubmenuOption(
          documentContextMenuOption.download,
          "Original format",
        );
      });

      expect(download.suggestedFilename().toLowerCase()).toContain(".docx");
      await download.delete();
    });

    test("Filter Shared with me files by type", async () => {
      await test.step("Filter by documents shows the shared docx", async () => {
        await sharedWithMe.filesFilter.openFilterDialog();
        await sharedWithMe.filesFilter.selectFilterByDocuments();
        await sharedWithMe.filesFilter.applyFilterNoWait();
        await sharedWithMe.filesTable.checkRowExist(fileName);
      });

      await test.step("Filter by spreadsheets gives empty result", async () => {
        await sharedWithMe.filesFilter.openFilterDialog();
        await sharedWithMe.filesFilter.selectFilterBySpreadsheets();
        await sharedWithMe.filesFilter.applyFilterNoWait();
        await sharedWithMe.filesFilter.checkFilesEmptyViewExist();
        await sharedWithMe.filesFilter.clearFilterFromEmptyView();
      });
    });

    test("Info panel shows shared file properties", async () => {
      await test.step("Open info panel for shared file", async () => {
        await sharedWithMe.filesTable.selectRow(fileName);
        await sharedWithMe.infoPanel.open();
      });

      await test.step("Verify info panel is visible", async () => {
        await sharedWithMe.infoPanel.checkInfoPanelExist();
      });
    });
  });
});
