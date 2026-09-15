import { test } from "@/src/fixtures";
import MyRooms from "@/src/objects/rooms/Rooms";
import {
  roomContextMenuOption,
  roomCreateTitles,
  roomDialogSource,
  roomTemplateTitles,
  roomToastMessages,
} from "@/src/utils/constants/rooms";
import { formTemplateTitles } from "@/src/utils/constants/forms";

const FORM_ROOM_NAME = "Form space for template isolation";

test.describe("Room and form templates: section isolation", () => {
  let myRooms: MyRooms;

  test.beforeEach(async ({ page, api, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    await login.loginToPortal();

    await test.step("Precondition: create a public room and save it as a room template", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await myRooms.roomsCreateDialog.openRoomType(roomCreateTitles.public);
      await myRooms.roomsCreateDialog.createRoom(roomCreateTitles.public);
      await myRooms.backToRooms();

      await myRooms.roomsTable.openContextMenu(roomCreateTitles.public);
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.manage,
      );
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.saveAsTemplate,
      );
      await myRooms.roomsCreateDialog.createPublicRoomTemplate();
      await myRooms.removeToast(
        roomToastMessages.templateSaved(roomTemplateTitles.roomTemplate),
      );
      await myRooms.infoPanel.close();
    });

    await test.step("Precondition: create a Form space and save it as a form template", async () => {
      await myRooms.createFormFillingRoom(FORM_ROOM_NAME);
      await myRooms.openForms();

      await myRooms.roomsTable.openContextMenu(FORM_ROOM_NAME);
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.manage,
      );
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.saveAsTemplate,
      );
      await myRooms.roomsCreateDialog.fillTemplateName(
        formTemplateTitles.formTemplate,
      );
      await myRooms.roomsCreateDialog.clickRoomTemplateSubmit();
      await myRooms.removeToast(
        roomToastMessages.templateSaved(formTemplateTitles.formTemplate),
      );
      await myRooms.infoPanel.close();
    });
  });

  test("Rooms > Templates only lists room templates, Forms > Templates only lists form templates", async () => {
    await test.step("Rooms > Templates shows the room template but not the form template", async () => {
      await myRooms.openTemplates();
      await myRooms.roomsTable.checkRowExist(roomTemplateTitles.roomTemplate);
      await myRooms.roomsTable.checkRowNotExist(
        formTemplateTitles.formTemplate,
      );
    });

    await test.step("Searching Rooms > Templates for the form template returns no results", async () => {
      await myRooms.roomsFilter.fillRoomsSearchInputAndCheckRequest(
        formTemplateTitles.formTemplate,
      );
      await myRooms.roomsFilter.checkEmptyViewExist();
      await myRooms.roomsFilter.clearSearchText();
    });

    await test.step("Forms > Templates shows the form template but not the room template", async () => {
      await myRooms.openFormsTemplates();
      await myRooms.roomsTable.checkRowExist(formTemplateTitles.formTemplate);
      await myRooms.roomsTable.checkRowNotExist(
        roomTemplateTitles.roomTemplate,
      );
    });

    await test.step("Searching Forms > Templates for the room template returns no results", async () => {
      await myRooms.roomsFilter.fillRoomsSearchInputAndCheckRequest(
        roomTemplateTitles.roomTemplate,
      );
      await myRooms.roomsFilter.checkEmptyViewExist();
      await myRooms.roomsFilter.clearSearchText();
    });
  });
});
