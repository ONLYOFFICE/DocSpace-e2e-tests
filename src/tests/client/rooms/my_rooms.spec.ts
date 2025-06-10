import { test, Page } from "@playwright/test";

import API from "@/src/api";
import Login from "@/src/objects/common/Login";
import MyRooms from "@/src/objects/rooms/MyRooms";
import AdFrame from "@/src/objects/common/AdFrame";
import AdBanner from "@/src/objects/common/AdBanner";
import Screenshot from "@/src/objects/common/Screenshot";
import { ROOM_CREATE_TITLES } from "@/src/utils/constants/rooms";
test.describe("Rooms: My rooms", () => {
  let api: API;
  let page: Page;

  let login: Login;
  let adFrame: AdFrame;
  let adBanner: AdBanner;
  let screenshot: Screenshot;

  let myRooms: MyRooms;

  test.beforeAll(async ({ playwright, browser }) => {
    const apiContext = await playwright.request.newContext();
    api = new API(apiContext);
    await api.setup();
    console.log(api.portalDomain);

    page = await browser.newPage();

    login = new Login(page, api.portalDomain);
    screenshot = new Screenshot(page, "my_rooms", "rooms");
    adFrame = new AdFrame(page);
    adBanner = new AdBanner(page);

    myRooms = new MyRooms(page, api.portalDomain);

    await login.loginToPortal();
    await myRooms.open();
    await adFrame.closeIframe();
    await adBanner.closeBanner();
  });

  test("Render", async () => {
    await screenshot.expectHaveScreenshot("view_render");
  });

  test("EmptyView", async () => {
    await myRooms.roomsEmptyView.checkNoRoomsExist();
    await myRooms.openTemplatesTab();
    await myRooms.roomsEmptyView.checkNoTemplatesExist();
    await screenshot.expectHaveScreenshot("empty_templates_view");

    await myRooms.openRoomsTab();

    await myRooms.navigation.openCreateDialog();
    await myRooms.roomsCreateDialog.checkRoomDialogExist();
    await myRooms.roomsCreateDialog.close();

    await myRooms.roomsArticle.clickNewRoomButton();
    await myRooms.roomsCreateDialog.checkRoomDialogExist();
    await myRooms.roomsCreateDialog.close();

    await myRooms.roomsEmptyView.clickCreateNewRoom();
    await myRooms.roomsCreateDialog.checkRoomDialogExist();
    await screenshot.expectHaveScreenshot("view_create_room_dialog");

    await myRooms.roomsCreateDialog.openRoomType(
      ROOM_CREATE_TITLES.FORM_FILLING,
    );
    await myRooms.roomsTypeDropdown.openRoomTypeDropdown();
    await screenshot.expectHaveScreenshot("view_room_type_dropdown");

    await myRooms.roomsTypeDropdown.selectRoomTypeByTitle(
      ROOM_CREATE_TITLES.PUBLIC,
    );
    await myRooms.roomsCreateDialog.clickBackArrow();

    await myRooms.roomsCreateDialog.openAndValidateRoomTypes(screenshot);
  });

  test("CreateRoomWithCover", async () => {
    await myRooms.roomsCreateDialog.openRoomType(ROOM_CREATE_TITLES.PUBLIC);
    await myRooms.roomsCreateDialog.openRoomCover();
    await screenshot.expectHaveScreenshot("view_room_cover");
    await myRooms.roomsCreateDialog.createRoomWithCover();
    await myRooms.checkCreatedRoomExist(ROOM_CREATE_TITLES.PUBLIC);
    await myRooms.infoPanel.checkInfoPanelExist();
    await screenshot.expectHaveScreenshot("view_created_room_with_cover");
    await myRooms.infoPanel.toggleInfoPanel();
    await myRooms.navigation.gotoBack();
    await myRooms.checkRoomsHeadingExist();
  });

  test("CreateRooms", async () => {
    await myRooms.createRooms();
    await myRooms.roomsTable.hideLastActivityColumn();
    await screenshot.expectHaveScreenshot("view_created_rooms");
    await myRooms.roomsTable.openContextMenu();
    await screenshot.expectHaveScreenshot("view_opened_context_menu_room");
  });

  test.afterAll(async () => {
    await api.cleanup();
  });
});
