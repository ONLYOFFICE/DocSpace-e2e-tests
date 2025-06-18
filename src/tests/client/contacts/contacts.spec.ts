import { test, Page } from "@playwright/test";

import API from "@/src/api";
import Login from "@/src/objects/common/Login";
import Screenshot from "@/src/objects/common/Screenshot";
import Contacts from "@/src/objects/contacts/Contacts";
import { ADMIN_OWNER_NAME } from "@/src/utils/constants/contacts";

test.describe("Contacts", () => {
  let api: API;
  let page: Page;

  let login: Login;
  let screenshot: Screenshot;
  let contacts: Contacts;

  test.beforeAll(async ({ playwright, browser }) => {
    const apiContext = await playwright.request.newContext();
    api = new API(apiContext);
    await api.setup();
    console.log(api.portalDomain);

    page = await browser.newPage();

    await page.addInitScript(() => {
      globalThis.localStorage?.setItem("integrationUITests", "true");
    });

    login = new Login(page, api.portalDomain);
    contacts = new Contacts(page, api.portalDomain);
    screenshot = new Screenshot(page, "contacts");
    await login.loginToPortal();
    await contacts.open();
  });

  test.beforeEach(async ({}, testInfo) => {
    await screenshot.setCurrentTestInfo(testInfo);
  });

  test("Render", async () => {
    await contacts.table.checkRowExist(ADMIN_OWNER_NAME);
    await screenshot.expectHaveScreenshot("view_members");

    await contacts.openTab("Groups");
    await contacts.checkEmptyGroupsExist();
    await screenshot.expectHaveScreenshot("view_groups");

    await contacts.openTab("Guests");
    await contacts.checkEmptyGuestsExist();
    await screenshot.expectHaveScreenshot("view_guests");
  });

  test("RenderActionsMenu", async () => {
    await contacts.openTab("Members");
    await contacts.openSubmenu("article");
    await screenshot.expectHaveScreenshot("article_actions_menu");
    await contacts.closeMenu();

    await contacts.openSubmenu("header");
    await screenshot.expectHaveScreenshot("header_actions_menu");

    await contacts.openSubmenu("table");
    await screenshot.expectHaveScreenshot("table_actions_menu");
  });

  test("InfoPanel", async () => {
    await contacts.infoPanel.open();
    await contacts.table.selectRow(ADMIN_OWNER_NAME);
    await contacts.infoPanel.hideRegistrationDate();
    await screenshot.expectHaveScreenshot("info_panel_user_owner");
    await contacts.infoPanel.close();
  });

  test.afterAll(async () => {
    await api.cleanup();
  });
});
