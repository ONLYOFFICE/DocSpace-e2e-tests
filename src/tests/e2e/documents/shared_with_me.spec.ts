import SharedWithMe from "@/src/objects/files/SharedWithMe";
import FilesTable from "@/src/objects/files/FilesTable";
import FolderDeleteModal from "@/src/objects/files/FolderDeleteModal";
import Login from "@/src/objects/common/Login";
import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import { documentContextMenuOption } from "@/src/utils/constants/files";

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
      await apiSdk.files.shareFolder("owner", folderBody.response.id, {
        share,
        notify: false,
      });

      const userLogin = new Login(page, api.portalDomain);
      await userLogin.loginWithCredentials(userData.email, userData.password);

      sharedWithMe = new SharedWithMe(page, api.portalDomain);
      await sharedWithMe.open();
      await sharedWithMe.filesTable.checkRowExist(fileName);
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

    test("Info panel shows shared file properties", async () => {
      await test.step("Open info panel for shared file", async () => {
        await sharedWithMe.filesTable.selectRow(fileName);
        await sharedWithMe.infoPanel.open();
      });

      await test.step("Verify info panel is visible", async () => {
        await sharedWithMe.infoPanel.checkInfoPanelExist();
      });
    });
  });
});
