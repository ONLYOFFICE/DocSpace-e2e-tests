import { test } from "@/src/fixtures";
import { Page } from "@playwright/test";
import MyRooms from "@/src/objects/rooms/Rooms";
import FilesPdfForm from "@/src/objects/files/FilesPdfForm";
import PdfFormModal from "@/src/objects/rooms/PdfFormModal";
import Login from "@/src/objects/common/Login";
import { apps, roomsSubItems } from "@/src/utils/constants/navigation";
import { formFillingRoomPdfContextMenuOption } from "@/src/utils/constants/files";

const PDF_FORM_FILE = "data/rooms/PDF from device.pdf";
const PDF_FORM_NAME = "PDF from device";

test.describe("FormFilling room: Forms section Recent", () => {
  let myRooms: MyRooms;
  let login: Login;
  let roomName: string;

  test.beforeEach(async ({ page, api, apiSdk }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    login = new Login(page, api.portalDomain);

    roomName = "FormFillingRoom_Recent";
    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: roomName,
      roomType: "FillingFormsRoom",
    });
    const roomBody = await roomResponse.json();
    await apiSdk.files.uploadToFolder(
      "owner",
      roomBody.response.id,
      PDF_FORM_FILE,
    );
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
});
