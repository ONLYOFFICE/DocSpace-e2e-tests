import { test } from "@/src/fixtures";
import ProfileFileManagement from "@/src/objects/profile/ProfileFileManagement";
import MyDocuments from "@/src/objects/files/MyDocuments";
import { mapInitialDocNames } from "@/src/utils/constants/files";

const SAMPLE_DOC = mapInitialDocNames.ONLYOFFICE_SAMPLE_DOCUMENT;
const SAMPLE_SHEET = mapInitialDocNames.ONLYOFFICE_SAMPLE_SPREADSHEETS;

test.describe("Profile - Display file extension next to file name", () => {
  let profileFileManagement: ProfileFileManagement;
  let myDocuments: MyDocuments;

  test.beforeEach(async ({ page, api, login }) => {
    profileFileManagement = new ProfileFileManagement(page, api.portalDomain);
    myDocuments = new MyDocuments(page, api.portalDomain);
    await login.loginToPortal();
  });

  test("Files are shown without extensions by default", async () => {
    await test.step("Open My Documents and verify no extensions are shown", async () => {
      await myDocuments.open();
      await myDocuments.filesTable.expectCellItemVisible(SAMPLE_DOC);
      await myDocuments.filesTable.expectCellItemVisible(SAMPLE_SHEET);
    });

    await test.step("Verify extensions are not shown in name cells", async () => {
      await myDocuments.filesTable.expectCellItemNotVisible(
        `${SAMPLE_DOC}.docx`,
      );
      await myDocuments.filesTable.expectCellItemNotVisible(
        `${SAMPLE_SHEET}.xlsx`,
      );
    });
  });

  test("Enabling toggle shows extensions next to file names", async () => {
    await test.step("Enable display file extension toggle", async () => {
      await profileFileManagement.open();
      await profileFileManagement.toggleDisplayFileExtension();
      await profileFileManagement.expectDisplayFileExtensionEnabled(true);
    });

    await test.step("Verify document shows with .docx extension", async () => {
      await myDocuments.open();
      await myDocuments.filesTable.expectCellItemVisible(`${SAMPLE_DOC}.docx`);
    });

    await test.step("Verify spreadsheet shows with .xlsx extension", async () => {
      await myDocuments.filesTable.expectCellItemVisible(
        `${SAMPLE_SHEET}.xlsx`,
      );
    });
  });

  test("Disabling toggle hides extensions again", async () => {
    await test.step("Enable display file extension toggle", async () => {
      await profileFileManagement.open();
      await profileFileManagement.toggleDisplayFileExtension();
      await profileFileManagement.expectDisplayFileExtensionEnabled(true);
    });

    await test.step("Disable display file extension toggle", async () => {
      await profileFileManagement.toggleDisplayFileExtension();
      await profileFileManagement.expectDisplayFileExtensionEnabled(false);
    });

    await test.step("Verify extensions are no longer shown", async () => {
      await myDocuments.open();
      await myDocuments.filesTable.expectCellItemVisible(SAMPLE_DOC);
      await myDocuments.filesTable.expectCellItemNotVisible(
        `${SAMPLE_DOC}.docx`,
      );
    });
  });
});
