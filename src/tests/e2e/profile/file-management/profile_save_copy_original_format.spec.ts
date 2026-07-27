import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import ProfileFileManagement from "@/src/objects/profile/ProfileFileManagement";
import Files from "@/src/objects/files/Files";
import { legacyDocFile } from "@/src/utils/constants/files";

test.describe("Profile - Save the file copy in the original format as well", () => {
  let profileFileManagement: ProfileFileManagement;
  let files: Files;

  test.beforeEach(async ({ page, api, login }) => {
    profileFileManagement = new ProfileFileManagement(page, api.portalDomain);
    files = new Files(page, api.portalDomain);
    await login.loginToPortal();
    await profileFileManagement.open();
  });

  test("Uploading legacy format creates both converted and original copy", async () => {
    await test.step("Upload legacy .doc file and confirm conversion", async () => {
      await files.open();
      await files.uploadAndVerifyConversion(
        legacyDocFile.path,
        legacyDocFile.name,
      );
    });

    await test.step("Verify two entries exist for the file", async () => {
      await expect(
        await files.filesTable.getRowByTitle(legacyDocFile.name),
      ).toHaveCount(2);
    });
  });

  test("Disabling toggle creates only the converted file on upload", async () => {
    await test.step("Disable save copy in original format toggle", async () => {
      await profileFileManagement.toggleSaveCopyOriginalFormat();
    });

    await test.step("Upload legacy .doc file and confirm conversion", async () => {
      await files.open();
      await files.filesNavigation.uploadFiles(legacyDocFile.path);
      await files.convertDialog.checkDialogVisible();
      await files.convertDialog.confirm();
    });

    await test.step("Verify only one entry exists for the file", async () => {
      await expect(
        await files.filesTable.getRowByTitle(legacyDocFile.name),
      ).toHaveCount(1);
    });
  });
});
