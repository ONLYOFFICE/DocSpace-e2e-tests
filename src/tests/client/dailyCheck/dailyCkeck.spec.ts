import Screenshot from "@/src/objects/common/Screenshot";
import MyDocuments from "@/src/objects/files/MyDocuments";
import MyRooms from "@/src/objects/rooms/Rooms";
import Archive from "@/src/objects/archive/Archive";
import Trash from "@/src/objects/trash/Trash";
import { Payments } from "@/src/objects/settings/payments/Payments";
import { Backup } from "@/src/objects/settings/backup/Backup";
import {
    roomContextMenuOption,
    roomCreateTitles,
    roomTemplateTitles,
    roomToastMessages,
    templateContextMenuOption,
    roomSort,
    } from "@/src/utils/constants/rooms";
import {
      mapBackupMethodsIds,
      toastMessages,
    } from "@/src/utils/constants/settings";
import { Page } from "@playwright/test";
import { test } from "@/src/fixtures";

test.describe("Daily check", () => {
  let screenshot: Screenshot;
  let myDocuments: MyDocuments;
  let myRooms: MyRooms;
  let page: Page;
  let myArchive: Archive;
  let trash: Trash;
  let backup: Backup; 
  let payments: Payments;

  test.beforeEach(async ({ page: fixturePage, api, login }) => {
    page = fixturePage;
    myDocuments = new MyDocuments(page, api.portalDomain);
    myRooms = new MyRooms(page, api.portalDomain);
    myArchive = new Archive(page, api.portalDomain);
    trash = new Trash(page);    
    backup = new Backup(page);
    payments = new Payments(page);
    screenshot = new Screenshot(page, {
      screenshotDir: "dailyCheck",
      fullPage: true,
    });

    await login.loginToPortal();
    
  });

  test("All dailyCheck scenarios", async () => {
    await test.step("Render MyRooms", async () => {
        await myRooms.roomsEmptyView.checkNoRoomsExist();
        await screenshot.expectHaveScreenshot("render_myRooms");
      });

      await test.step("Create Room", async () => {
        await myRooms.createRooms();
        await screenshot.expectHaveScreenshot("create_room");     
      });

      await test.step("Create Template Of The Room", async () => {
        await myRooms.roomsTable.openContextMenu(roomCreateTitles.public);
        await myRooms.roomsTable.clickContextMenuOption(
          roomContextMenuOption.saveAsTemplate,
        );
        await myRooms.roomsCreateDialog.createPublicRoomTemplate();
        await myRooms.removeToast(
          roomToastMessages.templateSaved(roomTemplateTitles.roomTemplate),
        );
        await myRooms.roomsEmptyView.checkEmptyRoomExist(roomCreateTitles.public);
        await myRooms.backToRooms();
        await myRooms.roomsTable.checkRowExist(roomTemplateTitles.roomTemplate);
        await myRooms.infoPanel.close();
        await myRooms.roomsTable.hideLastActivityColumn();
        await screenshot.expectHaveScreenshot(
          "create_template_of_the_room_created",
        );
      });

      await test.step("Create Room From Template", async () => {
        await myRooms.roomsTable.openContextMenu(roomTemplateTitles.roomTemplate);
        await myRooms.roomsTable.clickContextMenuOption(
          templateContextMenuOption.createRoom,
        );
        await myRooms.roomsCreateDialog.createPublicRoomFromTemplate();
        await myRooms.removeToast(
          roomToastMessages.baseOnTemplateCreated(
            roomTemplateTitles.fromTemplate,
          ),
        );
        await myRooms.roomsEmptyView.checkEmptyRoomExist(roomCreateTitles.public);
        await myRooms.backToRooms();
        await myRooms.roomsTable.checkRowExist(roomTemplateTitles.fromTemplate);
        await myRooms.infoPanel.close();
        await screenshot.expectHaveScreenshot(
          "create_room_from_template_created",
        );
      });

      await test.step("Search", async () => {
        await myRooms.roomsFilter.fillRoomsSearchInputAndCheckRequest(
          roomCreateTitles.collaboration,
        );
        await myRooms.roomsTable.checkRowExist(roomCreateTitles.collaboration);
        await screenshot.expectHaveScreenshot("search_collaboration_room");
        await myRooms.roomsFilter.clearSearchText();
      });

      await test.step("EmptyView", async () => {
        await myRooms.moveAllRoomsToArchive();
        await myRooms.roomsEmptyView.checkNoRoomsExist();
        await myRooms.openTemplatesTab();
        await myRooms.roomsTable.checkRowExist(roomTemplateTitles.roomTemplate);
        await myRooms.deleteAllRooms();
        await myRooms.roomsEmptyView.checkNoTemplatesExist();
        await screenshot.expectHaveScreenshot("empty_view_templates");
      });

      await test.step("Archive", async () => {
        await myArchive.open();
        await myArchive.hideLastActivityColumn();
        await myRooms.roomsFilter.applyRoomsSort(roomSort.name);
        await screenshot.expectHaveScreenshot("rooms_archive");
      });

      await test.step("Restore Rooms", async () => {
        await myArchive.restoreRooms();
        await myArchive.archiveEmptyView.checkNoArchivedRoomsExist();
        await screenshot.expectHaveScreenshot("restore_rooms_restored");
      });
      
      await test.step("Delete Rooms", async () => {
        await myArchive.archiveEmptyView.gotoRooms();
        await myRooms.roomsTable.checkRowExist(roomCreateTitles.public);
        await myRooms.moveAllRoomsToArchive();
        await myRooms.roomsEmptyView.checkNoRoomsExist();
        await myArchive.open();
        await myArchive.deleteRooms();
        await myArchive.archiveEmptyView.checkNoArchivedRoomsExist();
      });

      await test.step("Render Documents", async () => {
        await myDocuments.open();
        await myDocuments.filesTable.hideModifiedColumn();
        await screenshot.expectHaveScreenshot("render_documents");
      });

      await test.step("FilesCreate", async () => {
        await myDocuments.filesArticle.createFiles();
        await myDocuments.filesTable.hideModifiedColumn();
        await screenshot.expectHaveScreenshot("files_create_created_files");
      });

      await test.step("Search Documents", async () => {
        await myDocuments.filesFilter.fillFilesSearchInputAndCheckRequest(
          "Document",
        );
        await screenshot.expectHaveScreenshot("search_docx_file");
        await myDocuments.filesFilter.clearSearchText();
      });

      await test.step("Render Trash", async () => {
        await trash.open();
        await trash.trashEmptyView.checkNoDocsTextExist();
        await screenshot.expectHaveScreenshot("render_trash");
      });

      await test.step("Delete file from Trash", async () => {
        await myDocuments.open();
        await myDocuments.deleteAllDocs();
        await trash.open();
        await screenshot.expectHaveScreenshot("delete_file_from_trash");
      });

      await test.step("Restore file from Trash", async () => {
        await trash.openRestoreSelector();
        await trash.trashSelector.select("documents");
        await trash.trashSelector.restore();
        await trash.trashEmptyView.checkNoDocsTextExist();
        await screenshot.expectHaveScreenshot("restore_empty_view");
      });

      await test.step("Delete Forever file from Trash", async () => {
        await myDocuments.open();
        await myDocuments.deleteAllDocs();
        await trash.open();
        await trash.deleteForever();
        await trash.trashEmptyView.checkNoDocsTextExist();
        await screenshot.expectHaveScreenshot("delete_forever_file_from_trash");
      });

      await test.step("Create backup", async () => {
        await myDocuments.open();
        await myDocuments.filesArticle.createFiles();
        await backup.open();
        await backup.selectBackupMethod(mapBackupMethodsIds.backupRoom);
        await backup.openRoomSelector();
        await backup.selectDocuments();
        await backup.locators.createCopyButton.click();
        await backup.removeToast(toastMessages.backCopyCreated, 40000);
      })

      await test.step("Payments", async () => {
        await payments.open();
        await screenshot.expectHaveScreenshot("payment_free_plan");
        const page1Promise = page.waitForEvent("popup");
        await payments.approveButton.click();
        const page1 = await page1Promise;
        await page1.waitForURL("https://checkout.stripe.com/c/pay/*");
        await page1.close();
      })
    });
});

