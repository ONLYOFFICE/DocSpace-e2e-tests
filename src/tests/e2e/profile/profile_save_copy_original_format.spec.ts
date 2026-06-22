import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import ProfileFileManagement from "@/src/objects/profile/ProfileFileManagement";
import MyDocuments from "@/src/objects/files/MyDocuments";
import { legacyDocFile } from "@/src/utils/constants/files";

test.describe("Profile - Save the file copy in the original format as well", () => {
  let profileFileManagement: ProfileFileManagement;
  let myDocuments: MyDocuments;

  test.beforeEach(async ({ page, api, login }) => {
    profileFileManagement = new ProfileFileManagement(page, api.portalDomain);
    myDocuments = new MyDocuments(page, api.portalDomain);
    await login.loginToPortal();
    await profileFileManagement.open();
  });

  test("Uploading legacy format creates both converted and original copy", async () => {
    await test.step("Upload legacy .doc file and confirm conversion", async () => {
      await myDocuments.open();
      await myDocuments.uploadAndVerifyConversion(
        legacyDocFile.path,
        legacyDocFile.name,
      );
    });

    await test.step("Verify two entries exist for the file", async () => {
      await expect(
        await myDocuments.filesTable.getRowByTitle(legacyDocFile.name),
      ).toHaveCount(2);
    });
  });

  test("Disabling toggle creates only the converted file on upload", async () => {
    await test.step("Disable save copy in original format toggle", async () => {
      await profileFileManagement.toggleSaveCopyOriginalFormat();
    });

    await test.step("Upload legacy .doc file and confirm conversion", async () => {
      await myDocuments.open();
      await myDocuments.filesNavigation.uploadFiles(legacyDocFile.path);
      await myDocuments.convertDialog.checkDialogVisible();
      await myDocuments.convertDialog.confirm();
    });

    await test.step("Verify only one entry exists for the file", async () => {
      await expect(
        await myDocuments.filesTable.getRowByTitle(legacyDocFile.name),
      ).toHaveCount(1);
    });
  });
});
