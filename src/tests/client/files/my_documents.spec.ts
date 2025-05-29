import { test, expect } from "@playwright/test";

import API from "../../../api";
import Login from "../../../objects/Login";
import MyDocuments from "../../../objects/MyDocuments";
import Table from "../../../objects/Table";
import AdFrame from "../../../objects/AdFrame";
import EmptyView from "../../../objects/EmpyView";

test.describe("Files: My documents", () => {
  let api: API;
  let login: Login;
  let myDocuments: MyDocuments;
  let table: Table;
  let adFrame: AdFrame;
  let emptyView: EmptyView;

  test.beforeAll(async ({ playwright }) => {
    const apiContext = await playwright.request.newContext();

    api = new API(apiContext);

    await api.setup();
  });

  test.beforeEach(async ({ page }) => {
    console.log(api.portalDomain);
    login = new Login(page, api.portalDomain);
    myDocuments = new MyDocuments(page, api.portalDomain);
    table = new Table(page);
    adFrame = new AdFrame(page);
    emptyView = new EmptyView(page);

    await login.loginToPortal();
    await myDocuments.open();
    await table.hideModified();
    await adFrame.closeIframe();
  });

  test("Render", async ({ page }) => {
    await expect(page).toHaveScreenshot([
      "client",
      "files",
      "my_documents_render.png",
    ]);
  });

  test("EmptyScreen", async ({ page }) => {
    await table.deleteAllRows();
    await emptyView.checkNoDocsTextExist();
    await emptyView.checkAllDocActionModalsExist();
    await page.getByText("Recently accessible via link").click();
    await emptyView.checkNoFilesTextExist();

    await expect(page).toHaveScreenshot([
      "client",
      "files",
      "my_documents_empty_screen_no_files.png",
    ]);

    await emptyView.clickGotoDocumentsButton();
    await emptyView.checkNoDocsTextExist();

    await expect(page).toHaveScreenshot([
      "client",
      "files",
      "my_documents_empty_screen_no_docs.png",
    ]);
  });

  test.afterAll(async () => {
    await api.cleanup();
  });
});
