import { test, expect } from "@playwright/test";
import { PortalSetupApi } from "../../../api_library/portal_setup";
import { RoomsListPage } from "../../../page_objects/room_list_page";
import { PortalLoginPage } from "../../../page_objects/portal_login_page";

test.describe("Create Files in Rooms Tests", () => {
  let portalSetup;
  let roomsListPage;
  let portalLoginPage;
  let apiContext;

  test.setTimeout(120000);

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext();
    portalSetup = new PortalSetupApi(apiContext);
    await portalSetup.setupPortal();
  });

  test.beforeEach(async ({ page }) => {
    roomsListPage = new RoomsListPage(page);
    portalLoginPage = new PortalLoginPage(page);
    await portalLoginPage.loginToPortal(portalSetup.portalDomain);
  });

  test.afterAll(async () => {
    await portalSetup.deletePortal();
    await apiContext.dispose();
  });

  async function testFileOperations(page, context) {
    // Create document, spreadsheet and presentation
    await roomsListPage.CreateDocumentFiles();
    await page.waitForTimeout(1000);
    await roomsListPage.CreateSpreadsheet();
    await page.waitForTimeout(1000);
    await roomsListPage.CreatePresentation();
    await page.waitForTimeout(1000);

    // Switch to first tab before creating folder
    const pages = context.pages();
    await pages[0].bringToFront();
    await page.waitForTimeout(1000);

    // Create and open folder
    await roomsListPage.CreateFolder();
    await page.waitForTimeout(1000);
    const newFolderLink = page.getByRole("link", { name: "New folder" });
    await newFolderLink.click();
    await page.waitForTimeout(1000);

    // Create files inside folder
    await roomsListPage.CreateDocumentFiles();
    await page.waitForTimeout(1000);
    await roomsListPage.CreateSpreadsheet();
    await page.waitForTimeout(1000);
    await roomsListPage.CreatePresentation();
    await page.waitForTimeout(1000);

    // Switch back to first tab
    await pages[0].bringToFront();
    await page.waitForTimeout(1000);

    // Create another folder
    await roomsListPage.CreateFolder();
    await page.waitForTimeout(1000);
  }

  test("Create files in Custom Room", async ({ page, context }) => {
    await test.step("Create Custom Room and test files", async () => {
      await roomsListPage.CreateCustomroom();
      await page.waitForTimeout(500);
      await testFileOperations(page, context);
    });
  });

  test("Create files in Collaboration Room", async ({ page, context }) => {
    await test.step("Create Collaboration Room and test files", async () => {
      await roomsListPage.CreateCollaborationroom();
      await page.waitForTimeout(500);
      await testFileOperations(page, context);
    });
  });

  test("Create files in Public Room", async ({ page, context }) => {
    await test.step("Create Public Room and test files", async () => {
      await roomsListPage.CreatePublicRoom();
      await page.waitForTimeout(500);
      await testFileOperations(page, context);
    });
  });

  test("Create files in Virtual Data Room", async ({ page, context }) => {
    await test.step("Create Virtual Data Room and test files", async () => {
      await roomsListPage.CreateVDRroom();
      await page.waitForTimeout(500);
      await testFileOperations(page, context);
    });
  });
});
