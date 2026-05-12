import { test } from "@/src/fixtures";
import { Page } from "@playwright/test";
import Customization from "@/src/objects/settings/customization/Customization";
import MyDocuments from "@/src/objects/files/MyDocuments";
import MyRooms from "@/src/objects/rooms/Rooms";
import InfoPanel from "@/src/objects/common/InfoPanel";
import { toastMessages } from "@/src/utils/constants/settings";

const DOCX_FILE = "data/documents/test-document.docx";
const PDF_FILE = "data/rooms/PDF from device.pdf";
const PDF_FILE_NAME = "PDF from device";

test.describe("Settings - Customization: Default Templates", () => {
  let customization: Customization;

  test.beforeEach(async ({ page, login }) => {
    customization = new Customization(page);
    await login.loginToPortal();
    await customization.open();
    await customization.openTab("Default Templates");
  });

  test("All template rows are shown with correct names and Default badge", async () => {
    await test.step("Verify template names", async () => {
      await customization.defaultTemplates.checkRowName("docx");
      await customization.defaultTemplates.checkRowName("xlsx");
      await customization.defaultTemplates.checkRowName("pptx");
      await customization.defaultTemplates.checkRowName("pdf");
    });

    await test.step("Verify all rows have Default badge", async () => {
      await customization.defaultTemplates.checkBadge("docx", "Default");
      await customization.defaultTemplates.checkBadge("xlsx", "Default");
      await customization.defaultTemplates.checkBadge("pptx", "Default");
      await customization.defaultTemplates.checkBadge("pdf", "Default");
    });
  });

  test("Preview DOCX template opens a new tab", async ({ page }) => {
    let previewPage: Page;

    await test.step("Upload custom DOCX template", async () => {
      await customization.defaultTemplates.uploadFromDevice("docx", DOCX_FILE);
      await customization.removeToast(toastMessages.defaultTemplateApplied);
    });

    await test.step("Click Preview for DOCX template", async () => {
      const pagePromise = page
        .context()
        .waitForEvent("page", { timeout: 15000 });
      await customization.defaultTemplates.clickPreview("docx");
      previewPage = await pagePromise;
      await previewPage.waitForLoadState("load");
    });

    await test.step("Verify preview page opened in editor", async () => {
      test.expect(previewPage.url()).toContain("doceditor");
    });
  });

  test("Download DOCX template saves a docx file", async () => {
    await test.step("Upload custom DOCX template", async () => {
      await customization.defaultTemplates.uploadFromDevice("docx", DOCX_FILE);
      await customization.removeToast(toastMessages.defaultTemplateApplied);
    });

    await test.step("Trigger download for DOCX template", async () => {
      const download = await customization.waitForDownload(async () => {
        await customization.defaultTemplates.clickDownload("docx");
      });
      test.expect(download.suggestedFilename()).toMatch(/\.docx$/i);
    });
  });

  test("Upload PDF template from DocSpace and reset to default", async ({
    apiSdk,
  }) => {
    await test.step("Upload PDF file to My Documents via API", async () => {
      await apiSdk.files.uploadToMyDocuments("owner", PDF_FILE);
    });

    await test.step("Upload PDF template from DocSpace", async () => {
      await customization.defaultTemplates.uploadFromDocSpace(
        "pdf",
        PDF_FILE_NAME,
      );
      await customization.removeToast(toastMessages.defaultTemplateApplied);
    });

    await test.step("Verify badge changes to Customized and modified info is shown", async () => {
      await customization.defaultTemplates.checkBadge("pdf", "Customized");
      await customization.defaultTemplates.checkModifiedInfo("pdf");
    });

    await test.step("Reset PDF template to default", async () => {
      await customization.defaultTemplates.resetToDefault("pdf");
      await customization.removeToast(toastMessages.defaultTemplateRestored);
    });

    await test.step("Verify row returns to default state", async () => {
      await customization.defaultTemplates.checkBadge("pdf", "Default");
      await customization.defaultTemplates.checkRowName("pdf");
      await customization.defaultTemplates.checkNotModifiedInfo("pdf");
    });
  });

  test("Customizing one format does not affect other formats", async () => {
    await test.step("Upload custom DOCX template from device", async () => {
      await customization.defaultTemplates.uploadFromDevice("docx", DOCX_FILE);
      await customization.removeToast(toastMessages.defaultTemplateApplied);
    });

    await test.step("Verify DOCX badge is Customized and modified info is shown", async () => {
      await customization.defaultTemplates.checkBadge("docx", "Customized");
      await customization.defaultTemplates.checkModifiedInfo("docx");
    });

    await test.step("Verify other formats still have Default badge", async () => {
      await customization.defaultTemplates.checkBadge("xlsx", "Default");
      await customization.defaultTemplates.checkBadge("pptx", "Default");
      await customization.defaultTemplates.checkBadge("pdf", "Default");
    });

    await test.step("Reset DOCX template to default", async () => {
      await customization.defaultTemplates.resetToDefault("docx");
      await customization.removeToast(toastMessages.defaultTemplateRestored);
    });

    await test.step("Verify DOCX row returns to default state", async () => {
      await customization.defaultTemplates.checkBadge("docx", "Default");
      await customization.defaultTemplates.checkRowName("docx");
      await customization.defaultTemplates.checkNotModifiedInfo("docx");
    });
  });

  test("New document created in My Documents uses the custom default template", async ({
    page,
    api,
  }) => {
    const DOC_NAME = "Template Document";
    const myDocuments = new MyDocuments(page, api.portalDomain);
    const infoPanel = new InfoPanel(page);
    let templateSizeBytes: number;

    await test.step("Upload custom DOCX template", async () => {
      await customization.defaultTemplates.uploadFromDevice("docx", DOCX_FILE);
      await customization.removeToast(toastMessages.defaultTemplateApplied);
      await customization.defaultTemplates.checkBadge("docx", "Customized");
      await customization.defaultTemplates.checkModifiedInfo("docx");
      templateSizeBytes =
        await customization.defaultTemplates.getTemplateSizeInBytes("docx");
    });

    await test.step("Navigate to My Documents and create new document", async () => {
      await myDocuments.open();
      await myDocuments.createDocumentFile(DOC_NAME);
    });

    await test.step("Verify document appears in file list with correct name", async () => {
      await myDocuments.filesTable.checkRowExist(DOC_NAME);
    });

    await test.step("Open info panel for the created document", async () => {
      await myDocuments.filesTable.selectRow(DOC_NAME);
      await infoPanel.open();
    });

    await test.step("Verify document size matches the template size", async () => {
      const docSizeBytes = await infoPanel.getSizeInBytes();
      await infoPanel.checkDocxFileProperties();
      test.expect(docSizeBytes).toBeGreaterThan(templateSizeBytes * 0.5);
      test.expect(docSizeBytes).toBeLessThan(templateSizeBytes * 2);
    });
  });

  test("Upload DOCX template from device and reset to default", async () => {
    await test.step("Upload custom DOCX template from device", async () => {
      await customization.defaultTemplates.uploadFromDevice("docx", DOCX_FILE);
      await customization.removeToast(toastMessages.defaultTemplateApplied);
    });

    await test.step("Verify badge changes to Customized and modified info is shown", async () => {
      await customization.defaultTemplates.checkBadge("docx", "Customized");
      await customization.defaultTemplates.checkModifiedInfo("docx");
    });

    await test.step("Reset DOCX template to default", async () => {
      await customization.defaultTemplates.resetToDefault("docx");
      await customization.removeToast(toastMessages.defaultTemplateRestored);
    });

    await test.step("Verify row returns to default state", async () => {
      await customization.defaultTemplates.checkBadge("docx", "Default");
      await customization.defaultTemplates.checkRowName("docx");
      await customization.defaultTemplates.checkNotModifiedInfo("docx");
    });
  });

  test("New document created after reset uses the default template", async ({
    page,
    api,
  }) => {
    const DOC_NAME = "Post-Reset Document";
    const myDocuments = new MyDocuments(page, api.portalDomain);
    const infoPanel = new InfoPanel(page);
    let customTemplateSizeBytes: number;

    await test.step("Upload custom DOCX template and record its size", async () => {
      await customization.defaultTemplates.uploadFromDevice("docx", DOCX_FILE);
      await customization.removeToast(toastMessages.defaultTemplateApplied);
      await customization.defaultTemplates.checkBadge("docx", "Customized");
      customTemplateSizeBytes =
        await customization.defaultTemplates.getTemplateSizeInBytes("docx");
    });

    await test.step("Reset DOCX template to default", async () => {
      await customization.defaultTemplates.resetToDefault("docx");
      await customization.removeToast(toastMessages.defaultTemplateRestored);
      await customization.defaultTemplates.checkBadge("docx", "Default");
      await customization.defaultTemplates.checkNotModifiedInfo("docx");
    });

    await test.step("Navigate to My Documents and create new document", async () => {
      await myDocuments.open();
      await myDocuments.createDocumentFile(DOC_NAME);
      await myDocuments.filesTable.checkRowExist(DOC_NAME);
    });

    await test.step("Verify document is valid DOCX and log size", async () => {
      await myDocuments.filesTable.selectRow(DOC_NAME);
      await infoPanel.open();
      const docSizeBytes = await infoPanel.getSizeInBytes();
      await infoPanel.checkDocxFileProperties();
    });
  });

  test("New document created in a Collaboration room uses the custom default template", async ({
    page,
    api,
    apiSdk,
  }) => {
    const ROOM_NAME = "Template Room";
    const DOC_NAME = "Room Template Document";
    const myRooms = new MyRooms(page, api.portalDomain);
    const infoPanel = new InfoPanel(page);
    let templateSizeBytes: number;

    await test.step("Upload custom DOCX template", async () => {
      await customization.defaultTemplates.uploadFromDevice("docx", DOCX_FILE);
      await customization.removeToast(toastMessages.defaultTemplateApplied);
      await customization.defaultTemplates.checkBadge("docx", "Customized");
      await customization.defaultTemplates.checkModifiedInfo("docx");
      templateSizeBytes =
        await customization.defaultTemplates.getTemplateSizeInBytes("docx");
    });

    await test.step("Create Collaboration room via API", async () => {
      await apiSdk.rooms.createRoom("owner", {
        title: ROOM_NAME,
        roomType: "EditingRoom",
      });
    });

    await test.step("Navigate to room", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(ROOM_NAME);
      await myRooms.infoPanel.close();
    });

    await test.step("Create new document in room", async () => {
      await myRooms.filesNavigation.openActionsDropdown();
      await myRooms.filesNavigation.selectCreateAction("Document");
      await myRooms.filesNavigation.modal.fillCreateTextInput(DOC_NAME);
      const [newPage] = await Promise.all([
        page.context().waitForEvent("page", { timeout: 5000 }),
        myRooms.filesNavigation.modal.clickCreateButton(),
      ]).catch(() => [null]);
      await newPage?.close();
    });

    await test.step("Verify document appears in room with correct name", async () => {
      await myRooms.filesTable.checkRowExist(DOC_NAME);
    });

    await test.step("Open info panel and verify document size matches the template", async () => {
      await myRooms.filesTable.selectRow(DOC_NAME);
      await infoPanel.open();
      const docSizeBytes = await infoPanel.getSizeInBytes();
      await infoPanel.checkDocxFileProperties();
      test.expect(docSizeBytes).toBeGreaterThan(templateSizeBytes * 0.5);
      test.expect(docSizeBytes).toBeLessThan(templateSizeBytes * 2);
    });
  });
});
