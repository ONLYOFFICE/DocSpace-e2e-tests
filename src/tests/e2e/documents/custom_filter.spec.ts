import Files from "@/src/objects/files/Files";
import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import {
  spreadsheetContextMenuOption,
  filesToastMessages,
  sampleCsvFile,
} from "@/src/utils/constants/files";

test.describe("My documents: Custom filter", () => {
  let files: Files;

  test.beforeEach(async ({ page, api, login }) => {
    files = new Files(page, api.portalDomain);

    await login.loginToPortal();
    await files.open();
    await files.deleteAllDocs();
  });

  test("Enable Custom filter for Spreadsheet", async () => {
    await test.step("Create files", async () => {
      await files.createFiles();
    });

    await test.step("Enable Custom filter and verify toast and icon", async () => {
      await files.filesTable.openContextMenuForItem("Spreadsheet");
      await files.filesTable.contextMenu.clickOption(
        spreadsheetContextMenuOption.customFilter,
      );
      await files.checkToastMessage(filesToastMessages.customFilterEnabled);
      await files.filesTable.expectCustomFilterIconVisible("Spreadsheet");
      await files.dismissToastSafely(filesToastMessages.customFilterEnabled);
    });

    await test.step("Document does not have Enable Custom filter option", async () => {
      await files.filesTable.openContextMenuForItem("Document");
      await expect(
        files.filesTable.contextMenu.getItemLocator(
          spreadsheetContextMenuOption.customFilter,
        ),
      ).not.toBeVisible();
      await files.filesTable.contextMenu.close();
    });
  });

  test.skip("[Bug 81390] Enable Custom filter for CSV spreadsheet", async ({
    apiSdk,
  }) => {
    await test.step("Upload CSV file", async () => {
      await apiSdk.files.uploadToMyDocuments("owner", sampleCsvFile.path);
      await files.open();
    });

    await test.step("Enable Custom filter and verify toast and icon", async () => {
      await files.filesTable.openContextMenuForItem(sampleCsvFile.name, true);
      await files.filesTable.contextMenu.clickOption(
        spreadsheetContextMenuOption.customFilter,
      );
      await files.checkToastMessage(filesToastMessages.customFilterEnabled);
      await files.filesTable.expectCustomFilterIconVisible(sampleCsvFile.name);
      await files.dismissToastSafely(filesToastMessages.customFilterEnabled);
    });
  });
});
