import MyDocuments from "@/src/objects/files/MyDocuments";
import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import {
  spreadsheetContextMenuOption,
  filesToastMessages,
  sampleCsvFile,
} from "@/src/utils/constants/files";

test.describe("My documents: Custom filter", () => {
  let myDocuments: MyDocuments;

  test.beforeEach(async ({ page, api, login }) => {
    myDocuments = new MyDocuments(page, api.portalDomain);

    await login.loginToPortal();
    await myDocuments.open();
    await myDocuments.deleteAllDocs();
  });

  test("Enable Custom filter for Spreadsheet", async () => {
    await test.step("Create files", async () => {
      await myDocuments.filesArticle.createFiles();
    });

    await test.step("Enable Custom filter and verify toast and icon", async () => {
      await myDocuments.filesTable.openContextMenuForItem("Spreadsheet");
      await myDocuments.filesTable.contextMenu.clickOption(
        spreadsheetContextMenuOption.customFilter,
      );
      await myDocuments.checkToastMessage(
        filesToastMessages.customFilterEnabled,
      );
      await myDocuments.filesTable.expectCustomFilterIconVisible("Spreadsheet");
      await myDocuments.dismissToastSafely(
        filesToastMessages.customFilterEnabled,
      );
    });

    await test.step("Document does not have Enable Custom filter option", async () => {
      await myDocuments.filesTable.openContextMenuForItem("Document");
      await expect(
        myDocuments.filesTable.contextMenu.getItemLocator(
          spreadsheetContextMenuOption.customFilter,
        ),
      ).not.toBeVisible();
      await myDocuments.filesTable.contextMenu.close();
    });
  });

  test.skip("[Bug 81390] Enable Custom filter for CSV spreadsheet", async ({
    apiSdk,
  }) => {
    await test.step("Upload CSV file", async () => {
      await apiSdk.files.uploadToMyDocuments("owner", sampleCsvFile.path);
      await myDocuments.open();
    });

    await test.step("Enable Custom filter and verify toast and icon", async () => {
      await myDocuments.filesTable.openContextMenuForItem(
        sampleCsvFile.name,
        true,
      );
      await myDocuments.filesTable.contextMenu.clickOption(
        spreadsheetContextMenuOption.customFilter,
      );
      await myDocuments.checkToastMessage(
        filesToastMessages.customFilterEnabled,
      );
      await myDocuments.filesTable.expectCustomFilterIconVisible(
        sampleCsvFile.name,
      );
      await myDocuments.dismissToastSafely(
        filesToastMessages.customFilterEnabled,
      );
    });
  });
});
