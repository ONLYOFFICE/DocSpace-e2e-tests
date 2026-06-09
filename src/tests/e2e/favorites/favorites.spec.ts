import MyDocuments from "@/src/objects/files/MyDocuments";
import Favorites from "@/src/objects/files/Favorites";
import { test } from "@/src/fixtures";

const documentName = "Document";
const spreadsheetName = "Spreadsheet";
const presentationName = "Presentation";
const pdfFormName = "Blank";
const folderName = "Folder";
const pdfDocumentName = "pdf-document";
const imageName = "image";
const archiveName = "archive";
const diagramName = "diagram";

test.describe("Favorites", () => {
  let myDocuments: MyDocuments;
  let favorites: Favorites;

  test.beforeEach(async ({ page, api, login }) => {
    myDocuments = new MyDocuments(page, api.portalDomain);
    favorites = new Favorites(page, api.portalDomain);

    await login.loginToPortal();
    await myDocuments.open();
    await myDocuments.deleteAllDocs();
    await myDocuments.filesArticle.createFiles();
    await myDocuments.filesNavigation.uploadFiles([
      "data/filter/pdf-document.pdf",
      "data/filter/image.png",
      "data/filter/archive.zip",
      "data/filter/diagram.vsdx",
    ]);
  });

  test("Add to favorites", async () => {
    await test.step("Mark all documents as favorites", async () => {
      await myDocuments.addToFavorites(documentName);
      await myDocuments.addToFavorites(spreadsheetName);
      await myDocuments.addToFavorites(presentationName);
      await myDocuments.addToFavorites(pdfFormName);
      await myDocuments.addToFavorites(folderName);
    });

    await test.step("Open Favorites", async () => {
      await favorites.openFromNavigation();
    });

    await test.step("Verify favorite documents exist", async () => {
      await favorites.filesTable.checkRowExist(documentName);
      await favorites.filesTable.checkRowExist(spreadsheetName);
      await favorites.filesTable.checkRowExist(presentationName);
      await favorites.filesTable.checkRowExist(pdfFormName);
      await favorites.filesTable.checkRowExist(folderName);
    });
  });

  test("Remove from favorites", async ({}) => {
    await test.step("Mark all documents as favorites", async () => {
      await myDocuments.addToFavorites(documentName);
      await myDocuments.addToFavorites(spreadsheetName);
      await myDocuments.addToFavorites(presentationName);
      await myDocuments.addToFavorites(pdfFormName);
      await myDocuments.addToFavorites(folderName);
    });

    await test.step("Remove from Favorites", async () => {
      await favorites.openFromNavigation();
      await favorites.removeFromFavorites(documentName);
      await favorites.filesTable.checkRowNotExist(documentName);
    });

    await test.step("Verify remaining favorites", async () => {
      await favorites.filesTable.checkRowExist(spreadsheetName);
      await favorites.filesTable.checkRowExist(presentationName);
      await favorites.filesTable.checkRowExist(pdfFormName);
      await favorites.filesTable.checkRowExist(folderName);
    });
  });

  test("Search in favorites", async () => {
    await test.step("Mark all documents", async () => {
      await myDocuments.addToFavorites(documentName);
      await myDocuments.addToFavorites(spreadsheetName);
      await myDocuments.addToFavorites(presentationName);
      await myDocuments.addToFavorites(pdfFormName);
      await myDocuments.addToFavorites(folderName);
    });

    await test.step("Open Favorites", async () => {
      await favorites.openFromNavigation();
    });

    await test.step("Search favorites by name", async () => {
      await favorites.searchFavorites(spreadsheetName);
      await favorites.filesTable.checkRowExist(spreadsheetName);
      await favorites.filesTable.checkRowNotExist(documentName);
    });

    await test.step("Clear favorite search", async () => {
      await favorites.clearSearch();
    });
  });

  test("Filter favorites by type", async () => {
    await test.step("Mark all documents as favorites", async () => {
      await myDocuments.addToFavorites(documentName);
      await myDocuments.addToFavorites(spreadsheetName);
      await myDocuments.addToFavorites(presentationName);
      await myDocuments.addToFavorites(pdfFormName);
      await myDocuments.addToFavorites(folderName);
      await myDocuments.addToFavorites(pdfDocumentName);
      await myDocuments.addToFavorites(imageName);
      await myDocuments.addToFavorites(archiveName);
      await myDocuments.addToFavorites(diagramName);
    });

    await favorites.openFromNavigation();
    await favorites.filesTable.checkRowExist(spreadsheetName);

    await test.step("Filter by documents", async () => {
      await favorites.filesFilter.openFilterDialog();
      await favorites.filesFilter.selectFilterByDocuments();
      await favorites.filesFilter.applyFilterNoWait();
      await favorites.filesTable.checkRowExist(documentName);
      await favorites.filesTable.checkRowNotExist(spreadsheetName);
    });

    await test.step("Filter by spreadsheets", async () => {
      await favorites.filesFilter.openFilterDialog();
      await favorites.filesFilter.selectFilterBySpreadsheets();
      await favorites.filesFilter.applyFilterNoWait();
      await favorites.filesTable.checkRowExist(spreadsheetName);
      await favorites.filesTable.checkRowNotExist(documentName);
    });

    await test.step("Filter by presentations", async () => {
      await favorites.filesFilter.openFilterDialog();
      await favorites.filesFilter.selectFilterByPresentations();
      await favorites.filesFilter.applyFilterNoWait();
      await favorites.filesTable.checkRowExist(presentationName);
      await favorites.filesTable.checkRowNotExist(spreadsheetName);
    });

    await test.step("Filter by PDF forms", async () => {
      await favorites.filesFilter.openFilterDialog();
      await favorites.filesFilter.selectFilterByPdfForms();
      await favorites.filesFilter.applyFilterNoWait();
      await favorites.filesTable.checkRowExist(pdfFormName);
      await favorites.filesTable.checkRowNotExist(documentName);
    });

    await test.step("Filter by folders", async () => {
      await favorites.filesFilter.openFilterDialog();
      await favorites.filesFilter.selectFilterByFolders();
      await favorites.filesFilter.applyFilterNoWait();
      await favorites.filesTable.checkRowExist(folderName);
      await favorites.filesTable.checkRowNotExist(presentationName);
    });

    await test.step("Filter by files", async () => {
      await favorites.filesFilter.openFilterDialog();
      await favorites.filesFilter.selectFilterByFiles();
      await favorites.filesFilter.applyFilterNoWait();
      await favorites.filesTable.checkRowExist(documentName);
      await favorites.filesTable.checkRowNotExist(folderName);
    });

    await test.step("Filter by diagrams", async () => {
      await favorites.filesFilter.openFilterDialog();
      await favorites.filesFilter.selectFilterByDiagrams();
      await favorites.filesFilter.applyFilterNoWait();
      await favorites.filesTable.checkRowExist(diagramName);
      await favorites.filesTable.checkRowNotExist(documentName);
    });

    await test.step("Filter by PDF documents", async () => {
      await favorites.filesFilter.openFilterDialog();
      await favorites.filesFilter.selectFilterByPdfDocuments();
      await favorites.filesFilter.applyFilterNoWait();
      await favorites.filesTable.checkRowExist(pdfDocumentName);
      await favorites.filesTable.checkRowNotExist(documentName);
    });

    await test.step("Filter by archives", async () => {
      await favorites.filesFilter.openFilterDialog();
      await favorites.filesFilter.selectFilterByArchives();
      await favorites.filesFilter.applyFilterNoWait();
      await favorites.filesTable.checkRowExist(archiveName);
      await favorites.filesTable.checkRowNotExist(documentName);
    });

    await test.step("Filter by images", async () => {
      await favorites.filesFilter.openFilterDialog();
      await favorites.filesFilter.selectFilterByImages();
      await favorites.filesFilter.applyFilterNoWait();
      await favorites.filesTable.checkRowExist(imageName);
      await favorites.filesTable.checkRowNotExist(documentName);
    });

    await test.step("Filter by media (empty result)", async () => {
      await favorites.filesFilter.openFilterDialog();
      await favorites.filesFilter.selectFilterByMedia();
      await favorites.filesFilter.applyFilterNoWait();
      await favorites.filesFilter.checkFilesEmptyViewExist();
      await favorites.filesFilter.clearFilterFromEmptyView();
    });
  });
});
