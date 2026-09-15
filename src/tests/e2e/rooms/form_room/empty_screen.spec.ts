import MyRooms from "@/src/objects/rooms/Rooms";
import { test } from "@/src/fixtures";

test.describe("Forms: empty view welcome screen", () => {
  let myRooms: MyRooms;

  test.beforeEach(async ({ page, api, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    await login.loginToPortal();
    await myRooms.openForms();
  });

  test("Shows title, subtitle, all action items and the header AI Chat button", async () => {
    await test.step("Title and subtitle", async () => {
      await myRooms.roomsEmptyView.checkNoFormSpacesExist();
    });

    await test.step("Action items, including AI Chat", async () => {
      await myRooms.roomsEmptyView.checkFormsEmptyViewItemsExist();
    });

    await test.step("Header AI Chat button is visible", async () => {
      await myRooms.checkAiChatButtonVisible();
    });
  });
});
