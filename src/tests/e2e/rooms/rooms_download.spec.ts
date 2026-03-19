import { test } from "@/src/fixtures";
import MyRooms from "@/src/objects/rooms/Rooms";

const PDF_FILE = "data/rooms/PDF simple.pdf";
const PDF_FORM_FILE = "data/rooms/PDF from device.pdf";

test.describe("Rooms - Download", () => {
  let myRooms: MyRooms;
  let rooms: { id: number; title: string; roomType: number }[];

  test.beforeEach(async ({ page, api, apiSdk, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    rooms = await apiSdk.rooms.createAllRoomTypes("owner");

    await login.loginToPortal();
    await myRooms.openWithoutEmptyCheck();
  });

  test("Download all room types as zip (empty rooms)", async () => {
    await test.step("Download Autotest Custom", async () => {
      await myRooms.downloadRoom("Autotest Custom");
    });

    await test.step("Download Autotest Collaboration", async () => {
      await myRooms.downloadRoom("Autotest Collaboration");
    });

    await test.step("Download Autotest FormFilling", async () => {
      await myRooms.downloadRoom("Autotest FormFilling");
    });

    await test.step("Download Autotest Public", async () => {
      await myRooms.downloadRoom("Autotest Public");
    });

    await test.step("Download Autotest VDR", async () => {
      await myRooms.downloadRoom("Autotest VDR");
    });
  });

  test("Download all room types as zip (rooms with documents)", async ({
    apiSdk,
  }) => {
    for (const room of rooms) {
      // FormFilling room only accepts ONLYOFFICE PDF forms
      const file =
        room.title === "Autotest FormFilling" ? PDF_FORM_FILE : PDF_FILE;
      await apiSdk.files.uploadToFolder("owner", room.id, file);
    }

    await test.step("Download Autotest Custom with document", async () => {
      await myRooms.downloadRoom("Autotest Custom");
    });

    await test.step("Download Autotest Collaboration with document", async () => {
      await myRooms.downloadRoom("Autotest Collaboration");
    });

    await test.step("Download Autotest FormFilling with document", async () => {
      await myRooms.downloadRoom("Autotest FormFilling");
    });

    await test.step("Download Autotest Public with document", async () => {
      await myRooms.downloadRoom("Autotest Public");
    });

    await test.step("Download Autotest VDR with document", async () => {
      await myRooms.downloadRoom("Autotest VDR");
    });
  });
});
