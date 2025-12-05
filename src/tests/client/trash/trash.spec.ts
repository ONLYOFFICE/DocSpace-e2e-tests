import { docSort, mapInitialDocNames } from "@/src/utils/constants/files";

// import Screenshot from "@/src/objects/common/Screenshot";
import MyDocuments from "@/src/objects/files/MyDocuments";
import Trash from "@/src/objects/trash/Trash";
import { roomCreateTitles } from "@/src/utils/constants/rooms";
import { test } from "@/src/fixtures";

test.describe("Trash", () => {
  // let screenshot: Screenshot;

  let myDocuments: MyDocuments;
  let trash: Trash;

  test.beforeEach(async ({ page, api, login }) => {
    myDocuments = new MyDocuments(page, api.portalDomain);
    trash = new Trash(page);
    // screenshot = new Screenshot(page, { screenshotDir: "trash" });

    await login.loginToPortal();
    await myDocuments.open();
    await myDocuments.deleteAllDocs();
    await trash.open();
  });

  test("Render", async ({ page }) => {
    await test.step("Render", async () => {
      await myDocuments.filesFilter.applySort(docSort.name);
      await trash.trashTable.checkRowExist(
        mapInitialDocNames.ONLYOFFICE_SAMPLE_DOCUMENT,
      );
      // await screenshot.expectHaveScreenshot("render");
    });

    await test.step("Sort", async () => {
      await trash.filter.sortButton.click();
    });

    await test.step("Filter", async () => {
      await trash.filter.filterButton.click();
      await page.waitForTimeout(2000);
      await page.mouse.click(1, 1);
    });

    await test.step("InfoPanel", async () => {
      await trash.trashTable.tableRows.first().click();
      await trash.infoPanel.open();
      await trash.infoPanel.openOptions();
      await trash.infoPanel.close();
    });

    await test.step("RestoreSelector", async () => {
      await trash.openRestoreSelector();

      await trash.trashSelector.select("rooms");
      await trash.trashSelector.createNewItem();
      await trash.trashSelector.selectCreateRoomType(roomCreateTitles.public);
      await trash.trashSelector.fillNewItemName(roomCreateTitles.public);
      await trash.trashSelector.acceptCreate();
      await trash.trashSelector.selectItemByIndex(1);
      await trash.trashSelector.checkEmptyContainerExist();

      await trash.trashSelector.gotoRoot();
      await trash.trashSelector.select("documents");
      await trash.trashSelector.checkEmptyContainerExist();
      await trash.trashSelector.createNewFolder();
    });

    await test.step("Restore", async () => {
      await trash.trashSelector.restore();
      await trash.trashEmptyView.checkNoDocsTextExist();
    });

    await test.step("ActionRequiredDialog", async () => {
      await myDocuments.open();
      await myDocuments.deleteAllDocs();
      await trash.open();
      await trash.openRestoreSelector();
      await trash.trashSelector.select("documents");
      await trash.trashSelector.createNewFolder();
      await trash.trashSelector.restore();
      await trash.checkActionRequiredDialogExist();
      await trash.closeActionRequiredDialog();
      await trash.trashSelector.close();
    });

    await test.step("DeleteForever", async () => {
      await trash.deleteForever();
    });
  });
});
