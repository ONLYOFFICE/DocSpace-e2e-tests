import MyDocuments from "@/src/objects/files/MyDocuments";
import Favorites from "@/src/objects/files/Favorites";
import { test } from "@/src/fixtures";

const documentName = "Document";
const spreadsheetName = "Spreadsheet";
const presentationName = "Presentation";
const pdfFormName = "Blank";
const folderName = "Folder";

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
  });

  test("Mark all documents as favorites", async () => {
    await test.step("Mark all documents", async () => {
      await myDocuments.addToFavorites(documentName);
      await myDocuments.addToFavorites(spreadsheetName);
      await myDocuments.addToFavorites(presentationName);
      await myDocuments.addToFavorites(pdfFormName);
      await myDocuments.addToFavorites(folderName);
    });

    await test.step("Open Favorites and verify", async () => {
      await favorites.openFromNavigation();
      await favorites.filesTable.checkRowExist(documentName);
      await favorites.filesTable.checkRowExist(spreadsheetName);
      await favorites.filesTable.checkRowExist(presentationName);
      await favorites.filesTable.checkRowExist(pdfFormName);
      await favorites.filesTable.checkRowExist(folderName);
    });
  });
});
