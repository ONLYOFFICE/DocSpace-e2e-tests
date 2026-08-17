import { test } from "@/src/fixtures";
import MyRooms from "@/src/objects/rooms/Rooms";

// Form (Form Set / FillingForms) rooms moved to the Forms app and no longer
// appear in the Rooms list, so their download is covered here separately.
const PDF_FORM_FILE = "data/rooms/PDF from device.pdf";
const FORM_ROOM_TITLE = "Autotest FormFilling";

test.describe("Forms - Download", () => {
  let myRooms: MyRooms;
  let room: { id: number; title: string; roomType: number };

  test.beforeEach(async ({ page, api, apiSdk, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    const response = await apiSdk.rooms.createRoom("owner", {
      title: FORM_ROOM_TITLE,
      roomType: "FillingFormsRoom",
    });
    const body = await response.json();
    room = {
      id: body.response.id,
      title: body.response.title,
      roomType: body.response.roomType,
    };

    await login.loginToPortal();
    await myRooms.openWithoutEmptyCheck();
    await myRooms.openForms();
  });

  test("Download form room as zip (empty room)", async () => {
    await myRooms.downloadRoom(FORM_ROOM_TITLE);
  });

  test("Download form room as zip (with document)", async ({ apiSdk }) => {
    // FillingForms rooms only accept ONLYOFFICE PDF forms.
    await apiSdk.files.uploadToFolder("owner", room.id, PDF_FORM_FILE);
    await myRooms.downloadRoom(FORM_ROOM_TITLE);
  });
});
