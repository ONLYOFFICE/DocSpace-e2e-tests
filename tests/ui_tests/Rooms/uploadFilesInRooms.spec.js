import { test } from "@playwright/test";
import { PortalSetupApi } from "../../../api_library/portal_setup";
import { RoomsListPage } from "../../../page_objects/Rooms/roomListPage";
import { PortalLoginPage } from "../../../page_objects/portal_login_page";

test.describe("Upload Files in Rooms Tests", () => {
  let portalSetup;
  let roomsListPage;
  let portalLoginPage;
  let apiContext;

  test.setTimeout(120000);

  test.beforeAll(async () => {
    apiContext = await test.request.newContext();
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

  async function testFileUploads(page) {
    // Upload different types of files
    await roomsListPage.UploadFile("pdf", { title: "Test PDF" });
    await page.waitForTimeout(1000);
    await roomsListPage.UploadFile("docx", { title: "Test Word Document" });
    await page.waitForTimeout(1000);
    await roomsListPage.UploadFile("xlsx", { title: "Test Excel Spreadsheet" });
    await page.waitForTimeout(1000);
    await roomsListPage.UploadFile("pptx", { title: "Test PowerPoint" });
    await page.waitForTimeout(1000);
  }

  test("Upload files in Custom Room", async ({ page }) => {
    await test.step("Create Custom Room and upload files", async () => {
      await roomsListPage.CreateCustomroom();
      await page.waitForTimeout(500);
      await testFileUploads(page);
    });
  });

  test("Upload files in Collaboration Room", async ({ page }) => {
    await test.step("Create Collaboration Room and upload files", async () => {
      await roomsListPage.CreateCollaborationroom();
      await page.waitForTimeout(500);
      await testFileUploads(page);
    });
  });

  test("Upload files in Public Room", async ({ page }) => {
    await test.step("Create Public Room and upload files", async () => {
      await roomsListPage.CreatePublicRoom();
      await page.waitForTimeout(500);
      await testFileUploads(page);
    });
  });

  test("Upload files in Virtual Data Room", async ({ page }) => {
    await test.step("Create Virtual Data Room and upload files", async () => {
      await roomsListPage.CreateVDRroom();
      await page.waitForTimeout(500);
      await testFileUploads(page);
    });
  });
});
