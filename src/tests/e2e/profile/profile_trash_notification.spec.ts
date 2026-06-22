import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import ProfileFileManagement from "@/src/objects/profile/ProfileFileManagement";
import MyDocuments from "@/src/objects/files/MyDocuments";

const FILE_NAME = "TestFileForDeletion";

test.describe("Profile - Display notification when moving items to Trash", () => {
  let profileFileManagement: ProfileFileManagement;
  let myDocuments: MyDocuments;

  test.beforeEach(async ({ page, api, apiSdk, login }) => {
    profileFileManagement = new ProfileFileManagement(page, api.portalDomain);
    myDocuments = new MyDocuments(page, api.portalDomain);
    await login.loginToPortal();
    await apiSdk.files.createFileInMyDocuments("owner", { title: FILE_NAME });
    await profileFileManagement.open();
  });

  test("Trash notification appears when deleting a file with toggle enabled", async () => {
    await test.step("Delete file and verify toast notification appears", async () => {
      await myDocuments.open();
      await myDocuments.filesTable.openContextMenuForItem(FILE_NAME);
      await myDocuments.filesTable.contextMenu.clickOption("Delete");
      await myDocuments.folderDeleteModal.clickDeleteFolder();
      await myDocuments.checkToastMessage("successfully moved to Trash");
    });
  });

  test("Disabling toggle suppresses trash notification", async ({ page }) => {
    await test.step("Disable display notification toggle", async () => {
      await profileFileManagement.toggleDisplayTrashNotification();
    });

    await test.step("Delete file", async () => {
      await myDocuments.open();
      await myDocuments.filesTable.openContextMenuForItem(FILE_NAME);
      await myDocuments.filesTable.contextMenu.clickOption("Delete");
    });

    await test.step("Verify file is deleted and no toast appears", async () => {
      await myDocuments.filesTable.checkRowNotExist(FILE_NAME);
      await expect(
        page
          .locator("#toast-container")
          .getByRole("alert")
          .filter({ hasText: "successfully moved to Trash" }),
      ).not.toBeVisible();
    });
  });
});
