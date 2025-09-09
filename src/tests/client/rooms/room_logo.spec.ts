import MyRooms from "@/src/objects/rooms/Rooms";
import Screenshot from "@/src/objects/common/Screenshot";
import {
  roomContextMenuOption,
  roomCreateTitles,
  roomDialogSource,
  roomTemplateTitles,
  roomToastMessages,
  templateContextMenuOption,
} from "@/src/utils/constants/rooms";
import { test } from "@/src/fixtures";
import { Page } from "@playwright/test";

test.describe("Rooms", () => {
  let screenshot: Screenshot;
  let myRooms: MyRooms;
  let page: Page;

  const duplicateRoomName = roomCreateTitles.public + " (1)";

  test.beforeEach(async ({ page: fixturePage, api, login }) => {
    page = fixturePage;
    screenshot = new Screenshot(page, {
      screenshotDir: "rooms",
      suiteName: "rooms",
    });
    myRooms = new MyRooms(page, api.portalDomain);

    await login.loginToPortal();
  });

  test("Render", async () => {
    await test.step("Render", async () => {
      await myRooms.roomsEmptyView.checkNoRoomsExist();
      await screenshot.expectHaveScreenshot("render");
    });

    await test.step("OpenCreateDialog", async () => {
      // FromNavigation
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await screenshot.expectHaveScreenshot("open_create_dialog_navigation");
      await myRooms.roomsCreateDialog.close();

      // FromEmptyView
      await myRooms.openCreateRoomDialog(roomDialogSource.emptyView);
      await myRooms.roomsCreateDialog.close();

      // FromArticle
      await myRooms.openCreateRoomDialog(roomDialogSource.article);
    });

    await test.step("RoomTypesDropdown", async () => {
      await myRooms.roomsCreateDialog.openRoomType(
        roomCreateTitles.formFilling,
      );
      await myRooms.roomsTypeDropdown.openRoomTypeDropdown();
      await screenshot.expectHaveScreenshot("room_types_dropdown");

      await myRooms.roomsTypeDropdown.selectRoomTypeByTitle(
        roomCreateTitles.public,
      );
      await myRooms.roomsCreateDialog.clickBackArrow();

      await myRooms.roomsCreateDialog.openAndValidateRoomTypes(screenshot);
    });

    await test.step("CreateCommonRooms", async () => {
      await myRooms.roomsCreateDialog.openRoomType(roomCreateTitles.public);
      await myRooms.roomsCreateDialog.openRoomIconDropdown();
      await screenshot.expectHaveScreenshot(
        "create_common_rooms_icon_dropdown",
      );

      await myRooms.roomsCreateDialog.openRoomCover();
      await screenshot.expectHaveScreenshot("create_common_rooms_cover");

 //Rooms cover change color tests starts here
 const colorShots: [number, string][] = [
  [0, "red"],
  [1, "orange"],
  [2, "yellow"],
  [3, "green"],
  [4, "cyan"],
  [5, "light_blue"],
  [6, "blue"],
  [7, "purple"],
  [8, "pink"],
];

for (const [idx, name] of colorShots) {
  await myRooms.roomsCreateDialog.setRoomCoverColorByIndex(idx);
  await screenshot.expectHaveScreenshot(`create_common_rooms_cover_color_${name}`);
}

await myRooms.roomsCreateDialog.setRoomCoverColorByIndex(6);

//Rooms cover change logo icon tests starts here

const iconNames = [
  "suitcase",
  "schedule",
  "flag",
  "film",
  "hash",
  "feather",
  "house",
  "life_buoy",
  "mail",
  "face_1",
  "anchor",
  "img",
  "zap",
  "share",
  "umbrella",
  "package",
  "label",
  "shield",
  "telephone",
  "star",
  "heart",
  "comment_1",
  "planet",
  "loupe",
  "human",
  "file_3",
  "cart",
  "percent",
  "video_camera",
  "medal",
  "cloud",
  "truck",
  "lock_security",
  "book_open",
  "check_mark", 
  "comment_2",
  "folder",
  "layers",
  "file_empty",
  "dollar",
  "bookmark",
  "calendar",
  "archive",
  "face_3",
  "file_1",
  "headphones",
  "face_2",
  "gift",
  "bell",
  "watch",
  "camera",
  "pen",
  "clipboard",
  "sliders",
  "file_2",
  "credit_card"
];

for (let i = 0; i < iconNames.length; i++) {
  await myRooms.roomsCreateDialog.setRoomCoverIconByIndex(i);
  await screenshot.expectHaveScreenshot(`create_common_rooms_cover_icon_${iconNames[i]}`);
}
      await myRooms.roomsCreateDialog.setRoomCoverWithoutIcon();
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_without_icon");

      await page.mouse.dblclick(1, 1); // close all dialogs

      await myRooms.createRooms();
 
    });

   
  });
});
