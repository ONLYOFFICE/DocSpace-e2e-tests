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
import InfoPanel from "@/src/objects/common/InfoPanel";
import {
  setupClipboardPermissions,
  setupIncognitoContext,
  cleanupIncognitoContext,
  getLinkFromClipboard,
  verifyLoginPageInIncognito,
  ensureIncognitoPage,
} from "@/src/utils/helpers/linkTest";
import {
  copyFileLink,
  uploadAndVerifyPDF,
} from "@/src/utils/helpers/formFillingRoom";
import { formFillingRoomPdfContextMenuOption } from "@/src/utils/constants/files";
import PauseSubmissionsDialog from "@/src/objects/files/PauseSubmissionsDialog";
import FolderDeleteModal from "@/src/objects/files/FolderDeleteModal";

test.describe("FormFilling room - Fill via link", () => {
  let myRooms: MyRooms;
  let shortTour: ShortTour;
  let roomEmptyView: RoomEmptyView;
  let filesTable: FilesTable;
  let selectPanel: RoomSelectPanel;
  let incognitoContext: BrowserContext | null = null;
  let incognitoPage: Page | null = null;
  let login: Login;
  let infoPanel: InfoPanel;

  test.beforeEach(async ({ page, api }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    shortTour = new ShortTour(page);
    roomEmptyView = new RoomEmptyView(page);
    filesTable = new FilesTable(page);
    selectPanel = new RoomSelectPanel(page);
    login = new Login(page, api.portalDomain);
    infoPanel = new InfoPanel(page);
    await login.loginToPortal();
    await myRooms.createFormFillingRoom("FormFillingRoom");
  });

  test.afterEach(async () => {
    await cleanupIncognitoContext(incognitoContext, incognitoPage);
  });

  test.describe("Form filling started", () => {
    // TODO: re-enable once fixed (Bug 80901 - anonymous user missing Download and Fill it out again buttons after form submission)
    test.skip("Filling PDF Form with link by anonymous", async ({
      page,
      browser,
    }) => {
      let incognitoPage: Page;

      await test.step("Upload PDF Form from My Documents", async () => {
        await uploadAndVerifyPDF(
          shortTour,
          roomEmptyView,
          selectPanel,
          myRooms,
          page,
        );
      });

      await test.step("Start filling the form and copy public link", async () => {
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
      });

      await test.step("Open PDF form in incognito", async () => {
        const url = await getLinkFromClipboard(page);
        if (!url) throw new Error("Clipboard is empty");
        const result = await setupIncognitoContext(browser);
        incognitoPage = result.page;
        await incognitoPage.goto(url, { waitUntil: "domcontentloaded" });
      });

      let completedForm: RoomPDFCompleted;
      await test.step("Submit not filled PDF Form", async () => {
        ensureIncognitoPage(incognitoPage);
        const pdfForm = new FilesPdfForm(incognitoPage);
        completedForm = await pdfForm.clickSubmitButton();
        await completedForm.checkDocumentTitleIsVisible(
          "1 - ONLYOFFICE Resume Sample",
        );
      });

      await test.step("Check back to room button is hidden", async () => {
        await completedForm.checkBackToRoomButtonHidden();
      });

      await test.step("Check download button is visible and clickable", async () => {
        ensureIncognitoPage(incognitoPage);
        await completedForm.checkDownloadButtonVisible();
      });

      await test.step("Click download button and verify download starts", async () => {
        ensureIncognitoPage(incognitoPage);
        const [download] = await Promise.all([
          incognitoPage.waitForEvent("download", { timeout: 30000 }),
          completedForm.clickDownloadButton(),
        ]);
        const fileName = await download.suggestedFilename();
        expect(fileName).toMatch(/ONLYOFFICE Resume Sample.*\.pdf$/i);
        // cancel download to avoid file saving
        await download.cancel();
      });
    });

    test("Copy shared link in modal window for PDF Form", async ({
      page,
      browser,
    }) => {
      let shareLink: string;

      await test.step("Upload PDF Form from My Documents", async () => {
        await shortTour.clickSkipTour();
        await roomEmptyView.uploadPdfFromDocSpace();
        await selectPanel.checkSelectorExist();
        await selectPanel.select("documents");
        await selectPanel.selectItemByText("ONLYOFFICE Resume Sample");
        await selectPanel.confirmSelection();
      });

      await test.step("Start filling the form", async () => {
        await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
        await filesTable.contextMenu.clickOption(
          formFillingRoomPdfContextMenuOption.startFilling,
        );
      });

      await test.step("Copy shared link in modal window", async () => {
        await setupClipboardPermissions(page);
        await shortTour.clickCopyPublicLink();
        await myRooms.toast.dismissToastSafely(
          "Link copied to clipboard",
          5000,
        );
        shareLink = await page.evaluate(() => navigator.clipboard.readText());
        if (!shareLink)
          throw new Error("Failed to get share link from clipboard");
      });

      await test.step("Verify fill icon on file", async () => {
        await shortTour.clickModalCloseButton().catch(() => {});
        await filesTable.expectFillingIconVisible("ONLYOFFICE Resume Sample");
      });

      await test.step("Open PDF form in incognito", async () => {
        const url = await page.evaluate(() => navigator.clipboard.readText());
        if (!url) throw new Error("Clipboard is empty");
        incognitoContext = await browser.newContext();
        incognitoPage = await incognitoContext.newPage();
        await incognitoPage.goto(url, { waitUntil: "domcontentloaded" });
      });

      await test.step("Verify room folders are not visible (isolation check)", async () => {
        ensureIncognitoPage(incognitoPage);
        const incognitoMyRooms = new MyRooms(
          incognitoPage!,
          login.portalDomain,
        );
        await incognitoMyRooms.verifyCompleteFolderNotVisible();
        await incognitoMyRooms.verifyInProcessFolderNotVisible();
      });

      await test.step("Check Submit button exist", async () => {
        ensureIncognitoPage(incognitoPage);
        const pdfForm = new FilesPdfForm(incognitoPage);
        await pdfForm.checkSubmitButtonExist();
      });
    });

    test("Authorized DocSpace user can fill PDF form via public link", async ({
      page,
      browser,
      apiSdk,
    }) => {
      let publicLink: string;
      let userEmail: string;
      let userPassword: string;
      let completedFileName: string;

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

      await test.step("Create DocSpace user via API", async () => {
        const { userData } = await apiSdk.profiles.addMember("owner", "User");
        userEmail = userData.email;
        userPassword = userData.password;
        completedFileName = `1 - ${userData.firstName} ${userData.lastName} - ONLYOFFICE Resume Sample`;
      });

      let userPage: Page;
      await test.step("Login as DocSpace user in separate context", async () => {
        const result = await setupIncognitoContext(browser);
        incognitoContext = result.context;
        userPage = result.page;
        const userLogin = new Login(userPage, login.portalDomain);
        await userLogin.loginWithCredentials(userEmail, userPassword);
      });

      await test.step("Open public fill link as DocSpace user", async () => {
        await userPage.goto(publicLink, { waitUntil: "domcontentloaded" });
      });

      await test.step("Verify room folders are not visible (isolation check)", async () => {
        const incognitoMyRooms = new MyRooms(userPage, login.portalDomain);
        await incognitoMyRooms.verifyCompleteFolderNotVisible();
        await incognitoMyRooms.verifyInProcessFolderNotVisible();
      });

      await test.step("Submit the form", async () => {
        const pdfForm = new FilesPdfForm(userPage);
        const completedForm = await pdfForm.clickSubmitButton();
        await completedForm.checkDocumentTitleIsVisible(completedFileName);
        await completedForm.checkDownloadButtonVisible();
        await completedForm.checkBackToRoomButtonHidden();
      });

      await test.step("Reload owner page to see updated room state", async () => {
        await page.reload({ waitUntil: "load" });
        await expect(page.getByLabel("ONLYOFFICE Resume Sample,")).toBeVisible({
          timeout: 10000,
        });
      });

      await test.step("Verify Complete folder appeared in room", async () => {
        await myRooms.verifyCompleteFolderVisible();
      });

      await test.step("Verify submitted form is in Complete folder", async () => {
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

    test("Download button on completed-form page triggers file download", async ({
      page,
      browser,
      apiSdk,
    }) => {
      let publicLink: string;
      let userPage: Page;

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

      await test.step("Login as DocSpace user and open fill link", async () => {
        const { userData } = await apiSdk.profiles.addMember("owner", "User");
        const result = await setupIncognitoContext(browser);
        incognitoContext = result.context;
        userPage = result.page;
        const userLogin = new Login(userPage, login.portalDomain);
        await userLogin.loginWithCredentials(userData.email, userData.password);
        await userPage.goto(publicLink, { waitUntil: "domcontentloaded" });
      });

      await test.step("Submit the form", async () => {
        const pdfForm = new FilesPdfForm(userPage);
        await pdfForm.clickSubmitButton();
      });

      await test.step("Click download button and verify file download starts", async () => {
        const completedForm = new RoomPDFCompleted(userPage);
        const [download] = await Promise.all([
          userPage.waitForEvent("download", { timeout: 30000 }),
          completedForm.clickDownloadButton(),
        ]);
        const fileName = download.suggestedFilename();
        expect(fileName).toMatch(/ONLYOFFICE Resume Sample.*\.pdf$/i);
        await download.cancel();
      });
    });

    test("DocSpace user can fill form again after submitting via public link", async ({
      page,
      browser,
      apiSdk,
    }) => {
      let publicLink: string;
      let userEmail: string;
      let userPassword: string;
      let completedFileName: string;
      let secondCompletedFileName: string;

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

      await test.step("Create DocSpace user via API", async () => {
        const { userData } = await apiSdk.profiles.addMember("owner", "User");
        userEmail = userData.email;
        userPassword = userData.password;
        completedFileName = `1 - ${userData.firstName} ${userData.lastName} - ONLYOFFICE Resume Sample`;
        secondCompletedFileName = `2 - ${userData.firstName} ${userData.lastName} - ONLYOFFICE Resume Sample`;
      });

      let userPage: Page;
      await test.step("Login as DocSpace user in incognito", async () => {
        const result = await setupIncognitoContext(browser);
        incognitoContext = result.context;
        userPage = result.page;
        const userLogin = new Login(userPage, login.portalDomain);
        await userLogin.loginWithCredentials(userEmail, userPassword);
      });

      await test.step("Open public fill link as DocSpace user", async () => {
        await userPage.goto(publicLink, { waitUntil: "domcontentloaded" });
      });

      await test.step("Verify room folders are not visible (isolation check)", async () => {
        const incognitoMyRooms = new MyRooms(userPage, login.portalDomain);
        await incognitoMyRooms.verifyCompleteFolderNotVisible();
        await incognitoMyRooms.verifyInProcessFolderNotVisible();
      });

      await test.step("Submit the form (first submission)", async () => {
        const pdfForm = new FilesPdfForm(userPage);
        const completedForm = await pdfForm.clickSubmitButton();
        await completedForm.checkDocumentTitleIsVisible(completedFileName);
        await completedForm.checkDownloadButtonVisible();
        await completedForm.checkBackToRoomButtonHidden();
        await completedForm.checkFillItOutAgainButtonVisible();
      });

      await test.step("Click Fill it out again", async () => {
        const completedForm = new RoomPDFCompleted(userPage);
        await completedForm.chooseFillItOutAgain();
        await userPage.waitForURL(/.*doceditor.*/, {
          waitUntil: "domcontentloaded",
        });
      });

      await test.step("Verify form is ready for filling again", async () => {
        const pdfForm = new FilesPdfForm(userPage);
        await pdfForm.checkSubmitButtonExist();
      });

      await test.step("Submit the form again (second submission)", async () => {
        const pdfForm = new FilesPdfForm(userPage);
        const completedForm = await pdfForm.clickSubmitButton();
        await completedForm.checkDocumentTitleIsVisible(
          secondCompletedFileName,
        );
        await completedForm.checkDownloadButtonVisible();
        await completedForm.checkBackToRoomButtonHidden();
        await completedForm.checkFillItOutAgainButtonVisible();
      });
    });

    test("Anonymous user is redirected to login when link access is DocSpace users only", async ({
      page,
      browser,
    }) => {
      let shareLink: string;

      await test.step("Upload PDF form from My Documents", async () => {
        await uploadAndVerifyPDF(
          shortTour,
          roomEmptyView,
          selectPanel,
          myRooms,
          page,
        );
      });

      await test.step("Start filling the form", async () => {
        await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
        await filesTable.contextMenu.clickOption(
          formFillingRoomPdfContextMenuOption.startFilling,
        );
        await shortTour.clickModalCloseButton().catch(() => {});
      });

      await test.step("Verify fill icon on file", async () => {
        await filesTable.expectFillingIconVisible("ONLYOFFICE Resume Sample");
      });

      await test.step("Change link access to DocSpace users only", async () => {
        await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
        await filesTable.contextMenu.clickSubmenuOption(
          "Share",
          "Sharing settings",
        );
        await setupClipboardPermissions(page);
        await infoPanel.selectLinkAccess("docspace users only");
        await myRooms.toast.dismissToastSafely(
          "Link copied to clipboard",
          10000,
        );
        shareLink = await getLinkFromClipboard(page);
      });

      await test.step("Verify anonymous user is redirected to login", async () => {
        await verifyLoginPageInIncognito(browser, shareLink);
      });
    });

    test("DocSpace user can fill form when link access is DocSpace users only", async ({
      page,
      browser,
      apiSdk,
    }) => {
      let shareLink: string;
      let userEmail: string;
      let userPassword: string;
      let completedFileName: string;

      await test.step("Upload PDF form from My Documents", async () => {
        await uploadAndVerifyPDF(
          shortTour,
          roomEmptyView,
          selectPanel,
          myRooms,
          page,
        );
      });

      await test.step("Start filling the form", async () => {
        await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
        await filesTable.contextMenu.clickOption(
          formFillingRoomPdfContextMenuOption.startFilling,
        );
        await shortTour.clickModalCloseButton().catch(() => {});
      });

      await test.step("Verify fill icon on file", async () => {
        await filesTable.expectFillingIconVisible("ONLYOFFICE Resume Sample");
      });

      await test.step("Change link access to DocSpace users only", async () => {
        await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
        await filesTable.contextMenu.clickSubmenuOption(
          "Share",
          "Sharing settings",
        );
        await setupClipboardPermissions(page);
        await infoPanel.selectLinkAccess("docspace users only");
        await myRooms.toast.dismissToastSafely(
          "Link copied to clipboard",
          10000,
        );
        shareLink = await getLinkFromClipboard(page);
      });

      await test.step("Create DocSpace user via API", async () => {
        const { userData } = await apiSdk.profiles.addMember("owner", "User");
        userEmail = userData.email;
        userPassword = userData.password;
        completedFileName = `1 - ${userData.firstName} ${userData.lastName} - ONLYOFFICE Resume Sample`;
      });

      let userPage: Page;
      await test.step("Login as DocSpace user in incognito", async () => {
        const result = await setupIncognitoContext(browser);
        incognitoContext = result.context;
        userPage = result.page;
        const userLogin = new Login(userPage, login.portalDomain);
        await userLogin.loginWithCredentials(userEmail, userPassword);
      });

      await test.step("Open fill link after login", async () => {
        await userPage.goto(shareLink, { waitUntil: "domcontentloaded" });
      });

      await test.step("Verify room folders are not visible (isolation check)", async () => {
        const incognitoMyRooms = new MyRooms(userPage, login.portalDomain);
        await incognitoMyRooms.verifyCompleteFolderNotVisible();
        await incognitoMyRooms.verifyInProcessFolderNotVisible();
      });

      await test.step("Submit the form and verify completed page", async () => {
        const pdfForm = new FilesPdfForm(userPage);
        const completedForm = await pdfForm.clickSubmitButton();
        await completedForm.checkDocumentTitleIsVisible(completedFileName);
        await completedForm.checkDownloadButtonVisible();
        await completedForm.checkBackToRoomButtonHidden();
      });
    });

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

  test.describe("Form filling not started", () => {
    test("DocSpace user sees info-box when opening Anyone fill link when filling not started", async ({
      page,
      apiSdk,
    }) => {
      let fileLink: string;
      let userEmail: string;
      let userPassword: string;

      await test.step("Upload PDF form from My Documents", async () => {
        await uploadAndVerifyPDF(
          shortTour,
          roomEmptyView,
          selectPanel,
          myRooms,
          page,
        );
      });

      await test.step("Copy shared file link", async () => {
        fileLink = await copyFileLink(page, filesTable, myRooms);
      });

      await test.step("Create DocSpace user via API", async () => {
        const { userData } = await apiSdk.profiles.addMember("owner", "User");
        userEmail = userData.email;
        userPassword = userData.password;
      });

      await test.step("Logout and login as DocSpace user", async () => {
        await page.context().clearCookies();
        await login.loginWithCredentials(userEmail, userPassword);
      });

      await test.step("Open file link", async () => {
        await page.goto(fileLink, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(12000);
      });

      await test.step("Verify info-box message is visible", async () => {
        const pdfForm = new FilesPdfForm(page);
        await pdfForm.checkInfoBoxVisible();
      });
    });

    test("Anonymous user sees fill viewer without submit button", async ({
      page,
      browser,
    }) => {
      let shareLink: string;

      await test.step("Upload PDF form from My Documents", async () => {
        await uploadAndVerifyPDF(
          shortTour,
          roomEmptyView,
          selectPanel,
          myRooms,
          page,
        );
      });

      await test.step("Copy file link", async () => {
        shareLink = await copyFileLink(page, filesTable, myRooms);
      });

      await test.step("Open link in incognito and verify fill viewer without submit", async () => {
        const result = await setupIncognitoContext(browser);
        incognitoContext = result.context;
        incognitoPage = result.page;
        await incognitoPage.goto(shareLink, {
          waitUntil: "domcontentloaded",
        });
        const pdfForm = new FilesPdfForm(incognitoPage);
        await pdfForm.verifyFillViewerVisible();
        await pdfForm.verifyFillViewerMenuItems();
      });

      await test.step("Verify room folders are not visible (isolation check)", async () => {
        ensureIncognitoPage(incognitoPage);
        const incognitoMyRooms = new MyRooms(
          incognitoPage!,
          login.portalDomain,
        );
        await incognitoMyRooms.verifyCompleteFolderNotVisible();
        await incognitoMyRooms.verifyInProcessFolderNotVisible();
      });
    });

    test("Anonymous user is redirected to login when link access is DocSpace users only", async ({
      page,
      browser,
    }) => {
      let shareLink: string;

      await test.step("Upload PDF form from My Documents", async () => {
        await uploadAndVerifyPDF(
          shortTour,
          roomEmptyView,
          selectPanel,
          myRooms,
          page,
        );
      });

      await test.step("Change link access to DocSpace users only", async () => {
        await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
        await filesTable.contextMenu.clickSubmenuOption(
          "Share",
          "Sharing settings",
        );
        await setupClipboardPermissions(page);
        await infoPanel.selectLinkAccess("docspace users only");
        await myRooms.toast.dismissToastSafely(
          "Link copied to clipboard",
          10000,
        );
        shareLink = await getLinkFromClipboard(page);
      });

      await test.step("Verify anonymous user is redirected to login", async () => {
        await verifyLoginPageInIncognito(browser, shareLink);
      });
    });

    // TODO: Bug 80900 - after fix, verify this test reflects correct behavior
    // (info-box visibility logic may change)
    test("DocSpace user sees info-box when link access is DocSpace users only", async ({
      page,
      apiSdk,
    }) => {
      let shareLink: string;
      let userEmail: string;
      let userPassword: string;

      await test.step("Upload PDF form from My Documents", async () => {
        await uploadAndVerifyPDF(
          shortTour,
          roomEmptyView,
          selectPanel,
          myRooms,
          page,
        );
      });

      await test.step("Change link access to DocSpace users only", async () => {
        await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
        await filesTable.contextMenu.clickSubmenuOption(
          "Share",
          "Sharing settings",
        );
        await setupClipboardPermissions(page);
        await infoPanel.selectLinkAccess("docspace users only");
        await myRooms.toast.dismissToastSafely(
          "Link copied to clipboard",
          10000,
        );
        shareLink = await getLinkFromClipboard(page);
      });

      await test.step("Create DocSpace user via API", async () => {
        const { userData } = await apiSdk.profiles.addMember("owner", "User");
        userEmail = userData.email;
        userPassword = userData.password;
      });

      await test.step("Logout and login as DocSpace user", async () => {
        await page.context().clearCookies();
        await login.loginWithCredentials(userEmail, userPassword);
      });

      await test.step("Open file link", async () => {
        await page.goto(shareLink, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(12000);
      });

      await test.step("Verify info-box message is visible", async () => {
        const pdfForm = new FilesPdfForm(page);
        await pdfForm.checkInfoBoxVisible();
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
      await expect(
        frame.getByText("Access denied Click to close"),
      ).toBeVisible({ timeout: 30000 });
    });
  });
});
