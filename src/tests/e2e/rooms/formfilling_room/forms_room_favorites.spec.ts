import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import MyRooms from "@/src/objects/rooms/Rooms";
import Login from "@/src/objects/common/Login";
import { apps, roomsSubItems } from "@/src/utils/constants/navigation";
import { formsFavoritesContextMenuOption } from "@/src/utils/constants/forms";

const PDF_FORM_FILE = "data/rooms/PDF from device.pdf";
const PDF_FORM_NAME = "PDF from device";

test.describe("FormFilling room: Forms section Favorites", () => {
  let myRooms: MyRooms;
  let login: Login;
  let roomName: string;
  let pdfFormFileId: number;

  test.beforeEach(async ({ page, api, apiSdk }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    login = new Login(page, api.portalDomain);

    roomName = "FormFillingRoom_Favorites";
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

  test("Favorites is empty by default", async () => {
    await test.step("Login as owner and open Forms > Favorites", async () => {
      await login.loginToPortal();
      await myRooms.openFormsFavorites();
    });

    await test.step("Verify Favorites empty view is shown", async () => {
      await myRooms.expectFormsFavoritesEmptyView();
    });
  });

  test("PDF form marked as favorite appears in Forms > Favorites", async () => {
    await test.step("Login as owner and open FormFilling room", async () => {
      await login.loginToPortal();
      // Form Set rooms live under the Forms app, not the Rooms list
      await myRooms.openForms();
      await myRooms.roomsTable.openRoomByName(roomName);
    });

    await test.step("Mark the PDF form as favorite", async () => {
      await myRooms.filesTable.markAsFavorite(PDF_FORM_NAME);
    });

    await test.step("Verify the form appears in Forms > Favorites", async () => {
      await myRooms.openFormsFavorites();
      await myRooms.filesTable.checkRowExist(PDF_FORM_NAME);
    });

    await test.step("Verify the form does not appear in Rooms > Favorites", async () => {
      await myRooms.sidebar.openSubItem(apps.rooms, roomsSubItems.favorites);
      await myRooms.filesTable.checkRowNotExist(PDF_FORM_NAME);
    });
  });

  test("Context menu in Forms > Favorites shows the expected options", async ({
    apiSdk,
  }) => {
    await test.step("Add the PDF form to Favorites via API", async () => {
      await apiSdk.files.addToFavorites("owner", [pdfFormFileId]);
    });

    await test.step("Login as owner and open Forms > Favorites", async () => {
      await login.loginToPortal();
      await myRooms.openFormsFavorites();
    });

    await test.step("Open context menu and verify menu options", async () => {
      await myRooms.filesTable.openContextMenuForItem(PDF_FORM_NAME);
      for (const option of Object.values(formsFavoritesContextMenuOption)) {
        await expect(
          myRooms.filesTable.contextMenu.getItemLocator(option),
        ).toBeVisible();
      }
    });
  });

  test("Search in Forms > Favorites by file name", async ({ apiSdk }) => {
    await test.step("Add the PDF form to Favorites via API", async () => {
      await apiSdk.files.addToFavorites("owner", [pdfFormFileId]);
    });

    await test.step("Login as owner and open Forms > Favorites", async () => {
      await login.loginToPortal();
      await myRooms.openFormsFavorites();
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

  test("Remove from favorites removes the form from Forms > Favorites", async ({
    apiSdk,
  }) => {
    await test.step("Add the PDF form to Favorites via API", async () => {
      await apiSdk.files.addToFavorites("owner", [pdfFormFileId]);
    });

    await test.step("Login as owner and open Forms > Favorites", async () => {
      await login.loginToPortal();
      await myRooms.openFormsFavorites();
      await myRooms.filesTable.checkRowExist(PDF_FORM_NAME);
    });

    await test.step("Remove the form from favorites", async () => {
      await myRooms.filesTable.openContextMenuForItem(PDF_FORM_NAME);
      await myRooms.filesTable.contextMenu.clickOption(
        formsFavoritesContextMenuOption.removeFromFavorites,
      );
      await myRooms.filesTable.checkRowNotExist(PDF_FORM_NAME);
    });
  });

  test("Download in original format from Forms > Favorites", async ({
    apiSdk,
  }) => {
    await test.step("Add the PDF form to Favorites via API", async () => {
      await apiSdk.files.addToFavorites("owner", [pdfFormFileId]);
    });

    await test.step("Login as owner and open Forms > Favorites", async () => {
      await login.loginToPortal();
      await myRooms.openFormsFavorites();
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

  test("Download with conversion from Forms > Favorites", async ({
    apiSdk,
  }) => {
    await test.step("Add the PDF form to Favorites via API", async () => {
      await apiSdk.files.addToFavorites("owner", [pdfFormFileId]);
    });

    await test.step("Login as owner and open Forms > Favorites", async () => {
      await login.loginToPortal();
      await myRooms.openFormsFavorites();
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
