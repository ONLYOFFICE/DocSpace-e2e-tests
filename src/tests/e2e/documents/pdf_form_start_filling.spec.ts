import { Page } from "@playwright/test";
import MyDocuments from "@/src/objects/files/MyDocuments";
import FilesPdfForm from "@/src/objects/files/FilesPdfForm";
import FilesTable from "@/src/objects/files/FilesTable";
import BaseSelector from "@/src/objects/common/BaseSelector";
import { ShortTour } from "@/src/objects/rooms/ShortTourModal";
import { test } from "@/src/fixtures";

test.describe("My Documents: PDF form start filling", () => {
  let myDocuments: MyDocuments;

  test.beforeEach(async ({ page, api, login }) => {
    myDocuments = new MyDocuments(page, api.portalDomain);
    await login.loginToPortal();
    await myDocuments.open();
  });

  test("Start filling blank PDF form opens room selector", async () => {
    let editorPage: Page;
    let pdfForm: FilesPdfForm;
    let selector: BaseSelector;

    await test.step("Create blank PDF form and open editor", async () => {
      const editor = await myDocuments.createPdfFormAndOpenEditor("PDF Form");
      await editor.waitForLoad();
      editorPage = editor.editorPage;
      pdfForm = new FilesPdfForm(editorPage);
      selector = new BaseSelector(editorPage);
    });

    await test.step("Click Start filling in editor", async () => {
      await pdfForm.clickStartFillButton();
    });

    await test.step("Click Share in room button on the panel", async () => {
      await pdfForm.clickShareInRoomButton();
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

    await test.step("Close room tour modal", async () => {
      const shortTour = new ShortTour(editorPage);
      await shortTour.clickSkipTour();
    });

    await test.step("Verify form is in room with filling icon", async () => {
      const filesTable = new FilesTable(editorPage);
      await filesTable.expectFillingIconVisible("PDF Form");
    });
  });
});
