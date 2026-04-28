import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import MyRooms from "@/src/objects/rooms/Rooms";
import {
  roomContextMenuOption,
  roomCreateTitles,
  roomDialogSource,
  roomTemplateTitles,
  roomToastMessages,
  templateContextMenuOption,
} from "@/src/utils/constants/rooms";

test.describe("Room templates: creation", () => {
  let myRooms: MyRooms;

  test.beforeEach(async ({ page, api, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    await login.loginToPortal();
  });

  test("Save room as template", async () => {
    await test.step("Precondition: create public room", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await myRooms.roomsCreateDialog.openRoomType(roomCreateTitles.public);
      await myRooms.roomsCreateDialog.createRoom(roomCreateTitles.public);
      await myRooms.backToRooms();
    });

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
    await myRooms.roomsEmptyView.checkEmptyRoomExist(roomCreateTitles.public);
    await myRooms.backToRooms();
    await myRooms.roomsTable.checkRowExist(roomTemplateTitles.roomTemplate);
    await myRooms.infoPanel.close();
  });

  test("Create room from template", async () => {
    await test.step("Precondition: create public room and save as template", async () => {
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
      await myRooms.backToRooms();
      await myRooms.infoPanel.close();
    });

    await myRooms.roomsTable.openContextMenu(roomTemplateTitles.roomTemplate);
    await myRooms.roomsTable.clickContextMenuOption(
      templateContextMenuOption.createRoom,
    );
    await myRooms.roomsCreateDialog.createPublicRoomFromTemplate();
    await myRooms.removeToast(
      roomToastMessages.baseOnTemplateCreated(roomTemplateTitles.fromTemplate),
    );
    await myRooms.roomsEmptyView.checkEmptyRoomExist(roomCreateTitles.public);
    await myRooms.backToRooms();
    await myRooms.roomsTable.checkRowExist(roomTemplateTitles.fromTemplate);
    await myRooms.infoPanel.close();
  });
});

test.describe("Room templates: management", () => {
  let myRooms: MyRooms;

  test.beforeEach(async ({ page, api, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    await login.loginToPortal();

    await test.step("Precondition: create public room and save as template", async () => {
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
      await myRooms.backToRooms();
      await myRooms.infoPanel.close();
      await myRooms.openTemplatesTab();
      await myRooms.roomsTable.checkRowExist(roomTemplateTitles.roomTemplate);
    });
  });

  test("Edit template name", async () => {
    await test.step("Open Edit template dialog", async () => {
      await myRooms.roomsTable.openContextMenu(roomTemplateTitles.roomTemplate);
      await myRooms.roomsTable.clickContextMenuOption(
        templateContextMenuOption.editTemplate,
      );
      await myRooms.roomsEditTemplateDialog.checkDialogTitleExist();
    });

    await test.step("Rename and save", async () => {
      await myRooms.roomsEditTemplateDialog.fillTemplateName(
        roomTemplateTitles.editedTemplate,
      );
      await myRooms.roomsEditTemplateDialog.clickSaveButton();
    });

    await test.step("Verify template was renamed", async () => {
      await myRooms.roomsTable.checkRowExist(roomTemplateTitles.editedTemplate);
      await myRooms.roomsTable.checkRowNotExist(
        roomTemplateTitles.roomTemplate,
      );
    });
  });

  test("Change template access settings: toggle available to everyone", async () => {
    await test.step("Open Access settings dialog", async () => {
      await myRooms.roomsTable.openContextMenu(roomTemplateTitles.roomTemplate);
      await myRooms.roomsTable.clickContextMenuOption(
        templateContextMenuOption.accessSettings,
      );
      await myRooms.roomsAccessSettingsDialog.checkAccessSettingsTitleExist();
    });

    await test.step("Toggle 'available to everyone' on and save", async () => {
      await myRooms.roomsAccessSettingsDialog.expectAvailableToggleChecked(
        false,
      );
      await myRooms.roomsAccessSettingsDialog.toggleAvailableToEveryone();
      await myRooms.roomsAccessSettingsDialog.expectAvailableToggleChecked(
        true,
      );
      await myRooms.roomsAccessSettingsDialog.clickSaveButton();
    });

    await test.step("Reopen and verify toggle persisted", async () => {
      await myRooms.roomsTable.openContextMenu(roomTemplateTitles.roomTemplate);
      await myRooms.roomsTable.clickContextMenuOption(
        templateContextMenuOption.accessSettings,
      );
      await myRooms.roomsAccessSettingsDialog.expectAvailableToggleChecked(
        true,
      );
      await myRooms.roomsAccessSettingsDialog.close();
    });
  });

  test("Change template access settings: add admin to access list", async ({
    apiSdk,
  }) => {
    const { userData } = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const userName = `${userData.firstName} ${userData.lastName}`;

    await test.step("Open Access settings dialog", async () => {
      await myRooms.roomsTable.openContextMenu(roomTemplateTitles.roomTemplate);
      await myRooms.roomsTable.clickContextMenuOption(
        templateContextMenuOption.accessSettings,
      );
      await myRooms.roomsAccessSettingsDialog.checkAccessSettingsTitleExist();
    });

    await test.step("Open user picker via 'Choose from list'", async () => {
      await myRooms.roomsAccessSettingsDialog.clickChooseFromList();
    });

    await test.step("Select created user by name", async () => {
      await myRooms.roomsAccessSettingsDialog.selectUserFromPicker(userName);
    });

    await test.step("Verify user is in access list and save", async () => {
      await myRooms.roomsAccessSettingsDialog.expectUserInAccessList(userName);
      await myRooms.roomsAccessSettingsDialog.clickSaveButton();
    });

    await test.step("Reopen and verify user persisted", async () => {
      await myRooms.roomsTable.openContextMenu(roomTemplateTitles.roomTemplate);
      await myRooms.roomsTable.clickContextMenuOption(
        templateContextMenuOption.accessSettings,
      );
      await myRooms.roomsAccessSettingsDialog.expectUserInAccessList(userName);
      await myRooms.roomsAccessSettingsDialog.close();
    });
  });

  test("Download template", async () => {
    const download = await myRooms.waitForDownload(async () => {
      await myRooms.roomsTable.openContextMenu(roomTemplateTitles.roomTemplate);
      await myRooms.roomsTable.clickContextMenuOption(
        templateContextMenuOption.download,
      );
    });
    expect(download.suggestedFilename()).toBeTruthy();
    await download.delete();
  });

  test("Delete template", async () => {
    await test.step("Open Delete template dialog", async () => {
      await myRooms.roomsTable.openContextMenu(roomTemplateTitles.roomTemplate);
      await myRooms.roomsTable.clickContextMenuOption(
        templateContextMenuOption.delete,
      );
      await myRooms.roomTemplateDeleteModal.checkDialogTitleExist();
    });

    await test.step("Confirm with checkbox and submit", async () => {
      await myRooms.roomTemplateDeleteModal.confirmAndDelete();
    });

    await test.step("Verify template is removed", async () => {
      await myRooms.roomsTable.checkRowNotExist(
        roomTemplateTitles.roomTemplate,
      );
    });
  });
});
