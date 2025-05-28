import { test, expect } from "@playwright/test";

import API from "../../../api";
import Login from "../../../objects/Login";
import MyDocuments from "../../../objects/MyDocuments";
import Table from "../../../objects/Table";
import AdFrame from "../../../objects/AdFrame";

test.describe("Files: My documents", () => {
  let api: API;
  let login: Login;
  let myDocuments: MyDocuments;
  let table: Table;
  let adFrame: AdFrame;

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

  test.afterAll(async () => {
    await api.cleanup();
  });
});
