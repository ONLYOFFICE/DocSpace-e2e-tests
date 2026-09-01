import { test } from "@/src/fixtures";
import { expect, Page } from "@playwright/test";
import MyRooms from "@/src/objects/rooms/Rooms";
import FilesPdfForm from "@/src/objects/files/FilesPdfForm";
import PdfFormModal from "@/src/objects/rooms/PdfFormModal";
import Login from "@/src/objects/common/Login";
import { apps, roomsSubItems } from "@/src/utils/constants/navigation";
import { formFillingRoomPdfContextMenuOption } from "@/src/utils/constants/files";
import { formsRecentContextMenuOption } from "@/src/utils/constants/forms";

const PDF_FORM_FILE = "data/rooms/PDF from device.pdf";
const PDF_FORM_NAME = "PDF from device";

test.describe("FormFilling room: Forms section Recent", () => {
  let myRooms: MyRooms;
  let login: Login;
  let roomName: string;
  let pdfFormFileId: number;

  test.beforeEach(async ({ page, api, apiSdk }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    login = new Login(page, api.portalDomain);

    roomName = "FormFillingRoom_Recent";
    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: roomName,
      roomType: "FillingFormsRoom",
    });
    const roomBody = await roomResponse.json();
    const uploadedFile = await apiSdk.files.uploadToFolder(
      "owner",
      roomBody.response.id,
      PDF_FORM_FILE,
    );
    pdfFormFileId = uploadedFile.id;
  });

  test("Recent is empty by default", async () => {
    await test.step("Login as owner and open Forms > Recent", async () => {
      await login.loginToPortal();
      await myRooms.openFormsRecent();
    });

    await test.step("Verify Recent empty view is shown", async () => {
      await myRooms.expectFormsRecentEmptyView();
    });
  });

  test("PDF form opened for filling appears in Forms > Recent", async ({
    page,
  }) => {
    let pdfPage: Page;

    await test.step("Login as owner and open FormFilling room", async () => {
      await login.loginToPortal();
      // Form Set rooms live under the Forms app, not the Rooms list
      await myRooms.openForms();
      await myRooms.roomsTable.openRoomByName(roomName);
    });

    await test.step("Start filling the PDF form", async () => {
      await myRooms.filesTable.openContextMenuForItem(PDF_FORM_NAME);
      await myRooms.filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.startFilling,
      );
      await new PdfFormModal(page).close();
      await myRooms.filesTable.expectFillingIconVisible(PDF_FORM_NAME);
    });

    await test.step("Open the form for filling, then close it", async () => {
      await myRooms.filesTable.openContextMenuForItem(PDF_FORM_NAME);
      [pdfPage] = await Promise.all([
        page.context().waitForEvent("page", { timeout: 30000 }),
        myRooms.filesTable.contextMenu.clickOption(
          formFillingRoomPdfContextMenuOption.fill,
        ),
      ]);
      await pdfPage.waitForLoadState("load");
      await pdfPage.reload({ waitUntil: "load" }); // Bug 81446 - editor may not init if tab is inactive on load
      const pdfForm = new FilesPdfForm(pdfPage);
      await pdfForm.waitForEditorFrame();
      await pdfPage.close();
    });

    await test.step("Verify the form appears in Forms > Recent", async () => {
      await myRooms.openFormsRecent();
      await myRooms.filesTable.checkRowExist(PDF_FORM_NAME);
    });

    await test.step("Verify the form does not appear in Rooms > Recent", async () => {
      await myRooms.sidebar.openSubItem(apps.rooms, roomsSubItems.recent);
      await myRooms.filesTable.checkRowNotExist(PDF_FORM_NAME);
    });
  });

  test("Context menu in Forms > Recent shows the expected options", async ({
    apiSdk,
  }) => {
    await test.step("Add the PDF form to Recent via API", async () => {
      await apiSdk.files.addToRecent("owner", pdfFormFileId);
    });

    await test.step("Login as owner and open Forms > Recent", async () => {
      await login.loginToPortal();
      await myRooms.openFormsRecent();
    });

    await test.step("Open context menu and verify menu options", async () => {
      await myRooms.filesTable.openContextMenuForItem(PDF_FORM_NAME);
      for (const option of Object.values(formsRecentContextMenuOption)) {
        await expect(
          myRooms.filesTable.contextMenu.getItemLocator(option),
        ).toBeVisible();
      }
    });
  });

  test("Search in Forms > Recent by file name", async ({ apiSdk }) => {
    await test.step("Add the PDF form to Recent via API", async () => {
      await apiSdk.files.addToRecent("owner", pdfFormFileId);
    });

    await test.step("Login as owner and open Forms > Recent", async () => {
      await login.loginToPortal();
      await myRooms.openFormsRecent();
      await myRooms.filesTable.checkRowExist(PDF_FORM_NAME);
    });

    await test.step("Search by file name", async () => {
      await myRooms.filesFilter.fillFilesSearchInputAndCheckRequest(
        PDF_FORM_NAME,
      );
      await myRooms.filesTable.checkRowExist(PDF_FORM_NAME);
    });

    await test.step("Search with no results", async () => {
      await myRooms.filesFilter.fillFilesSearchInputAndCheckRequest(
        "nonexistent file",
      );
      await myRooms.filesFilter.checkFilesEmptyViewExist();
    });

    await test.step("Clear search", async () => {
      await myRooms.filesFilter.clearSearchText();
      await myRooms.filesTable.checkRowExist(PDF_FORM_NAME);
    });
  });

  test("Remove from list removes the form from Forms > Recent", async ({
    apiSdk,
  }) => {
    await test.step("Add the PDF form to Recent via API", async () => {
      await apiSdk.files.addToRecent("owner", pdfFormFileId);
    });

    await test.step("Login as owner and open Forms > Recent", async () => {
      await login.loginToPortal();
      await myRooms.openFormsRecent();
      await myRooms.filesTable.checkRowExist(PDF_FORM_NAME);
    });

    await test.step("Remove the form from the list", async () => {
      await myRooms.filesTable.openContextMenuForItem(PDF_FORM_NAME);
      await myRooms.filesTable.contextMenu.clickOption(
        formsRecentContextMenuOption.removeFromList,
      );
      await myRooms.filesTable.checkRowNotExist(PDF_FORM_NAME);
    });
  });

  test("Mark as favorite from Forms > Recent adds the form to Forms > Favorites", async ({
    apiSdk,
  }) => {
    await test.step("Add the PDF form to Recent via API", async () => {
      await apiSdk.files.addToRecent("owner", pdfFormFileId);
    });

    await test.step("Login as owner and open Forms > Recent", async () => {
      await login.loginToPortal();
      await myRooms.openFormsRecent();
      await myRooms.filesTable.checkRowExist(PDF_FORM_NAME);
    });

    await test.step("Mark the form as favorite", async () => {
      await myRooms.filesTable.openContextMenuForItem(PDF_FORM_NAME);
      await myRooms.filesTable.contextMenu.clickOption(
        formsRecentContextMenuOption.markAsFavorite,
      );
    });

    await test.step("Verify the form appears in Forms > Favorites", async () => {
      await myRooms.openFormsFavorites();
      await myRooms.filesTable.checkRowExist(PDF_FORM_NAME);
    });
  });

  test("Download in original format from Forms > Recent", async ({
    apiSdk,
  }) => {
    await test.step("Add the PDF form to Recent via API", async () => {
      await apiSdk.files.addToRecent("owner", pdfFormFileId);
    });

    await test.step("Login as owner and open Forms > Recent", async () => {
      await login.loginToPortal();
      await myRooms.openFormsRecent();
      await myRooms.filesTable.checkRowExist(PDF_FORM_NAME);
    });

    await test.step("Download the form in original format", async () => {
      const download = await myRooms.waitForDownload(async () => {
        await myRooms.filesTable.openContextMenuForItem(PDF_FORM_NAME);
        await myRooms.filesTable.contextMenu.clickSubmenuOption(
          "Download",
          "Original format",
        );
      });
      expect(download.suggestedFilename().toLowerCase()).toContain(".pdf");
      await download.delete();
    });
  });

  test("Download with conversion from Forms > Recent", async ({ apiSdk }) => {
    await test.step("Add the PDF form to Recent via API", async () => {
      await apiSdk.files.addToRecent("owner", pdfFormFileId);
    });

    await test.step("Login as owner and open Forms > Recent", async () => {
      await login.loginToPortal();
      await myRooms.openFormsRecent();
      await myRooms.filesTable.checkRowExist(PDF_FORM_NAME);
    });

    await test.step("Download the form with conversion", async () => {
      await myRooms.filesTable.openContextMenuForItem(PDF_FORM_NAME);
      await myRooms.filesTable.contextMenu.clickSubmenuOption(
        "Download",
        "Download as",
      );
      await myRooms.downloadDialog.expectOpen();
      await myRooms.downloadDialog.selectFormat(".docx");

      const download = await myRooms.waitForDownload(async () => {
        await myRooms.downloadDialog.submitDownload();
      });
      expect(download.suggestedFilename().toLowerCase()).toContain(".docx");
      await download.delete();
      await myRooms.downloadDialog.close();
    });
  });
});
