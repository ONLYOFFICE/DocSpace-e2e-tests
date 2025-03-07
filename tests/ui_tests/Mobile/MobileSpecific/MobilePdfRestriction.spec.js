import { test, expect } from "@playwright/test";
import { PortalSetupApi } from "../../../../api_library/portal_setup";
import { ArchivePage } from "../../../../page_objects/Rooms/archivePage";
import { RoomsListPage } from "../../../../page_objects/Rooms/roomListPage";
import { PortalLoginPage } from "../../../../page_objects/portal_login_page";

test.describe("Restriction on creating PDFs", () => {
  let apiContext;
  let portalSetup;
  let roomsListPage;
  let portalLoginPage;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext();
    portalSetup = new PortalSetupApi(apiContext);
    await portalSetup.setupPortal();
  });

  test.beforeEach(async ({ page }) => {
    portalLoginPage = new PortalLoginPage(page);
    await portalLoginPage.loginToPortal(portalSetup.portalDomain);
  });

  test.afterAll(async () => {
    await portalSetup.deletePortal();
    await apiContext.dispose();
  });

  test("Check message when create PDF", async ({ page }) => {
    roomsListPage = new RoomsListPage(page);
    await roomsListPage.CreatePublicRoom();
    await page.waitForTimeout(1000);
    //Create PDF Blank
    await roomsListPage.createFileButtonSelector.click();
    await roomsListPage.page
      .locator("text=PDF Form")
      .first()
      .waitFor({ state: "visible" });
    await roomsListPage.page.getByText("PDF Form").first().click();
    await roomsListPage.page.getByRole("option", { name: "Blank" }).click();
    const unsupportedActionMessage = roomsListPage.page.locator(
      "text=Unsupported action",
    );
    await expect(unsupportedActionMessage).toBeVisible();
    await unsupportedActionMessage.click();
    //Create PDF From text file
    await roomsListPage.createFileButtonSelector.click();
    await page.waitForTimeout(1000);
    await roomsListPage.page.getByText("PDF Form").first().click();
    await roomsListPage.page
      .getByRole("option", { name: "From text file" })
      .click();
    await expect(unsupportedActionMessage).toBeVisible();
    await unsupportedActionMessage.click();
    //Create PDF Form Gallery
    await roomsListPage.createFileButtonSelector.click();
    await page.waitForTimeout(1000);
    await roomsListPage.page.getByText("PDF Form").first().click();
    await roomsListPage.page
      .getByRole("option", { name: "Form Gallery" })
      .click();
    await expect(unsupportedActionMessage).toBeVisible();
    await unsupportedActionMessage.click();
    return true;
  });
});
