import { test } from "@/src/fixtures";
import ProfileFileManagement from "@/src/objects/profile/ProfileFileManagement";
import Files from "@/src/objects/files/Files";
import { deleteDialogTexts } from "@/src/utils/constants/files";

const FILE_NAME = "TestFileForDeletion";
const SECOND_FILE_NAME = "SecondFileForDeletion";
const THIRD_FILE_NAME = "ThirdFileForDeletion";
// The list hides the extension, the delete dialog shows the full name
const FILE_EXTENSION = ".docx";

// The "Show a notification when moving items to Trash" toggle controls the
// "Move to Trash?" confirmation dialog, not the toast
test.describe("Profile - Confirmation when moving items to Trash", () => {
  let profileFileManagement: ProfileFileManagement;
  let files: Files;

  test.beforeEach(async ({ page, api, apiSdk, login }) => {
    profileFileManagement = new ProfileFileManagement(page, api.portalDomain);
    files = new Files(page, api.portalDomain);
    await login.loginToPortal();
    await apiSdk.files.createFileInMyDocuments("owner", { title: FILE_NAME });
    for (const title of [SECOND_FILE_NAME, THIRD_FILE_NAME]) {
      await apiSdk.files.createFileInMyDocuments("owner", { title });
    }
  });

  test("Disabling toggle deletes without the confirmation dialog", async () => {
    await test.step("Disable the toggle", async () => {
      await profileFileManagement.open();
      await profileFileManagement.toggleDisplayTrashNotification();
      await profileFileManagement.expectDisplayTrashNotificationEnabled(false);
    });

    await test.step("File goes to Trash without the dialog", async () => {
      await files.open();
      await files.deleteWithoutConfirmation(FILE_NAME);
    });
  });

  test("Don't ask again in the dialog turns the toggle off, turning it on brings the dialog back", async () => {
    await test.step("Check Don't ask again and move the file to Trash", async () => {
      await files.open();
      await files.openDeleteDialog(FILE_NAME);
      await files.folderDeleteModal.checkDialogOpened(
        deleteDialogTexts.singleItemMessage(`${FILE_NAME}${FILE_EXTENSION}`),
      );
      await files.folderDeleteModal.checkDontAskAgain();
      await files.folderDeleteModal.clickDeleteFolder();
      await files.removeToast("successfully moved to Trash");
      await files.filesTable.checkRowNotExist(FILE_NAME);
    });

    await test.step("Next file goes to Trash without the dialog", async () => {
      await files.deleteWithoutConfirmation(SECOND_FILE_NAME);
    });

    await test.step("Toggle in Profile is off, turn it back on", async () => {
      await profileFileManagement.open();
      await profileFileManagement.expectDisplayTrashNotificationEnabled(false);
      await profileFileManagement.toggleDisplayTrashNotification();
      await profileFileManagement.expectDisplayTrashNotificationEnabled(true);
    });

    await test.step("Delete dialog is shown again", async () => {
      await files.open();
      await files.openDeleteDialog(THIRD_FILE_NAME);
      await files.folderDeleteModal.checkDialogOpened(
        deleteDialogTexts.singleItemMessage(
          `${THIRD_FILE_NAME}${FILE_EXTENSION}`,
        ),
      );
      await files.folderDeleteModal.clickDeleteFolder();
      await files.removeToast("successfully moved to Trash");
      await files.filesTable.checkRowNotExist(THIRD_FILE_NAME);
    });
  });
});
