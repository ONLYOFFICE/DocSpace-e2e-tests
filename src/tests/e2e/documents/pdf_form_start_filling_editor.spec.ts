import { expect, Page } from "@playwright/test";
import MyDocuments from "@/src/objects/files/MyDocuments";
import FilesPdfForm from "@/src/objects/files/FilesPdfForm";
import EditorStartFillingPanel from "@/src/objects/files/EditorStartFillingPanel";
import FilesTable from "@/src/objects/files/FilesTable";
import BaseSelector from "@/src/objects/common/BaseSelector";
import BaseToast from "@/src/objects/common/BaseToast";
import { ShortTour } from "@/src/objects/rooms/ShortTourModal";
import {
  setupClipboardPermissions,
  getLinkFromClipboard,
} from "@/src/utils/helpers/linkTest";
import { test } from "@/src/fixtures";

test.describe("My Documents: PDF form start filling via editor", () => {
  let myDocuments: MyDocuments;

  test.beforeEach(async ({ page, api, login }) => {
    myDocuments = new MyDocuments(page, api.portalDomain);
    await login.loginToPortal();
    await myDocuments.open();
  });

  test("Owner sees all fill options when clicking Start filling on a blank PDF form", async () => {
    let editorPage: Page;
    let pdfForm: FilesPdfForm;

    await test.step("Create blank PDF form and open editor", async () => {
      const editor = await myDocuments.createPdfFormAndOpenEditor("PDF Form");
      await editor.waitForLoad();
      editorPage = editor.editorPage;
      pdfForm = new FilesPdfForm(editorPage);
    });

    await test.step("Click Start filling in editor", async () => {
      await pdfForm.clickStartFillButton();
    });

    await test.step("Verify start filling panel shows all options", async () => {
      const startFillingPanel = new EditorStartFillingPanel(editorPage);
      await startFillingPanel.verifyAllOptionsVisible();
    });
  });

  test("Owner can use Quick sharing to get a fill link for a blank PDF form", async ({
    page,
    browser,
  }) => {
    let editorPage: Page;
    let pdfForm: FilesPdfForm;
    let shareLink: string;

    await test.step("Create blank PDF form and open editor", async () => {
      const editor = await myDocuments.createPdfFormAndOpenEditor("PDF Form");
      await editor.waitForLoad();
      editorPage = editor.editorPage;
      pdfForm = new FilesPdfForm(editorPage);
    });

    await test.step("Click Start filling in editor", async () => {
      await pdfForm.clickStartFillButton();
    });

    await test.step("Click Quick sharing and read link from clipboard", async () => {
      await setupClipboardPermissions(page);
      const startFillingPanel = new EditorStartFillingPanel(editorPage);
      await startFillingPanel.clickQuickSharing();
      const toast = new BaseToast(editorPage);
      await toast.checkToastMessage("Link copied to clipboard");
      shareLink = await getLinkFromClipboard(editorPage);
    });

    await test.step("Verify link opens the fill viewer in incognito", async () => {
      const incognitoContext = await browser.newContext();
      const incognitoPage = await incognitoContext.newPage();
      await incognitoPage.goto(shareLink);
      await incognitoPage.waitForSelector('iframe[name="frameEditor"]', {
        state: "attached",
        timeout: 60000,
      });
      const pdfFormIncognito = new FilesPdfForm(incognitoPage);
      await pdfFormIncognito.verifyFillViewerVisible();
      await pdfFormIncognito.verifyFillViewerMenuItems();
      await incognitoContext.close();
    });

    await test.step("Verify Share tab in info panel shows fill link", async () => {
      await myDocuments.filesTable.selectFolderByName("PDF Form");
      await myDocuments.infoPanel.open();
      await myDocuments.infoPanel.openTab("Share");
      await myDocuments.infoPanel.checkSharedLinkCreated();
    });
  });

  test("Owner can share PDF form with DocSpace users from editor", async ({
    apiSdk,
  }) => {
    let editorPage: Page;
    let pdfForm: FilesPdfForm;
    let userName: string;

    await test.step("Create DocSpace user via API", async () => {
      const { userData } = await apiSdk.profiles.addMember("owner", "User");
      userName = `${userData.firstName} ${userData.lastName}`;
    });

    await test.step("Create blank PDF form and open editor", async () => {
      const editor = await myDocuments.createPdfFormAndOpenEditor("PDF Form");
      await editor.waitForLoad();
      editorPage = editor.editorPage;
      pdfForm = new FilesPdfForm(editorPage);
    });

    await test.step("Click Start filling in editor", async () => {
      await pdfForm.clickStartFillButton();
    });

    await test.step("Click Sharing with DocSpace users on the panel", async () => {
      const startFillingPanel = new EditorStartFillingPanel(editorPage);
      await startFillingPanel.clickShareWithUsers();
    });

    await test.step("Select user from contacts list and submit", async () => {
      const selector = new BaseSelector(editorPage);
      await selector.selectItemByTextGlobal(userName);
      await editorPage.getByTestId("selector_submit_button").click();
    });

    await test.step("Verify user is added in Share tab of info panel", async () => {
      await myDocuments.filesTable.selectFolderByName("PDF Form");
      await myDocuments.infoPanel.open();
      await myDocuments.infoPanel.openTab("Share");
      await myDocuments.infoPanel.checkUserHasAccess(userName);
    });
  });

  test("Owner can start Recipient role-based filling from editor", async () => {
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

    await test.step("Click Recipient role-based filling on the panel", async () => {
      const startFillingPanel = new EditorStartFillingPanel(editorPage);
      await startFillingPanel.clickRoleBasedFilling();
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
      await expect(editorPage.getByRole("button", { name: "Assign" })).toBeVisible();
      await editorPage.keyboard.press("Escape");
    });

    await test.step("Verify form has draft badge in the room", async () => {
      const filesTable = new FilesTable(editorPage);
      await filesTable.expectDraftBadgeVisible("PDF Form");
    });
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

    await test.step("Click Form data collections on the panel", async () => {
      const startFillingPanel = new EditorStartFillingPanel(editorPage);
      await startFillingPanel.clickFormDataCollections();
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
