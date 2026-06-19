import SharedWithMe from "@/src/objects/files/SharedWithMe";
import MyDocuments from "@/src/objects/files/MyDocuments";
import FilesTable from "@/src/objects/files/FilesTable";
import FolderDeleteModal from "@/src/objects/files/FolderDeleteModal";
import FilesSelectPanel from "@/src/objects/files/FilesSelectPanel";
import DownloadDialog from "@/src/objects/files/DownloadDialog";
import Login from "@/src/objects/common/Login";
import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import {
  documentContextMenuOption,
  documentDownloadSubmenu,
  sharedWithMeTableColumns,
  sharedWithMeDefaultColumns,
  sharedWithMeOptionalColumns,
} from "@/src/utils/constants/files";

test.describe("Shared with me", () => {
  test("Empty view is shown when nothing is shared", async ({
    page,
    api,
    login,
  }) => {
    await login.loginToPortal();
    const sharedWithMe = new SharedWithMe(page, api.portalDomain);

    await test.step("Open Shared with me", async () => {
      await sharedWithMe.open();
    });

    await test.step("Check empty view", async () => {
      await sharedWithMe.checkEmptyViewVisible();
    });
  });

  test("Shared file appears in Shared with me for invited user", async ({
    page,
    api,
    apiSdk,
  }) => {
    const fileName = "SharedDocument";
    let fileId: number;
    let userEmail: string;
    let userPassword: string;

    await test.step("Create file in My Documents via API", async () => {
      const fileResponse = await apiSdk.files.createFileInMyDocuments("owner", {
        title: fileName,
      });
      const fileBody = await fileResponse.json();
      fileId = fileBody.response.id;
    });

    await test.step("Create user and share file with them", async () => {
      const { userData, response } = await apiSdk.profiles.addMember(
        "owner",
        "User",
      );
      userEmail = userData.email;
      userPassword = userData.password;

      const userBody = await response.json();
      const userId = userBody.response.id;

      await apiSdk.files.shareFile("owner", fileId, {
        share: [{ shareTo: userId, access: 2 }],
        notify: false,
      });
    });

    await test.step("Login as user and check Shared with me", async () => {
      const userLogin = new Login(page, api.portalDomain);
      await userLogin.loginWithCredentials(userEmail, userPassword);

      const sharedWithMe = new SharedWithMe(page, api.portalDomain);
      await sharedWithMe.open();

      const filesTable = new FilesTable(page);
      await filesTable.checkRowExist(fileName);
    });
  });

  test.describe("File actions in Shared with me", () => {
    const fileName = "SharedDocument";
    const spreadsheetFileName = "spreadsheet";
    const presentationFileName = "presentation";
    const pdfDocumentFileName = "pdf-document";
    const pdfFormFileName = "pdf-form";
    const imageName = "image";
    const archiveName = "archive";
    const diagramName = "diagram";
    const sharedFolderName = "SharedFolder";
    let sharedWithMe: SharedWithMe;

    test.beforeEach(async ({ page, api, apiSdk }) => {
      const { userData, response } = await apiSdk.profiles.addMember(
        "owner",
        "User",
      );
      const userBody = await response.json();
      const userId = userBody.response.id;
      const share = [{ shareTo: userId, access: 2 }];

      const docBody = await (
        await apiSdk.files.createFileInMyDocuments("owner", { title: fileName })
      ).json();
      await apiSdk.files.shareFile("owner", docBody.response.id, {
        share,
        notify: false,
      });

      for (const filePath of [
        "data/filter/spreadsheet.csv",
        "data/filter/presentation.odp",
        "data/filter/pdf-document.pdf",
        "data/filter/pdf-form.pdf",
        "data/filter/image.png",
        "data/filter/archive.zip",
        "data/filter/diagram.vsdx",
      ]) {
        const file = await apiSdk.files.uploadToMyDocuments("owner", filePath);
        await apiSdk.files.shareFile("owner", file.id, {
          share,
          notify: false,
        });
      }

      const myDocsId = await apiSdk.folders.getMyDocumentsFolderId("owner");
      const folderBody = await (
        await apiSdk.folders.createFolder("owner", myDocsId, {
          title: sharedFolderName,
        })
      ).json();
      const folderId = folderBody.response.id;
      await apiSdk.files.createFile("owner", folderId, {
        title: "FolderDocument",
      });
      await apiSdk.files.shareFolder("owner", folderId, {
        share,
        notify: false,
      });

      const userLogin = new Login(page, api.portalDomain);
      await userLogin.loginWithCredentials(userData.email, userData.password);

      sharedWithMe = new SharedWithMe(page, api.portalDomain);
      await sharedWithMe.open();
      await sharedWithMe.filesTable.checkRowExist(fileName);
    });

    test.describe("File operations", () => {
      test("Context menu for Read only file shows correct options", async () => {
        await test.step("Verify New badge is visible on unread shared file", async () => {
          await sharedWithMe.filesTable.expectNewBadgeVisible(fileName);
        });

        await test.step("Open context menu for shared file", async () => {
          await sharedWithMe.filesTable.openContextMenuForItem(fileName, true);
        });

        await test.step("Verify edit, rename, move and delete are not available", async () => {
          const menu = sharedWithMe.filesTable.contextMenu;
          await expect(
            menu.getItemLocator(documentContextMenuOption.edit),
          ).not.toBeVisible();
          await expect(
            menu.getItemLocator(documentContextMenuOption.rename),
          ).not.toBeVisible();
          await expect(
            menu.getItemLocator(documentContextMenuOption.moveOrCopy),
          ).not.toBeVisible();
          await expect(
            menu.getItemLocator(documentContextMenuOption.delete),
          ).not.toBeVisible();
        });

        await test.step("Verify preview, download, copy, mark as favorite, more options and remove from shared are available", async () => {
          const menu = sharedWithMe.filesTable.contextMenu;
          await expect(
            menu.getItemLocator(documentContextMenuOption.preview),
          ).toBeVisible();
          await expect(
            menu.getItemLocator(documentContextMenuOption.download),
          ).toBeVisible();
          await expect(
            menu.getItemLocator(documentContextMenuOption.copy),
          ).toBeVisible();
          await expect(
            menu.getItemLocator(documentContextMenuOption.markAsFavorite),
          ).toBeVisible();
          await expect(
            menu.getItemLocator(documentContextMenuOption.markAsRead),
          ).toBeVisible();
          await expect(
            menu.getItemLocator(documentContextMenuOption.moreOptions),
          ).toBeVisible();
          await expect(
            menu.getItemLocator(documentContextMenuOption.removeFromShared),
          ).toBeVisible();
        });

        await test.step("Verify Download submenu contains original format and download as", async () => {
          const menu = sharedWithMe.filesTable.contextMenu;
          await menu.hoverOption(documentContextMenuOption.download);
          await expect(
            menu.submenu.locator(
              `[data-testid="${documentDownloadSubmenu.originalFormat.value}"]`,
            ),
          ).toBeVisible();
          await expect(
            menu.submenu.locator(
              `[data-testid="${documentDownloadSubmenu.downloadAs.value}"]`,
            ),
          ).toBeVisible();
        });

        await test.step("Verify More options submenu contains version history and file info", async () => {
          const menu = sharedWithMe.filesTable.contextMenu;
          await menu.hoverOption(documentContextMenuOption.moreOptions);
          await expect(
            menu.submenu.locator('[data-testid="option_show-version-history"]'),
          ).toBeVisible();
          await expect(menu.submenu.locator("#option_show-info")).toBeVisible();
        });

        await test.step("Close context menu", async () => {
          await sharedWithMe.filesTable.contextMenu.close();
        });
      });

      test("Mark as read removes New badge", async () => {
        await test.step("Verify New badge is visible before marking as read", async () => {
          await sharedWithMe.filesTable.expectNewBadgeVisible(fileName);
        });

        await test.step("Click Mark as read in context menu", async () => {
          await sharedWithMe.filesTable.openContextMenuForItem(fileName, true);
          await sharedWithMe.filesTable.contextMenu.clickOption(
            documentContextMenuOption.markAsRead,
          );
        });

        await test.step("Verify New badge is no longer visible", async () => {
          await sharedWithMe.filesTable.expectNewBadgeNotVisible(fileName);
        });
      });

      test("Remove file from Shared with me", async ({ page }) => {
        await test.step("Remove file via context menu", async () => {
          await sharedWithMe.filesTable.openContextMenuForItem(fileName, true);
          await sharedWithMe.filesTable.contextMenu.clickOption(
            documentContextMenuOption.removeFromShared,
          );
          const confirmModal = new FolderDeleteModal(page);
          await confirmModal.clickDeleteFolder();
          await sharedWithMe.filesTable.checkRowNotExist(fileName);
        });
      });

      test("Download file from Shared with me", async () => {
        const download = await sharedWithMe.waitForDownload(async () => {
          await sharedWithMe.filesTable.openContextMenuForItem(fileName, true);
          await sharedWithMe.filesTable.contextMenu.clickSubmenuOption(
            documentContextMenuOption.download,
            "Original format",
          );
        });

        expect(download.suggestedFilename().toLowerCase()).toContain(".docx");
        await download.delete();
      });

      test("Download shared file in different format", async ({ page }) => {
        await test.step("Open Download as dialog", async () => {
          await sharedWithMe.filesTable.openContextMenuForItem(fileName, true);
          await sharedWithMe.filesTable.contextMenu.clickSubmenuOption(
            documentContextMenuOption.download,
            "Download as",
          );
        });

        await test.step("Select PDF format and download", async () => {
          const downloadDialog = new DownloadDialog(page);
          await downloadDialog.expectOpen();
          await downloadDialog.selectFormat(".pdf");

          const download = await sharedWithMe.waitForDownload(async () => {
            await downloadDialog.submitDownload();
          });

          expect(download.suggestedFilename().toLowerCase()).toContain(".pdf");
          await download.delete();
          await downloadDialog.close();
        });
      });

      test("Copy shared file to My Documents", async ({ page, api }) => {
        await test.step("Open Copy option for shared file", async () => {
          await sharedWithMe.filesTable.openContextMenuForItem(fileName, true);
          await sharedWithMe.filesTable.contextMenu.clickOption(
            documentContextMenuOption.copy,
          );
        });

        await test.step("Select My Documents as destination", async () => {
          const filesSelectPanel = new FilesSelectPanel(page);
          await filesSelectPanel.checkFileSelectPanelExist();
          await filesSelectPanel.gotoDocSpaceRoot();
          await filesSelectPanel.select("documents");
          await filesSelectPanel.confirmSelection();
        });

        await test.step("Verify file is copied and still visible in Shared with me", async () => {
          await sharedWithMe.dismissToastSafely(
            `${fileName}.docx successfully copied to My documents`,
          );
          await sharedWithMe.filesTable.checkRowExist(fileName);
        });

        await test.step("Verify file appears in My Documents", async () => {
          const myDocuments = new MyDocuments(page, api.portalDomain);
          await myDocuments.open();
          await myDocuments.filesTable.checkRowExist(fileName);
        });
      });

      test("Info panel shows shared file properties", async () => {
        await test.step("Open info panel for shared file", async () => {
          await sharedWithMe.filesTable.selectRow(fileName);
          await sharedWithMe.infoPanel.open();
        });

        await test.step("Verify History tab is visible and clickable", async () => {
          await sharedWithMe.infoPanel.openTab("History");
        });

        await test.step("Verify Details tab is visible and clickable", async () => {
          await sharedWithMe.infoPanel.openTab("Details");
        });
      });
    });

    test("Table settings button shows all column options", async () => {
      await test.step("Open table settings", async () => {
        await sharedWithMe.filesTable.openSettings();
      });

      await test.step("Verify all column options are present", async () => {
        for (const columnText of Object.values(sharedWithMeTableColumns)) {
          await sharedWithMe.filesTable.expectSettingsOptionVisible(columnText);
        }
      });

      await test.step("Verify default columns are checked", async () => {
        for (const columnText of sharedWithMeDefaultColumns) {
          await sharedWithMe.filesTable.expectSettingsOptionChecked(columnText);
        }
      });

      await test.step("Verify optional columns are unchecked by default", async () => {
        for (const columnText of sharedWithMeOptionalColumns) {
          await sharedWithMe.filesTable.expectSettingsOptionUnchecked(
            columnText,
          );
        }
      });

      await test.step("Enable optional columns", async () => {
        for (const columnText of sharedWithMeOptionalColumns) {
          await sharedWithMe.filesTable.enableColumnInSettings(columnText);
        }
      });

      await test.step("Close table settings", async () => {
        await sharedWithMe.filesTable.closeSettingsPortal();
      });

      await test.step("Verify all columns are visible in table header", async () => {
        for (const columnText of Object.values(sharedWithMeTableColumns)) {
          await sharedWithMe.filesTable.expectColumnHeaderVisible(columnText);
        }
      });

      await test.step("Open settings to disable all columns", async () => {
        await sharedWithMe.filesTable.openSettings();
      });

      await test.step("Disable all columns", async () => {
        for (const columnText of Object.values(sharedWithMeTableColumns)) {
          await sharedWithMe.filesTable.disableColumnInSettings(columnText);
        }
      });

      await test.step("Close table settings", async () => {
        await sharedWithMe.filesTable.closeSettingsPortal();
      });

      await test.step("Verify all columns are hidden in table header", async () => {
        for (const columnText of Object.values(sharedWithMeTableColumns)) {
          await sharedWithMe.filesTable.expectColumnHeaderHidden(columnText);
        }
      });
    });

    test.describe("Folder operations", () => {
      test("Remove folder from Shared with me", async ({ page }) => {
        await test.step("Remove folder via context menu", async () => {
          await sharedWithMe.filesTable.openContextMenuForItem(
            sharedFolderName,
            true,
          );
          await sharedWithMe.filesTable.contextMenu.clickOption(
            documentContextMenuOption.removeFromShared,
          );
          const confirmModal = new FolderDeleteModal(page);
          await confirmModal.clickDeleteFolder();
          await sharedWithMe.filesTable.checkRowNotExist(sharedFolderName);
        });
      });

      test("Open shared folder and verify file inside is visible", async () => {
        await test.step("Open shared folder", async () => {
          await sharedWithMe.filesTable.openItem(sharedFolderName);
        });

        await test.step("Verify file inside folder is visible", async () => {
          await sharedWithMe.filesTable.checkRowExist("FolderDocument");
        });
      });

      test("Download shared folder as archive", async () => {
        const download = await sharedWithMe.waitForDownload(async () => {
          await sharedWithMe.filesTable.openContextMenuForItem(
            sharedFolderName,
            true,
          );
          await sharedWithMe.filesTable.contextMenu.clickOption("Download");
        });

        expect(download.suggestedFilename().toLowerCase()).toContain(".zip");
        await download.delete();
      });
    });

    test("Filter Shared with me files by type", async () => {
      await test.step("Filter by documents", async () => {
        await sharedWithMe.filesFilter.openFilterDialog();
        await sharedWithMe.filesFilter.selectFilterByDocuments();
        await sharedWithMe.filesFilter.applyFilterNoWait();
        await sharedWithMe.filesTable.checkRowExist(fileName);
        await sharedWithMe.filesTable.checkRowNotExist(spreadsheetFileName);
      });

      await test.step("Filter by files", async () => {
        await sharedWithMe.filesFilter.openFilterDialog();
        await sharedWithMe.filesFilter.selectFilterByFiles();
        await sharedWithMe.filesFilter.applyFilterNoWait();
        await sharedWithMe.filesTable.checkRowExist(spreadsheetFileName);
        await sharedWithMe.filesTable.checkRowNotExist(sharedFolderName);
      });

      await test.step("Filter by folders", async () => {
        await sharedWithMe.filesFilter.openFilterDialog();
        await sharedWithMe.filesFilter.selectFilterByFolders();
        await sharedWithMe.filesFilter.applyFilterNoWait();
        await sharedWithMe.filesTable.checkRowExist(sharedFolderName);
        await sharedWithMe.filesTable.checkRowNotExist(fileName);
      });

      await test.step("Filter by spreadsheets", async () => {
        await sharedWithMe.filesFilter.openFilterDialog();
        await sharedWithMe.filesFilter.selectFilterBySpreadsheets();
        await sharedWithMe.filesFilter.applyFilterNoWait();
        await sharedWithMe.filesTable.checkRowExist(spreadsheetFileName);
        await sharedWithMe.filesTable.checkRowNotExist(fileName);
      });

      await test.step("Filter by presentations", async () => {
        await sharedWithMe.filesFilter.openFilterDialog();
        await sharedWithMe.filesFilter.selectFilterByPresentations();
        await sharedWithMe.filesFilter.applyFilterNoWait();
        await sharedWithMe.filesTable.checkRowExist(presentationFileName);
        await sharedWithMe.filesTable.checkRowNotExist(fileName);
      });

      await test.step("Filter by diagrams", async () => {
        await sharedWithMe.filesFilter.openFilterDialog();
        await sharedWithMe.filesFilter.selectFilterByDiagrams();
        await sharedWithMe.filesFilter.applyFilterNoWait();
        await sharedWithMe.filesTable.checkRowExist(diagramName);
        await sharedWithMe.filesTable.checkRowNotExist(fileName);
      });

      await test.step("Filter by archives", async () => {
        await sharedWithMe.filesFilter.openFilterDialog();
        await sharedWithMe.filesFilter.selectFilterByArchives();
        await sharedWithMe.filesFilter.applyFilterNoWait();
        await sharedWithMe.filesTable.checkRowExist(archiveName);
        await sharedWithMe.filesTable.checkRowNotExist(fileName);
      });

      await test.step("Filter by images", async () => {
        await sharedWithMe.filesFilter.openFilterDialog();
        await sharedWithMe.filesFilter.selectFilterByImages();
        await sharedWithMe.filesFilter.applyFilterNoWait();
        await sharedWithMe.filesTable.checkRowExist(imageName);
        await sharedWithMe.filesTable.checkRowNotExist(fileName);
      });

      await test.step("Filter by media (empty result)", async () => {
        await sharedWithMe.filesFilter.openFilterDialog();
        await sharedWithMe.filesFilter.selectFilterByMedia();
        await sharedWithMe.filesFilter.applyFilterNoWait();
        await sharedWithMe.filesFilter.checkFilesEmptyViewExist();
        await sharedWithMe.filesFilter.clearFilterFromEmptyView();
      });
    });

    test("Filter dialog does not show Author and Shared by person selectors for regular user", async () => {
      await test.step("Open filter dialog", async () => {
        await sharedWithMe.filesFilter.openFilterDialog();
      });

      await test.step("Verify Author and Shared by person selectors are not shown", async () => {
        await sharedWithMe.filesFilter.expectPersonSelectorsNotVisible();
      });
    });

    test.fail("Filter by PDF forms and PDF documents [Bug 81919]", async () => {
      await test.step("Filter by PDF forms", async () => {
        await sharedWithMe.filesFilter.openFilterDialog();
        await sharedWithMe.filesFilter.selectFilterByPdfForms();
        await sharedWithMe.filesFilter.applyFilterNoWait();
        await sharedWithMe.filesTable.checkRowExist(pdfFormFileName);
        await sharedWithMe.filesTable.checkRowNotExist(fileName);
      });

      await test.step("Filter by PDF documents", async () => {
        await sharedWithMe.filesFilter.openFilterDialog();
        await sharedWithMe.filesFilter.selectFilterByPdfDocuments();
        await sharedWithMe.filesFilter.applyFilterNoWait();
        await sharedWithMe.filesTable.checkRowExist(pdfDocumentFileName);
        await sharedWithMe.filesTable.checkRowNotExist(fileName);
      });
    });
  });
});
