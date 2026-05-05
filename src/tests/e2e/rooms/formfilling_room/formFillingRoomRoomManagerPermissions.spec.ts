import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import MyRooms from "@/src/objects/rooms/Rooms";
import { ShortTour } from "@/src/objects/rooms/ShortTourModal";
import RoomInfoPanel from "@/src/objects/rooms/RoomInfoPanel";
import RoomsInviteDialog from "@/src/objects/rooms/RoomsInviteDialog";
import Login from "@/src/objects/common/Login";
import ConflictResolveDialog from "@/src/objects/files/ConflictResolveDialog";
import FilesSelectPanel from "@/src/objects/files/FilesSelectPanel";
import FolderDeleteModal from "@/src/objects/files/FolderDeleteModal";
import FileVersionHistory from "@/src/objects/files/FileVersionHistory";
import FilesPdfForm from "@/src/objects/files/FilesPdfForm";
import StopFillingModal from "@/src/objects/files/StopFillingModal";
import {
  folderContextMenuOption,
  formFillingRoomPdfContextMenuOption,
  pdfFormContextMenuOption,
  pdfFormDownloadSubmenu,
  pdfFormMoreOptionsSubmenu,
  pdfFormMoveOrCopySubmenu,
} from "@/src/utils/constants/files";

test.describe("FormFilling room - Room manager permissions", () => {
  let myRooms: MyRooms;
  let shortTour: ShortTour;
  let roomInfoPanel: RoomInfoPanel;
  let roomsInviteDialog: RoomsInviteDialog;
  let login: Login;

  let roomManagerEmail: string;
  let roomManagerPassword: string;
  let formFillerEmail: string;
  let userToDeleteEmail: string;
  let userToInviteEmail: string;
  let roomName: string;
  let roomId: number;
  let ownerFolderName: string;
  let ownerFolderToDeleteName: string;
  const pdfToDeleteName = "PDF with a required field";

  test.beforeEach(async ({ page, api, apiSdk }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    shortTour = new ShortTour(page);
    roomInfoPanel = new RoomInfoPanel(page);
    roomsInviteDialog = new RoomsInviteDialog(page);
    login = new Login(page, api.portalDomain);

    // Create FormFilling room via API
    roomName = "FormFillingRoom_RoomManager";
    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: roomName,
      roomType: "FillingFormsRoom",
    });
    if (!roomResponse.ok()) {
      throw new Error(
        `createRoom failed (${roomResponse.status()}): ${await roomResponse.text()}`,
      );
    }
    const roomBody = await roomResponse.json();
    roomId = roomBody.response.id;

    ownerFolderName = "OwnerFolder";
    ownerFolderToDeleteName = "OwnerFolderToDelete";

    // Run room file/folder setup and user creation in parallel
    const [, [rmResult, ffResult, userToDeleteResult, userToInviteResult]] =
      await Promise.all([
        Promise.all([
          apiSdk.files.uploadToFolder(
            "owner",
            roomId,
            "data/rooms/PDF from device.pdf",
          ),
          apiSdk.files.uploadToFolder(
            "owner",
            roomId,
            "data/rooms/PDF with a required field.pdf",
          ),
          apiSdk.files.createFolder("owner", roomId, ownerFolderName),
          apiSdk.files.createFolder("owner", roomId, ownerFolderToDeleteName),
        ]),
        Promise.all([
          apiSdk.profiles.addMember("owner", "RoomAdmin"),
          apiSdk.profiles.addMember("owner", "User"),
          apiSdk.profiles.addMember("owner", "User"),
          apiSdk.profiles.addMember("owner", "User"),
        ]),
      ]);

    roomManagerEmail = rmResult.userData.email;
    roomManagerPassword = rmResult.userData.password;
    formFillerEmail = ffResult.userData.email;
    userToDeleteEmail = userToDeleteResult.userData.email;
    userToInviteEmail = userToInviteResult.userData.email;
  });

  test("Verify room management permissions", async ({ page }) => {
    await test.step("Setup: Login as owner and add users via UI", async () => {
      await login.loginToPortal();
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(roomName);
      await shortTour.clickSkipTour();

      // Add Room manager
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.openPeopleList();
      await roomsInviteDialog.contactsPanel.selectAccessType("roomManager");
      await roomsInviteDialog.contactsPanel.selectUserByEmail(roomManagerEmail);
      await roomsInviteDialog.contactsPanel.clickSelectButton();
      await roomsInviteDialog.verifyUserRole(roomManagerEmail, "Room admin");
      await roomsInviteDialog.submitInviteDialog();

      await myRooms.infoPanel.openTab("Contacts");
      await expect(
        roomInfoPanel.getMemberByEmail(roomManagerEmail),
      ).toBeVisible({ timeout: 10000 });

      // Add Form filler
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.openPeopleList();
      await roomsInviteDialog.contactsPanel.selectUserByEmail(formFillerEmail);
      await roomsInviteDialog.contactsPanel.clickSelectButton();
      await roomsInviteDialog.verifyUserRole(formFillerEmail, "Form filler");
      await roomsInviteDialog.submitInviteDialog();

      await myRooms.infoPanel.openTab("Contacts");
      await expect(roomInfoPanel.getMemberByEmail(formFillerEmail)).toBeVisible(
        { timeout: 10000 },
      );

      // Add user to delete
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.openPeopleList();
      await roomsInviteDialog.contactsPanel.selectUserByEmail(
        userToDeleteEmail,
      );
      await roomsInviteDialog.contactsPanel.clickSelectButton();
      await roomsInviteDialog.verifyUserRole(userToDeleteEmail, "Form filler");
      await roomsInviteDialog.submitInviteDialog();

      await myRooms.infoPanel.openTab("Contacts");
      await expect(
        roomInfoPanel.getMemberByEmail(userToDeleteEmail),
      ).toBeVisible({ timeout: 10000 });

      await page.context().clearCookies();
    });

    await test.step("Login as Room manager", async () => {
      await login.loginWithCredentials(roomManagerEmail, roomManagerPassword);
      await myRooms.roomsTable.openRoomByName(roomName);
      const tourVisible = await shortTour.isTourVisible(6000);
      if (tourVisible) {
        await shortTour.clickSkipTour();
      }
    });

    await test.step("Verify room context menu has 'Edit room' option", async () => {
      await myRooms.navigation.openContextMenu();
      await expect(
        myRooms.navigation.contextMenu.menu.getByText("Edit room"),
      ).toBeVisible();
    });

    await test.step("Verify Room manager CAN edit room name", async () => {
      // Context menu is already open from the previous step
      await myRooms.navigation.contextMenu.menu.getByText("Edit room").click();
      await myRooms.roomsEditDialog.checkDialogTitleExist();
      const editedRoomName = roomName + " (edited)";
      await myRooms.roomsEditDialog.fillRoomName(editedRoomName);
      await myRooms.roomsEditDialog.clickSaveButton();
      // Verify the new name is reflected in the room heading
      await expect(
        page.getByRole("heading", { name: editedRoomName, level: 1 }),
      ).toBeVisible();
    });

    await test.step("Verify Room manager CAN see add user button", async () => {
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await expect(roomInfoPanel.addUserButton).toBeVisible();
    });

    await test.step("Verify Room manager CAN view participant list", async () => {
      await expect(
        roomInfoPanel.getMemberByEmail(roomManagerEmail),
      ).toBeVisible();
      await expect(
        roomInfoPanel.getMemberByEmail(formFillerEmail),
      ).toBeVisible();
      await expect(
        roomInfoPanel.getMemberByEmail(userToDeleteEmail),
      ).toBeVisible();
    });

    await test.step("Verify Room manager CAN see context menu buttons for other members", async () => {
      // Context menu buttons are visible for members that Room manager can manage
      await expect(roomInfoPanel.memberContextMenuButtons).not.toHaveCount(0);
    });

    await test.step("Verify Room manager CANNOT change own role (no context menu on own row)", async () => {
      const ownRow = roomInfoPanel.getMemberByEmail(roomManagerEmail);
      await expect(
        ownRow.locator('[data-test-id="combo-button"]'),
      ).not.toBeVisible();
    });

    await test.step("Verify Room manager CAN change another member's role", async () => {
      const memberRow = roomInfoPanel.getMemberByEmail(formFillerEmail);
      await memberRow.locator('[data-test-id="combo-button"]').click();
      // Select Content creator role from the role dropdown
      await page.getByRole("listbox").getByText("Content creator").click();
      // Verify role badge updated in the member row
      await expect(memberRow).toContainText("Content creator");
    });

    await test.step("Verify Room manager CAN remove a member from the room", async () => {
      const memberRow = roomInfoPanel.getMemberByEmail(userToDeleteEmail);
      await memberRow.locator('[data-test-id="combo-button"]').click();
      // Remove the member from the room
      await page.getByRole("listbox").getByText("Remove").click();
      // Verify member is no longer in the list
      await expect(
        roomInfoPanel.getMemberByEmail(userToDeleteEmail),
      ).not.toBeVisible();
    });

    await test.step("Verify Room manager CAN invite a new user", async () => {
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.openPeopleList();
      // Select user from the list (Form filler is the default role)
      await roomsInviteDialog.contactsPanel.selectUserByEmail(
        userToInviteEmail,
      );
      await roomsInviteDialog.contactsPanel.clickSelectButton();
      await roomsInviteDialog.verifyUserRole(userToInviteEmail, "Form filler");
      await roomsInviteDialog.submitInviteDialog();
      await myRooms.infoPanel.openTab("Contacts");
      await expect(
        roomInfoPanel.getMemberByEmail(userToInviteEmail),
      ).toBeVisible({ timeout: 10000 });
    });

    await test.step("Verify Room manager CAN see 'Link to fill out'", async () => {
      await expect(page.getByText("Link to fill out")).toBeVisible();
    });

    await test.step("Verify Room manager CAN view room history", async () => {
      await myRooms.infoPanel.openTab("History");
      await expect(page.getByTestId("info_history_tab")).toBeVisible();
      await expect(page.getByText("Today")).toBeVisible();
    });

    await test.step("Verify Room manager CAN view Details tab", async () => {
      await myRooms.infoPanel.openTab("Details");
      await expect(page.getByTestId("info_details_tab")).toBeVisible();
    });
  });

  test("Verify folder management permissions", async ({ page }) => {
    await test.step("Setup: Login as owner and add Room manager via UI", async () => {
      await login.loginToPortal();
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(roomName);
      await shortTour.clickSkipTour();

      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.openPeopleList();
      await roomsInviteDialog.contactsPanel.selectAccessType("roomManager");
      await roomsInviteDialog.contactsPanel.selectUserByEmail(roomManagerEmail);
      await roomsInviteDialog.contactsPanel.clickSelectButton();
      await roomsInviteDialog.verifyUserRole(roomManagerEmail, "Room admin");
      await roomsInviteDialog.submitInviteDialog();

      await myRooms.infoPanel.openTab("Contacts");
      await expect(
        roomInfoPanel.getMemberByEmail(roomManagerEmail),
      ).toBeVisible({ timeout: 10000 });

      await page.context().clearCookies();
    });

    await test.step("Login as Room manager", async () => {
      await login.loginWithCredentials(roomManagerEmail, roomManagerPassword);
      await myRooms.roomsTable.openRoomByName(roomName);
      const tourVisible = await shortTour.isTourVisible(6000);
      if (tourVisible) {
        await shortTour.clickSkipTour();
      }
      await myRooms.infoPanel.close();
    });

    await test.step("Verify Room manager CAN copy owner's folder to My Documents", async () => {
      await myRooms.filesTable.openContextMenuForItem(ownerFolderName, true);
      await myRooms.filesTable.contextMenu.clickSubmenuOption(
        folderContextMenuOption.moveOrCopy,
        pdfFormMoveOrCopySubmenu.copy,
      );
      const filesSelectPanel = new FilesSelectPanel(page);
      await filesSelectPanel.checkFileSelectPanelExist();
      await filesSelectPanel.gotoDocSpaceRoot();
      await filesSelectPanel.select("documents");
      await filesSelectPanel.confirmSelection();
      await myRooms.toast.dismissToastSafely(
        `${ownerFolderName} successfully copied to My documents`,
      );
      // Original folder remains in the room after copy
      await expect(
        page
          .locator('[data-testid^="files-cell-name"]')
          .getByText(ownerFolderName, { exact: true }),
      ).toBeVisible();
    });

    await test.step("Verify Room manager CAN move owner's folder to My Documents", async () => {
      await myRooms.filesTable.openContextMenuForItem(ownerFolderName, true);
      await myRooms.filesTable.contextMenu.clickSubmenuOption(
        folderContextMenuOption.moveOrCopy,
        pdfFormMoveOrCopySubmenu.moveTo,
      );
      const filesSelectPanel = new FilesSelectPanel(page);
      await filesSelectPanel.checkFileSelectPanelExist();
      await filesSelectPanel.gotoDocSpaceRoot();
      await filesSelectPanel.select("documents");
      await filesSelectPanel.confirmSelection();
      // Conflict dialog appears because the folder was copied to My Documents in the previous step
      const folderConflict = new ConflictResolveDialog(page);
      await folderConflict.resolveWith("Copy and keep both folders");
      await myRooms.toast.dismissToastSafely(
        "successfully moved to My documents",
      );
      // Folder is no longer in the room after move
      await expect(
        page.getByText(ownerFolderName, { exact: true }),
      ).not.toBeVisible();
    });

    await test.step("Verify Room manager CAN delete owner's folder", async () => {
      await myRooms.filesTable.openContextMenuForItem(ownerFolderToDeleteName);
      await myRooms.filesTable.contextMenu.clickOption(
        folderContextMenuOption.delete,
      );
      const deleteModal = new FolderDeleteModal(page);
      await deleteModal.clickDeleteFolder();
      await myRooms.toast.dismissToastSafely(
        `The folder ${ownerFolderToDeleteName} successfully moved to Trash`,
      );
      await expect(
        page.getByText(ownerFolderToDeleteName, { exact: true }),
      ).not.toBeVisible();
    });
  });

  test("Verify file management permissions", async ({ page }) => {
    await test.step("Setup: Login as owner and add Room manager via UI", async () => {
      await login.loginToPortal();
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(roomName);
      await shortTour.clickSkipTour();

      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.openPeopleList();
      await roomsInviteDialog.contactsPanel.selectAccessType("roomManager");
      await roomsInviteDialog.contactsPanel.selectUserByEmail(roomManagerEmail);
      await roomsInviteDialog.contactsPanel.clickSelectButton();
      await roomsInviteDialog.verifyUserRole(roomManagerEmail, "Room admin");
      await roomsInviteDialog.submitInviteDialog();

      await myRooms.infoPanel.openTab("Contacts");
      await expect(
        roomInfoPanel.getMemberByEmail(roomManagerEmail),
      ).toBeVisible({ timeout: 10000 });

      await myRooms.infoPanel.close();
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      await myRooms.filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.blockVersion,
      );
      await myRooms.filesTable.expectLockIconVisible("PDF from device");

      await page.context().clearCookies();
    });

    await test.step("Login as Room manager", async () => {
      await login.loginWithCredentials(roomManagerEmail, roomManagerPassword);
      await myRooms.roomsTable.openRoomByName(roomName);
      const tourVisible = await shortTour.isTourVisible(6000);
      if (tourVisible) {
        await shortTour.clickSkipTour();
      }
      await myRooms.infoPanel.close();
    });

    await test.step("Verify lock icon is visible on PDF form locked by owner", async () => {
      await myRooms.filesTable.expectLockIconVisible("PDF from device");
    });

    await test.step("Room manager unlocks the PDF form via context menu", async () => {
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      await myRooms.filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.blockVersion,
      );
      await myRooms.filesTable.expectLockIconNotVisible("PDF from device");
    });

    await test.step("Verify Room manager CAN rename owner's PDF (context menu option visible)", async () => {
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      // Anchor: download option is visible, ensures menu is fully loaded
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          pdfFormContextMenuOption.download,
        ),
      ).toBeVisible();
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          pdfFormContextMenuOption.rename,
        ),
      ).toBeVisible();
      await myRooms.filesTable.contextMenu.close();
    });

    await test.step("Verify Room manager CAN delete owner's PDF", async () => {
      await myRooms.filesTable.openContextMenuForItem(pdfToDeleteName);
      await myRooms.filesTable.contextMenu.clickOption(
        pdfFormContextMenuOption.delete,
      );
      const deleteModal = new FolderDeleteModal(page);
      await deleteModal.clickDeleteFolder();
      await myRooms.toast.dismissToastSafely("successfully moved to Trash");
      await expect(
        page.getByText(pdfToDeleteName, { exact: true }),
      ).not.toBeVisible();
    });

    await test.step("Verify Room manager CAN copy owner's PDF form to My Documents", async () => {
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      await myRooms.filesTable.contextMenu.clickSubmenuOption(
        pdfFormContextMenuOption.moveOrCopy,
        pdfFormMoveOrCopySubmenu.copy,
      );
      const filesSelectPanel = new FilesSelectPanel(page);
      await filesSelectPanel.checkFileSelectPanelExist();
      await filesSelectPanel.gotoDocSpaceRoot();
      await filesSelectPanel.select("documents");
      await filesSelectPanel.confirmSelection();
      await myRooms.toast.dismissToastSafely(
        "PDF from device.pdf successfully copied to My documents",
      );
      // Original file remains in the room after copy
      await expect(
        page
          .locator('[data-testid^="files-cell-name"]')
          .getByText("PDF from device", { exact: true }),
      ).toBeVisible();
    });

    await test.step("Verify Room manager CAN move owner's PDF form to My Documents", async () => {
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      await myRooms.filesTable.contextMenu.clickSubmenuOption(
        pdfFormContextMenuOption.moveOrCopy,
        pdfFormMoveOrCopySubmenu.moveTo,
      );
      const filesSelectPanel = new FilesSelectPanel(page);
      await filesSelectPanel.checkFileSelectPanelExist();
      await filesSelectPanel.gotoDocSpaceRoot();
      await filesSelectPanel.select("documents");
      await filesSelectPanel.confirmSelection();
      // Conflict dialog appears because a copy already exists in My Documents
      const fileConflict = new ConflictResolveDialog(page);
      await fileConflict.resolveWith("Overwrite with version update");
      await myRooms.toast.dismissToastSafely(
        "PDF from device.pdf successfully moved to My documents",
      );
      // File is no longer in the room after move
      await expect(
        page
          .locator('[data-testid^="files-cell-name"]')
          .getByText("PDF from device", { exact: true }),
      ).not.toBeVisible();
    });
  });

  test("Verify PDF form filling permissions", async ({ page }) => {
    await test.step("Setup: Login as owner and add Room manager via UI", async () => {
      await login.loginToPortal();
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(roomName);
      await shortTour.clickSkipTour();

      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.openPeopleList();
      await roomsInviteDialog.contactsPanel.selectAccessType("roomManager");
      await roomsInviteDialog.contactsPanel.selectUserByEmail(roomManagerEmail);
      await roomsInviteDialog.contactsPanel.clickSelectButton();
      await roomsInviteDialog.verifyUserRole(roomManagerEmail, "Room admin");
      await roomsInviteDialog.submitInviteDialog();

      await myRooms.infoPanel.openTab("Contacts");
      await expect(
        roomInfoPanel.getMemberByEmail(roomManagerEmail),
      ).toBeVisible({ timeout: 10000 });

      await page.context().clearCookies();
    });

    await test.step("Login as Room manager", async () => {
      await login.loginWithCredentials(roomManagerEmail, roomManagerPassword);
      await myRooms.roomsTable.openRoomByName(roomName);
      const tourVisible = await shortTour.isTourVisible(6000);
      if (tourVisible) {
        await shortTour.clickSkipTour();
      }
      await myRooms.infoPanel.close();
    });

    await test.step("Verify file context menu shows 'Start filling' option for owner's PDF form", async () => {
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          formFillingRoomPdfContextMenuOption.startFilling,
        ),
      ).toBeVisible();
      await myRooms.filesTable.contextMenu.close();
    });

    await test.step("Verify Room manager CAN upload PDF forms from device", async () => {
      await myRooms.filesNavigation.openCreateDropdown();
      const [fileChooser] = await Promise.all([
        page.waitForEvent("filechooser", { timeout: 30000 }),
        myRooms.filesNavigation.contextMenu.clickSubmenuOption(
          "Upload PDF form",
          "From device",
        ),
      ]);
      await fileChooser.setFiles("data/rooms/PDF from device.pdf");
      const conflictDialog = new ConflictResolveDialog(page);
      await conflictDialog.resolveWith("Overwrite with version update");
      await page.waitForLoadState("load");
      await expect(page.locator('[data-version-badge="true"]')).toBeVisible();
    });

    await test.step("Verify Room manager CAN start filling owner's PDF form", async () => {
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      await myRooms.filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.startFilling,
      );
      // Modal with copy link appears — confirms the action was allowed
      await shortTour.clickModalCloseButton();
    });

    await test.step("Verify 'Stop filling' is visible in context menu for owner's PDF form", async () => {
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          formFillingRoomPdfContextMenuOption.stopFilling,
        ),
      ).toBeVisible();
      await myRooms.filesTable.contextMenu.close();
    });

    await test.step("Verify Room manager CAN view file version history", async () => {
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      await myRooms.filesTable.contextMenu.clickSubmenuOption(
        pdfFormContextMenuOption.moreOptions,
        pdfFormMoreOptionsSubmenu.showVersionHistory,
      );
      const versionHistory = new FileVersionHistory(page);
      await versionHistory.checkFileNameVisible("PDF from device");
      await versionHistory.checkVersionsVisible();
    });

    await test.step("Verify earliest version has correct context menu options (including Delete)", async () => {
      const versionHistory = new FileVersionHistory(page);
      // version_row IDs are backend revision IDs, not sequential display positions;
      // use the last displayed row to reliably target the earliest version
      const earliestIndex = await versionHistory.getEarliestVersionIndex();
      await versionHistory.checkVersionMenuOptions(
        earliestIndex,
        ["Open", "Edit comment", "Restore", "Download", "Delete"],
        [],
      );
      await versionHistory.close();
    });

    await test.step("Verify Room manager CAN restore the earliest version", async () => {
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      await myRooms.filesTable.contextMenu.clickSubmenuOption(
        pdfFormContextMenuOption.moreOptions,
        pdfFormMoreOptionsSubmenu.showVersionHistory,
      );
      const versionHistory = new FileVersionHistory(page);
      await versionHistory.checkFileNameVisible("PDF from device");
      const versionCountBefore = await versionHistory.getVersionCount();
      // restore the earliest version (last row in the list, by actual revision ID)
      const earliestIndex = await versionHistory.getEarliestVersionIndex();
      await versionHistory.clickVersionMenuOption(earliestIndex, "Restore");
      // After restore a new version is created, so the total count increases by 1
      await expect(versionHistory.versionItems).toHaveCount(
        versionCountBefore + 1,
      );
      await expect(
        page.getByText(/Restored from the revision of/),
      ).toBeVisible();
      await versionHistory.close();
    });

    await test.step("Verify PDF form editor shows 'Download as PDF' and 'Print' buttons", async () => {
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      const [pdfPage] = await Promise.all([
        page.context().waitForEvent("page", { timeout: 30000 }),
        myRooms.filesTable.contextMenu.clickOption(
          formFillingRoomPdfContextMenuOption.fill,
        ),
      ]);
      await pdfPage.waitForLoadState("load");
      await pdfPage.waitForSelector('iframe[name="frameEditor"]', {
        state: "attached",
        timeout: 60000,
      });
      const pdfForm = new FilesPdfForm(pdfPage);
      await expect(pdfForm.submitButton).toBeVisible({ timeout: 60000 });
      await pdfForm.openMenu();
      await expect(pdfForm.printButton).toBeVisible();
      await expect(pdfForm.downloadAsPdfButton).toBeVisible();
      await pdfPage.close();
    });

    await test.step("Verify Room manager CAN download PDF form via context menu", async () => {
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      const [download] = await Promise.all([
        page.waitForEvent("download", { timeout: 30000 }),
        myRooms.filesTable.contextMenu.clickSubmenuOption(
          pdfFormContextMenuOption.download,
          pdfFormDownloadSubmenu.originalFormat,
        ),
      ]);
      expect(download.suggestedFilename()).toBeTruthy();
    });

    await test.step("Verify Room manager CAN submit the PDF form", async () => {
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      const [pdfPage] = await Promise.all([
        page.context().waitForEvent("page", { timeout: 30000 }),
        myRooms.filesTable.contextMenu.clickOption(
          formFillingRoomPdfContextMenuOption.fill,
        ),
      ]);
      await pdfPage.waitForLoadState("load");
      await pdfPage.waitForSelector('iframe[name="frameEditor"]', {
        state: "attached",
        timeout: 60000,
      });
      const pdfForm = new FilesPdfForm(pdfPage);
      await expect(pdfForm.submitButton).toBeVisible({ timeout: 60000 });
      const completedPage = await pdfForm.clickSubmitButton();
      await completedPage.waitForPageLoad();
      await pdfPage.close();
    });

    await test.step("Verify Room manager CAN stop filling owner's PDF form", async () => {
      const stopFillingModal = new StopFillingModal(page);
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      await myRooms.filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.stopFilling,
      );
      await stopFillingModal.clickConfirm();
      await myRooms.filesTable.expectFillingIconNotVisible("PDF from device");
    });
  });
});
