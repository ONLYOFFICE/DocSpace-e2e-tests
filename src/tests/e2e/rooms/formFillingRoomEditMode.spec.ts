import { test } from "@/src/fixtures";
import { ShortTour } from "@/src/objects/rooms/ShortTourModal";
import MyRooms from "@/src/objects/rooms/Rooms";
import FilesPdfForm from "@/src/objects/files/FilesPdfForm";
import RoomPDFCompleted from "@/src/objects/rooms/RoomPDFCompleted";
import { BrowserContext, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import FilesTable from "@/src/objects/files/FilesTable";
import RoomEmptyView from "@/src/objects/rooms/RoomEmptyView";
import RoomSelectPanel from "@/src/objects/rooms/RoomSelectPanel";
import Login from "@/src/objects/common/Login";
import {
  setupClipboardPermissions,
  setupIncognitoContext,
  cleanupIncognitoContext,
  getLinkFromClipboard,
  ensureIncognitoPage,
} from "@/src/utils/helpers/linkTest";
import { uploadAndVerifyPDF } from "@/src/utils/helpers/formFillingRoom";
import { formFillingRoomPdfContextMenuOption } from "@/src/utils/constants/files";
import PauseSubmissionsDialog from "@/src/objects/files/PauseSubmissionsDialog";
import FolderDeleteModal from "@/src/objects/files/FolderDeleteModal";

test.describe("FormFilling room - Edit mode", () => {
  let myRooms: MyRooms;
  let shortTour: ShortTour;
  let roomEmptyView: RoomEmptyView;
  let filesTable: FilesTable;
  let selectPanel: RoomSelectPanel;
  let incognitoContext: BrowserContext | null = null;
  let incognitoPage: Page | null = null;
  let login: Login;

  test.beforeEach(async ({ page, api }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    shortTour = new ShortTour(page);
    roomEmptyView = new RoomEmptyView(page);
    filesTable = new FilesTable(page);
    selectPanel = new RoomSelectPanel(page);
    login = new Login(page, api.portalDomain);
    await login.loginToPortal();
    await myRooms.createFormFillingRoom("FormFillingRoom");
  });

  test.afterEach(async () => {
    await cleanupIncognitoContext(incognitoContext, incognitoPage);
  });

  test.describe("Form filling started", () => {
    test("Form becomes unavailable when owner switches to edit mode during active fill", async ({
      page,
      browser,
    }) => {
      let publicLink: string;

      await test.step("Upload PDF form from My Documents", async () => {
        await uploadAndVerifyPDF(
          shortTour,
          roomEmptyView,
          selectPanel,
          myRooms,
          page,
        );
      });

      await test.step("Start filling and copy public link", async () => {
        await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
        await filesTable.contextMenu.clickOption(
          formFillingRoomPdfContextMenuOption.startFilling,
        );
        await setupClipboardPermissions(page);
        await shortTour.clickCopyPublicLink();
        await myRooms.toast.dismissToastSafely(
          "Link copied to clipboard",
          5000,
        );
        publicLink = await getLinkFromClipboard(page);
        if (!publicLink)
          throw new Error("Failed to get public link from clipboard");
        await shortTour.clickModalCloseButton().catch(() => {});
      });

      await test.step("Verify fill icon on file", async () => {
        await filesTable.expectFillingIconVisible("ONLYOFFICE Resume Sample");
      });

      await test.step("Open fill link in incognito and verify submit button visible", async () => {
        const result = await setupIncognitoContext(browser);
        incognitoContext = result.context;
        incognitoPage = result.page;
        await incognitoPage.goto(publicLink, { waitUntil: "domcontentloaded" });
        const pdfForm = new FilesPdfForm(incognitoPage);
        await pdfForm.checkSubmitButtonExist();
      });

      await test.step("Owner switches form to edit mode", async () => {
        const pagePromise = page
          .context()
          .waitForEvent("page", { timeout: 30000 });
        await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
        await filesTable.contextMenu.clickOption(
          formFillingRoomPdfContextMenuOption.edit,
        );
        const pauseDialog = new PauseSubmissionsDialog(page);
        await pauseDialog.clickEdit();
        const editorPage = await pagePromise;
        await editorPage.waitForLoadState("load");
        await editorPage.close();
        await page.bringToFront();
      });

      await test.step("Verify filling icon is gone after switching to edit mode", async () => {
        await myRooms.filesTable.expectFillingIconNotVisible(
          "ONLYOFFICE Resume Sample",
        );
      });

      await test.step("User submits the form while owner has switched to edit mode", async () => {
        ensureIncognitoPage(incognitoPage);
        const pdfForm = new FilesPdfForm(incognitoPage!);
        // form submits successfully even after owner switched to edit mode,
        // but lands on a simpler completion page ("The form is completed")
        await pdfForm.submitButton.click();
        await incognitoPage!.waitForURL(/.*completed-form.*/);
        const completedForm = new RoomPDFCompleted(incognitoPage!);
        await completedForm.waitForSimpleCompletionPage();
        await completedForm.checkBackToRoomButtonHidden();
        await completedForm.checkFillItOutAgainButtonHidden();
      });

      await test.step("Owner opens Complete folder and verifies submission was recorded", async () => {
        await page.reload({ waitUntil: "load" });
        await filesTable.openContextMenuForItem("Complete");
        await filesTable.contextMenu.clickOption("Open");
        await expect(
          page.getByRole("heading", { name: "Complete" }),
        ).toBeVisible();
        await expect(
          page.getByText("ONLYOFFICE Resume Sample", { exact: true }),
        ).toBeVisible({ timeout: 15000 });
      });
    });

    test("Fill link is not fillable after owner switches to edit mode", async ({
      page,
      browser,
    }) => {
      let publicLink: string;

      await test.step("Upload PDF form from My Documents", async () => {
        await uploadAndVerifyPDF(
          shortTour,
          roomEmptyView,
          selectPanel,
          myRooms,
          page,
        );
      });

      await test.step("Start filling and copy public link", async () => {
        await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
        await filesTable.contextMenu.clickOption(
          formFillingRoomPdfContextMenuOption.startFilling,
        );
        await setupClipboardPermissions(page);
        await shortTour.clickCopyPublicLink();
        await myRooms.toast.dismissToastSafely(
          "Link copied to clipboard",
          5000,
        );
        publicLink = await getLinkFromClipboard(page);
        if (!publicLink)
          throw new Error("Failed to get public link from clipboard");
        await shortTour.clickModalCloseButton().catch(() => {});
      });

      await test.step("Owner switches form to edit mode", async () => {
        const pagePromise = page
          .context()
          .waitForEvent("page", { timeout: 30000 });
        await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
        await filesTable.contextMenu.clickOption(
          formFillingRoomPdfContextMenuOption.edit,
        );
        const pauseDialog = new PauseSubmissionsDialog(page);
        await pauseDialog.clickEdit();
        const editorPage = await pagePromise;
        await editorPage.waitForLoadState("load");
        await editorPage.close();
        await page.bringToFront();
      });

      await test.step("Open fill link after stop filling and verify form is not submittable", async () => {
        const { context, page: incognitoPage } =
          await setupIncognitoContext(browser);
        await incognitoPage.goto(publicLink, { waitUntil: "domcontentloaded" });
        const pdfForm = new FilesPdfForm(incognitoPage);
        await pdfForm.checkSubmitButtonNotVisible();
        await cleanupIncognitoContext(context, incognitoPage);
      });
    });
  });

  test("Fill it again link shows Access Denied when original form has been deleted", async ({
    page,
  }) => {
    let formPage: Page;

    await test.step("Upload PDF form and start filling", async () => {
      await uploadAndVerifyPDF(
        shortTour,
        roomEmptyView,
        selectPanel,
        myRooms,
        page,
      );
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.startFilling,
      );
      await shortTour.clickModalCloseButton();
    });

    await test.step("Open form in editor", async () => {
      const pagePromise = page
        .context()
        .waitForEvent("page", { timeout: 30000 });
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.fill,
      );
      formPage = await pagePromise;
      await formPage.waitForLoadState("load");
    });

    await test.step("Delete the original PDF form while the editor is open", async () => {
      await page.bringToFront();
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.delete,
      );
      const deleteModal = new FolderDeleteModal(page);
      await deleteModal.clickDeleteFolder();
      await myRooms.toast.checkToastMessage(
        "ONLYOFFICE Resume Sample.pdf successfully moved to Trash",
      );
    });

    await test.step("Submit draft from editor - form completes successfully", async () => {
      const pdfForm = new FilesPdfForm(formPage);
      await pdfForm.clickSubmitButton();
    });

    await test.step("Click Fill it again and verify Access Denied in editor", async () => {
      const completedForm = new RoomPDFCompleted(formPage);
      await Promise.all([
        formPage.waitForURL(/.*doceditor.*/, { timeout: 30000 }),
        completedForm.chooseFillItOutAgain(),
      ]);
      await formPage.waitForLoadState("load");
      const iframeLocator = formPage.locator('iframe[name="frameEditor"]');
      await iframeLocator.waitFor({ state: "visible" });
      const frame = iframeLocator.contentFrame();
      await expect(frame.getByText("Access denied Click to close")).toBeVisible(
        { timeout: 30000 },
      );
    });
  });
});
