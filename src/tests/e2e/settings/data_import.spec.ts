import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import DataImport, {
  googleImportSteps,
  googleTakeoutFixture,
  importProvider,
  importWizards,
} from "@/src/objects/settings/dataImport/DataImport";
import Contacts from "@/src/objects/contacts/Contacts";
import Login from "@/src/objects/common/Login";
import SharedWithMe from "@/src/objects/files/SharedWithMe";

test.describe("Data import", () => {
  let dataImport: DataImport;

  test.beforeEach(async ({ page, login }) => {
    dataImport = new DataImport(page);
    await login.loginToPortal();
    await dataImport.open();
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

  test("Two archives of one export are folded into a single user", async ({
    apiSdk,
  }) => {
    test.setTimeout(360000);

    await test.step("Upload both archives at once", async () => {
      await dataImport.startImport(importProvider.google);
      await dataImport.uploadBackupFiles([
        googleTakeoutFixture.path,
        googleTakeoutFixture.volumePath,
      ]);
    });

    await test.step("Both archives parse into one user", async () => {
      await dataImport.expectStep(googleImportSteps.selectUsers);
      await dataImport.expectParsedUser(
        googleTakeoutFixture.userName,
        googleTakeoutFixture.userEmail,
      );
      await dataImport.expectSelectedUsers(googleTakeoutFixture.selectedUsers);
    });

    await test.step("Neither archive is rejected", async () => {
      const status = await apiSdk.migration.getStatus("owner");
      expect(status.parseResult.failedArchives).toEqual([]);
      expect(status.parseResult.users).toHaveLength(1);
    });
  });

  test("Sharing from the archive reaches the user it was shared with", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    test.setTimeout(360000);

    let recipientPassword = "";
    await test.step("Create the recipient on the portal", async () => {
      const { userData } = await apiSdk.profiles.addMember("owner", "User", {
        email: googleTakeoutFixture.recipientEmail,
      });
      recipientPassword = userData.password;
    });

    await test.step("Import both users' archives", async () => {
      await dataImport.startImport(importProvider.google);
      await dataImport.uploadBackupFiles([
        googleTakeoutFixture.path,
        googleTakeoutFixture.recipientArchivePath,
      ]);
      await dataImport.expectStep(googleImportSteps.selectUsers);
      await dataImport.completeImport();
    });

    await test.step("The recipient finds the file in Shared with me", async () => {
      await login.logout();
      const recipientLogin = new Login(page, api.portalDomain);
      await recipientLogin.loginWithCredentials(
        googleTakeoutFixture.recipientEmail,
        recipientPassword,
      );

      const sharedWithMe = new SharedWithMe(page, api.portalDomain);
      await sharedWithMe.open();
      await sharedWithMe.filesTable.checkRowExist(
        googleTakeoutFixture.sharedFileName,
      );
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
