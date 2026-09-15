import MyRooms from "@/src/objects/rooms/Rooms";
import { test } from "@/src/fixtures";

test.describe("Rooms: empty view welcome screen", () => {
  let myRooms: MyRooms;

  test.beforeEach(async ({ page, api, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    await login.loginToPortal();
    await myRooms.open();
  });

  test("Shows title, all action items and the header AI Chat button", async () => {
    await test.step("Title", async () => {
      await myRooms.roomsEmptyView.checkNoRoomsTitleExist();
    });

    await test.step("Action items, including AI Chat", async () => {
      await myRooms.roomsEmptyView.checkRoomsEmptyViewItemsExist();
    });

    await test.step("Header AI Chat button is visible", async () => {
      await myRooms.checkAiChatButtonVisible();
    });
  });
});
