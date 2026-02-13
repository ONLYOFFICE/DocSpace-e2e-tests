import { test } from "@/src/fixtures";
import { ShortTour } from "@/src/objects/rooms/ShortTourModal";
import MyRooms from "@/src/objects/rooms/Rooms";
import { expect } from "@playwright/test";
import RoomEmptyView from "@/src/objects/rooms/RoomEmptyView";
import RoomSelectPanel from "@/src/objects/rooms/RoomSelectPanel";
import Login from "@/src/objects/common/Login";
import { uploadAndVerifyPDF } from "@/src/utils/helpers/formFillingRoom";
import TemplateGallery from "@/src/objects/rooms/TemplateGallery";

test.describe("FormFilling Template Gallery tests", () => {
  let myRooms: MyRooms;
  let shortTour: ShortTour;
  let roomEmptyView: RoomEmptyView;
  let selectPanel: RoomSelectPanel;
  let login: Login;

  test.beforeEach(async ({ page, api }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    shortTour = new ShortTour(page);
    roomEmptyView = new RoomEmptyView(page);
    selectPanel = new RoomSelectPanel(page);
    login = new Login(page, api.portalDomain);
    await login.loginToPortal();
    await myRooms.createFormFillingRoom("FormFillingRoom");
  });

  // Verifies that searching for a non-existing template displays the empty screen
  // and that the clear filter button resets the search
  test("Template Gallery search with no results shows empty screen", async ({
    page,
  }) => {
    await test.step("Skip tour and close info panel", async () => {
      await shortTour.clickSkipTour();
      await myRooms.infoPanel.close();
    });

    await test.step("Open Template Gallery from plus menu", async () => {
      await myRooms.filesNavigation.openCreateDropdown();
      await myRooms.filesNavigation.contextMenu.openRoomTemplateGallery();
    });

    await test.step("Search for non-existing template", async () => {
      const templateGallery = new TemplateGallery(page);
      await expect(templateGallery.searchInput).toBeVisible({
        timeout: 20000,
      });
      await templateGallery.search("zzznonexistent12345");
    });

    await test.step("Verify empty screen and clear filter button", async () => {
      const templateGallery = new TemplateGallery(page);
      await expect(templateGallery.emptyScreenContainer).toBeVisible();
      await expect(templateGallery.clearFilterButton).toBeVisible();
    });

    await test.step("Click clear filter and verify templates are visible", async () => {
      const templateGallery = new TemplateGallery(page);
      await templateGallery.clearFilterButton.click();
      await expect(templateGallery.emptyScreenContainer).toBeHidden();
      await expect(templateGallery.searchInput).toHaveValue("");
    });
  });

  // Verifies that the Template Gallery can be closed by clicking outside
  // and by pressing the Escape key
  test("Template Gallery closes on click outside and Escape", async ({
    page,
  }) => {
    await test.step("Skip tour and close info panel", async () => {
      await shortTour.clickSkipTour();
      await myRooms.infoPanel.close();
    });

    await test.step("Open Template Gallery", async () => {
      await myRooms.filesNavigation.openCreateDropdown();
      await myRooms.filesNavigation.contextMenu.openRoomTemplateGallery();
    });

    await test.step("Verify gallery is open", async () => {
      const templateGallery = new TemplateGallery(page);
      await expect(templateGallery.searchInput).toBeVisible({
        timeout: 20000,
      });
    });

    await test.step("Click outside to close gallery", async () => {
      await page.mouse.click(0, 0);
      const templateGallery = new TemplateGallery(page);
      await expect(templateGallery.searchInput).toBeHidden();
    });

    await test.step("Reopen Template Gallery", async () => {
      await myRooms.filesNavigation.openCreateDropdown();
      await myRooms.filesNavigation.contextMenu.openRoomTemplateGallery();
      const templateGallery = new TemplateGallery(page);
      await expect(templateGallery.searchInput).toBeVisible({
        timeout: 20000,
      });
    });

    await test.step("Press Escape to close gallery", async () => {
      await page.keyboard.press("Escape");
      const templateGallery = new TemplateGallery(page);
      await expect(templateGallery.searchInput).toBeHidden();
    });
  });

  // Verifies that switching the language combobox updates the displayed templates:
  // English template disappears after switching to German, reappears after switching back
  test("Template Gallery language switch updates template list", async ({
    page,
  }) => {
    const englishTemplate = "30-day eviction notice form";

    await test.step("Skip tour and close info panel", async () => {
      await shortTour.clickSkipTour();
      await myRooms.infoPanel.close();
    });

    await test.step("Open Template Gallery from plus menu", async () => {
      await myRooms.filesNavigation.openCreateDropdown();
      await myRooms.filesNavigation.contextMenu.openRoomTemplateGallery();
    });

    await test.step("Verify English template is visible", async () => {
      const templateGallery = new TemplateGallery(page);
      await expect(
        templateGallery.getTemplateByTitle(englishTemplate),
      ).toBeVisible({ timeout: 30000 });
    });

    await test.step("Switch language to German", async () => {
      const templateGallery = new TemplateGallery(page);
      await templateGallery.selectLanguage("de");
    });

    await test.step("Verify English template is no longer visible", async () => {
      const templateGallery = new TemplateGallery(page);
      await expect(
        templateGallery.getTemplateByTitle(englishTemplate),
      ).toBeHidden();
    });

    await test.step("Switch back to English", async () => {
      const templateGallery = new TemplateGallery(page);
      await templateGallery.selectLanguage("en-us");
    });

    await test.step("Verify English template is visible again", async () => {
      const templateGallery = new TemplateGallery(page);
      await expect(
        templateGallery.getTemplateByTitle(englishTemplate),
      ).toBeVisible();
    });
  });

  // Verifies that searching for an existing template by name returns the correct result
  test("Template Gallery search finds template by name", async ({ page }) => {
    await test.step("Skip tour and close info panel", async () => {
      await shortTour.clickSkipTour();
      await myRooms.infoPanel.close();
    });

    await test.step("Open Template Gallery from plus menu", async () => {
      await myRooms.filesNavigation.openCreateDropdown();
      await myRooms.filesNavigation.contextMenu.openRoomTemplateGallery();
    });

    await test.step("Search for Doctor's note form", async () => {
      const templateGallery = new TemplateGallery(page);
      await expect(templateGallery.searchInput).toBeVisible({
        timeout: 20000,
      });
      await templateGallery.search("Doctor's note form");
    });

    await test.step("Verify template is found", async () => {
      const templateGallery = new TemplateGallery(page);
      await expect(
        templateGallery.getTemplateByTitle("Doctor's note form"),
      ).toBeVisible({ timeout: 30000 });
    });
  });

  // Verifies the full flow of submitting a PDF form to the Template Gallery:
  // upload PDF, open gallery, submit form, select file, and confirm submission
  test("Submit PDF form to Template Gallery", async ({ page }) => {
    await test.step("Upload PDF form from MyDocuments", async () => {
      await uploadAndVerifyPDF(
        shortTour,
        roomEmptyView,
        selectPanel,
        myRooms,
        page,
      );
    });

    await test.step("Open Template Gallery from plus menu", async () => {
      await myRooms.filesNavigation.openCreateDropdown();
      await myRooms.filesNavigation.contextMenu.openRoomTemplateGallery();
    });

    await test.step("Click Submit to Template Gallery", async () => {
      const templateGallery = new TemplateGallery(page);
      await expect(templateGallery.submitToTemplateGalleryButton).toBeVisible({
        timeout: 20000,
      });
      await templateGallery.submitToTemplateGalleryButton.click();
    });

    await test.step("Verify Submit modal and select file", async () => {
      const templateGallery = new TemplateGallery(page);
      await templateGallery.verifySubmitModalVisible();
      await templateGallery.clickSelectTemplate();
    });

    await test.step("Select uploaded PDF and confirm", async () => {
      await selectPanel.selectItemByText("ONLYOFFICE Resume Sample");
      await selectPanel.confirmSelection();
    });

    await test.step("Click Submit apply", async () => {
      const templateGallery = new TemplateGallery(page);
      await templateGallery.clickSubmitApply();
    });

    await test.step("Verify form-submit page opens", async () => {
      await page.waitForURL(/form-submit/, { timeout: 30000 });
      expect(page.url()).toContain("form-submit");
    });
  });
});
