import { test } from "@/src/fixtures";
import MyRooms from "@/src/objects/rooms/Rooms";
import Login from "@/src/objects/common/Login";
import { apps, roomsSubItems } from "@/src/utils/constants/navigation";

const PDF_FORM_FILE = "data/rooms/PDF from device.pdf";
const PDF_FORM_NAME = "PDF from device";

test.describe("FormFilling room: Forms section Favorites", () => {
  let myRooms: MyRooms;
  let login: Login;
  let roomName: string;

  test.beforeEach(async ({ page, api, apiSdk }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    login = new Login(page, api.portalDomain);

    roomName = "FormFillingRoom_Favorites";
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
});
