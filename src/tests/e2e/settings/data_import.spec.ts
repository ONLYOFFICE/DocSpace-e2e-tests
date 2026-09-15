import { test } from "@/src/fixtures";
import DataImport, {
  googleImportSteps,
  googleTakeoutFixture,
  importProvider,
  importWizards,
} from "@/src/objects/settings/dataImport/DataImport";
import Contacts from "@/src/objects/contacts/Contacts";

test.describe("Data import", () => {
  let dataImport: DataImport;

  test.beforeEach(async ({ page, login }) => {
    dataImport = new DataImport(page);
    await login.loginToPortal();
    await dataImport.open();
  });

  test("All supported services are offered", async () => {
    await dataImport.expectProvidersVisible();
  });

  test("Each service opens its own import wizard", async () => {
    for (const wizard of importWizards) {
      await test.step(wizard.heading, async () => {
        await dataImport.expectWizardMatches(wizard);
      });
    }
  });

  test("Google Takeout archive is imported and its user lands in Contacts", async ({
    page,
    api,
  }) => {
    test.setTimeout(360000);

    await test.step("Upload the Takeout archive", async () => {
      await dataImport.startImport(importProvider.google);
      await dataImport.uploadBackupFile(googleTakeoutFixture.path);
    });

    await test.step("Parsing advances the wizard to user selection", async () => {
      await dataImport.expectStep(googleImportSteps.selectUsers);
    });

    await test.step("The user from the archive is listed and pre-selected", async () => {
      await dataImport.expectParsedUser(
        googleTakeoutFixture.userName,
        googleTakeoutFixture.userEmail,
      );
      await dataImport.expectSelectedUsers(googleTakeoutFixture.selectedUsers);
    });

    await test.step("Walk the wizard through to the completion screen", async () => {
      await dataImport.completeImport();
    });

    await test.step("The imported user appears in Contacts", async () => {
      const contacts = new Contacts(page, api.portalDomain);
      await contacts.open();
      await contacts.expectUserEmailInTable(googleTakeoutFixture.userEmail);
    });
  });

  test("Unsupported file is not accepted as a backup", async () => {
    await test.step("Open the ONLYOFFICE Workspace wizard", async () => {
      await dataImport.startImport(importProvider.workspace);
      await dataImport.expectNextStepDisabled();
    });

    await test.step("A document is ignored instead of being uploaded", async () => {
      await dataImport.chooseBackupFile("data/documents/test-document.docx");
      await dataImport.expectWizardOpened(
        "Import from ONLYOFFICE Workspace",
        "1/6. Select file",
      );
      await dataImport.expectNextStepDisabled();
    });
  });
});
