import Files from "@/src/objects/files/Files";
import FillOptionsPanel from "@/src/objects/files/FillOptionsPanel";
import FilesPdfForm from "@/src/objects/files/FilesPdfForm";
import BaseSelector from "@/src/objects/common/BaseSelector";
import FilesTable from "@/src/objects/files/FilesTable";
import PdfFormModal from "@/src/objects/rooms/PdfFormModal";
import AppsSidebar from "@/src/objects/common/AppsSidebar";
import { pdfFormContextMenuOption } from "@/src/utils/constants/files";
import { apps } from "@/src/utils/constants/navigation";
import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";

test.describe("My Documents: PDF form fill options panel", () => {
  let files: Files;

  test.beforeEach(async ({ page, api, login }) => {
    files = new Files(page, api.portalDomain);
    await login.loginToPortal();
    await files.open();
    await files.filesNavigation.uploadFiles("data/rooms/PDF from device.pdf");
    await files.filesTable.checkRowExist("PDF from device");
  });

  test("Owner sees all fill options when clicking Fill on a PDF form", async ({
    page,
  }) => {
    await test.step("Open context menu and click Fill", async () => {
      await files.filesTable.openContextMenuForItem("PDF from device");
      await files.filesTable.contextMenu.clickOption(
        pdfFormContextMenuOption.fill,
      );
    });

    await test.step("Verify fill options panel shows all three options", async () => {
      const fillOptionsPanel = new FillOptionsPanel(page);
      await fillOptionsPanel.verifyAllOptionsVisible();
    });
  });

  test("Owner can fill a PDF form using Fill yourself option", async ({
    page,
  }) => {
    await test.step("Open context menu and click Fill", async () => {
      await files.filesTable.openContextMenuForItem("PDF from device");
      await files.filesTable.contextMenu.clickOption(
        pdfFormContextMenuOption.fill,
      );
    });

    await test.step("Click Fill yourself and verify editor opens in fill mode", async () => {
      const fillOptionsPanel = new FillOptionsPanel(page);
      const [pdfPage] = await Promise.all([
        page.context().waitForEvent("page", { timeout: 30000 }),
        fillOptionsPanel.clickFillYourself(),
      ]);
      await pdfPage.waitForLoadState("load");
      await pdfPage.waitForSelector('iframe[name="frameEditor"]', {
        state: "attached",
        timeout: 60000,
      });
      const pdfForm = new FilesPdfForm(pdfPage);
      await expect(pdfForm.formPrevButton).toBeVisible({ timeout: 60000 });
      await expect(pdfForm.formNextButton).toBeVisible();
      await pdfPage.close();
    });
  });

  test.fail(
    "Owner can start Form data collection from a PDF form [Bug 83063]",
    async ({ page }) => {
      const selector = new BaseSelector(page);

      await test.step("Open context menu and click Fill", async () => {
        await files.filesTable.openContextMenuForItem("PDF from device");
        await files.filesTable.contextMenu.clickOption(
          pdfFormContextMenuOption.fill,
        );
      });

      await test.step("Click Form data collection on the panel", async () => {
        const fillOptionsPanel = new FillOptionsPanel(page);
        await fillOptionsPanel.clickDataCollection();
      });

      await test.step("Verify room selector opens and create new room", async () => {
        await selector.checkSelectorAddButtonExist();
        await selector.createNewItem();
        await selector.fillNewItemName("Form Filling Room");
        await selector.acceptCreate();
      });

      await test.step("Select created room from the list and submit", async () => {
        await selector.selectItemByText("Form Filling Room");
        await selector.submitSelection();
      });

      await test.step("Verify Forms section is active in the sidebar", async () => {
        const sidebar = new AppsSidebar(page);
        await sidebar.checkItemActive(apps.forms);
      });

      await test.step("Close public link dialog for the created form", async () => {
        const pdfFormModal = new PdfFormModal(page);
        await pdfFormModal.waitForVisible();
        await pdfFormModal.close();
      });

      await test.step("Verify form is in room with filling icon", async () => {
        const filesTable = new FilesTable(page);
        await filesTable.expectFillingIconVisible("PDF from device");
      });
    },
  );

  test("Owner can start Recipient role-based filling from a PDF form", async ({
    page,
  }) => {
    const selector = new BaseSelector(page);

    await test.step("Open context menu and click Fill", async () => {
      await files.filesTable.openContextMenuForItem("PDF from device");
      await files.filesTable.contextMenu.clickOption(
        pdfFormContextMenuOption.fill,
      );
    });

    await test.step("Click Recipient role-based filling on the panel", async () => {
      const fillOptionsPanel = new FillOptionsPanel(page);
      await fillOptionsPanel.clickRoleBasedFilling();
    });

    await test.step("Verify room selector opens and create new VDR room", async () => {
      await selector.checkSelectorAddButtonExist();
      await selector.createNewItem();
      await selector.fillNewItemName("VDR Room");
      await selector.acceptCreate();
    });

    await test.step("Select created room from the list and submit", async () => {
      await selector.selectItemByText("VDR Room");
      await selector.submitSelection();
    });

    await test.step("Verify role assignment modal appears and close it", async () => {
      // No data-testid on Assign button yet - check by role/name
      await expect(page.getByRole("button", { name: "Assign" })).toBeVisible();
      await page.keyboard.press("Escape");
    });

    await test.step("Verify form is visible in the room", async () => {
      const filesTable = new FilesTable(page);
      await filesTable.checkRowExist("PDF from device");
    });

    await test.step("Verify form has draft badge", async () => {
      const filesTable = new FilesTable(page);
      await filesTable.expectDraftBadgeVisible("PDF from device");
    });
  });
});
