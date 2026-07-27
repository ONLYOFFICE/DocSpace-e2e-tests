import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import ProfileFileManagement from "@/src/objects/profile/ProfileFileManagement";
import Files from "@/src/objects/files/Files";

const FILE_NAME = "TestFileForDeletion";

test.describe("Profile - Display notification when moving items to Trash", () => {
  let profileFileManagement: ProfileFileManagement;
  let files: Files;

  test.beforeEach(async ({ page, api, apiSdk, login }) => {
    profileFileManagement = new ProfileFileManagement(page, api.portalDomain);
    files = new Files(page, api.portalDomain);
    await login.loginToPortal();
    await apiSdk.files.createFileInMyDocuments("owner", { title: FILE_NAME });
    await profileFileManagement.open();
  });

  test("Trash notification appears when deleting a file with toggle enabled", async () => {
    await test.step("Delete file and verify toast notification appears", async () => {
      await files.open();
      await files.filesTable.openContextMenuForItem(FILE_NAME);
      await files.filesTable.contextMenu.clickOption("Delete");
      await files.folderDeleteModal.clickDeleteFolder();
      await files.checkToastMessage("successfully moved to Trash");
    });
  });

  test("Disabling toggle suppresses trash notification", async ({ page }) => {
    await test.step("Disable display notification toggle", async () => {
      await profileFileManagement.toggleDisplayTrashNotification();
    });

    await test.step("Delete file", async () => {
      await files.open();
      await files.filesTable.openContextMenuForItem(FILE_NAME);
      await files.filesTable.contextMenu.clickOption("Delete");
    });

    await test.step("Verify file is deleted and no toast appears", async () => {
      await files.filesTable.checkRowNotExist(FILE_NAME);
      await expect(
        page
          .locator("#toast-container")
          .getByRole("alert")
          .filter({ hasText: "successfully moved to Trash" }),
      ).not.toBeVisible();
    });
  });
});
