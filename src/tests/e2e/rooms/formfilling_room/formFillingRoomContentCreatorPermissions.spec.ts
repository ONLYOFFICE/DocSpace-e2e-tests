import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import MyRooms from "@/src/objects/rooms/Rooms";
import { ShortTour } from "@/src/objects/rooms/ShortTourModal";
import RoomInfoPanel from "@/src/objects/rooms/RoomInfoPanel";
import RoomsInviteDialog from "@/src/objects/rooms/RoomsInviteDialog";
import Login from "@/src/objects/common/Login";
import ConflictResolveDialog from "@/src/objects/files/ConflictResolveDialog";
import FolderDeleteModal from "@/src/objects/files/FolderDeleteModal";
import FilesSelectPanel from "@/src/objects/files/FilesSelectPanel";
import FileVersionHistory from "@/src/objects/files/FileVersionHistory";
import FilesPdfForm from "@/src/objects/files/FilesPdfForm";
import RoomSelectPanel from "@/src/objects/rooms/RoomSelectPanel";
import StopFillingModal from "@/src/objects/files/StopFillingModal";
import {
  folderContextMenuOption,
  formFillingRoomPdfContextMenuOption,
  pdfFormContextMenuOption,
  pdfFormDownloadSubmenu,
  pdfFormMoreOptionsSubmenu,
  pdfFormMoveOrCopySubmenu,
} from "@/src/utils/constants/files";
import { formFillingSystemFolders } from "@/src/utils/constants/rooms";

test.describe("FormFilling room - Content creator permissions", () => {
  let myRooms: MyRooms;
  let shortTour: ShortTour;
  let roomInfoPanel: RoomInfoPanel;
  let roomsInviteDialog: RoomsInviteDialog;
  let login: Login;

  let contentCreatorEmail: string;
  let contentCreatorPassword: string;
  let roomName: string;
  let roomId: number;
  let formFillerEmail: string;
  let ownerFolderName: string;

  test.beforeEach(async ({ page, api, apiSdk }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    shortTour = new ShortTour(page);
    roomInfoPanel = new RoomInfoPanel(page);
    roomsInviteDialog = new RoomsInviteDialog(page);
    login = new Login(page, api.portalDomain);

    roomName = "FormFillingRoom_ContentCreator";
    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: roomName,
      roomType: "FillingFormsRoom",
    });
    const roomBody = await roomResponse.json();
    roomId = roomBody.response.id;

    await Promise.all([
      apiSdk.files.uploadToFolder(
        "owner",
        roomId,
        "data/rooms/PDF from device.pdf",
      ),
      apiSdk.files.uploadToFolder("owner", roomId, "data/rooms/PDF block.pdf"),
    ]);

    ownerFolderName = "OwnerFolder";
    await apiSdk.files.createFolder("owner", roomId, ownerFolderName);

    const { userData } = await apiSdk.profiles.addMember("owner", "User");
    contentCreatorEmail = userData.email;
    contentCreatorPassword = userData.password;

    const { userData: formFillerData } = await apiSdk.profiles.addMember(
      "owner",
      "User",
    );
    formFillerEmail = formFillerData.email;
  });

  test("Verify info panel permissions", async ({ page }) => {
    await test.step("Setup: Login as owner and add users via UI", async () => {
      // Login as owner
      await login.loginToPortal();
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(roomName);
      await shortTour.clickSkipTour();

      // Add user with Content creator role via UI
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await roomInfoPanel.clickAddUser();
      // Open people list to select existing user
      await roomsInviteDialog.openPeopleList();
      // Select Content creator access
      await roomsInviteDialog.contactsPanel.selectAccessType("contentCreator");
      // Select user from the list
      await roomsInviteDialog.contactsPanel.selectUserByEmail(
        contentCreatorEmail,
      );
      await roomsInviteDialog.contactsPanel.clickSelectButton();
      // Verify the role is set to Content creator
      await roomsInviteDialog.verifyUserRole(
        contentCreatorEmail,
        "Content creator",
      );
      await roomsInviteDialog.submitInviteDialog();

      // Verify user appears in Contacts list - wait for backend to process
      await myRooms.infoPanel.openTab("Contacts");
      await expect(
        roomInfoPanel.getMemberByEmail(contentCreatorEmail),
      ).toBeVisible({ timeout: 10000 });

      // Add second user (Form filler) via UI - formFiller is default access, no need to change
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

      // Clear cookies to logout from owner account
      await page.context().clearCookies();
    });

    await test.step("Login as Content creator", async () => {
      await login.loginWithCredentials(
        contentCreatorEmail,
        contentCreatorPassword,
      );
      await myRooms.roomsTable.openRoomByName(roomName);
      await shortTour.clickSkipTour();
    });

    await test.step("Verify Content creator CANNOT invite users", async () => {
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await expect(roomInfoPanel.addUserButton).not.toBeVisible();
    });

    await test.step("Verify Content creator CAN view participant list", async () => {
      await expect(
        roomInfoPanel.getMemberByEmail(contentCreatorEmail),
      ).toBeVisible();
      await expect(
        roomInfoPanel.getMemberByEmail(formFillerEmail),
      ).toBeVisible();
    });

    await test.step("Verify Content creator CANNOT change access level for participants", async () => {
      await expect(roomInfoPanel.memberContextMenuButtons).toHaveCount(0);
    });

    await test.step("Verify Content creator CANNOT create/edit links", async () => {
      await expect(page.getByText("Link to fill out")).not.toBeVisible();
    });

    await test.step("Verify Content creator CAN view room history", async () => {
      await myRooms.infoPanel.openTab("History");
      await expect(page.getByTestId("info_history_tab")).toBeVisible();
      await expect(page.getByText("Today")).toBeVisible();
    });

    await test.step("Verify Content creator CAN view Details tab", async () => {
      await myRooms.infoPanel.openTab("Details");
      await expect(page.getByTestId("info_details_tab")).toBeVisible();
    });
  });

  test("Verify folder management permissions", async ({ page }) => {
    await test.step("Setup: Login as owner and add Content creator user via UI", async () => {
      // Login as owner
      await login.loginToPortal();
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(roomName);
      await shortTour.clickSkipTour();

      // Add user with Content creator role via UI
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.openPeopleList();
      await roomsInviteDialog.contactsPanel.selectAccessType("contentCreator");
      await roomsInviteDialog.contactsPanel.selectUserByEmail(
        contentCreatorEmail,
      );
      await roomsInviteDialog.contactsPanel.clickSelectButton();
      await roomsInviteDialog.verifyUserRole(
        contentCreatorEmail,
        "Content creator",
      );
      await roomsInviteDialog.submitInviteDialog();

      // Verify user appears in Contacts list - wait for backend to process
      await myRooms.infoPanel.openTab("Contacts");
      await expect(
        roomInfoPanel.getMemberByEmail(contentCreatorEmail),
      ).toBeVisible({ timeout: 10000 });

      // Clear cookies to logout from owner account
      await page.context().clearCookies();
    });

    await test.step("Login as Content creator", async () => {
      await login.loginWithCredentials(
        contentCreatorEmail,
        contentCreatorPassword,
      );
      await myRooms.roomsTable.openRoomByName(roomName);
      await shortTour.clickSkipTour();
    });

    await test.step("Verify room context menu has no 'Edit room' option", async () => {
      await myRooms.navigation.openContextMenu();
      await expect(
        myRooms.navigation.contextMenu.menu.getByText("Edit room"),
      ).not.toBeVisible();
    });

    await test.step("Verify room context menu has no 'Delete room' option", async () => {
      await expect(
        myRooms.navigation.contextMenu.menu.getByText("Delete room"),
      ).not.toBeVisible();
    });

    await test.step("Verify room context menu has no 'Move to archive' option", async () => {
      await expect(
        myRooms.navigation.contextMenu.menu.getByText("Move to archive"),
      ).not.toBeVisible();
      await myRooms.navigation.closeContextMenu();
    });

    await test.step("Verify action menu shows 'Create new Folder' option", async () => {
      await myRooms.filesNavigation.openCreateDropdown();
      await expect(
        myRooms.filesNavigation.contextMenu.menu.getByText("New folder"),
      ).toBeVisible();
    });

    await test.step("Verify action menu shows 'Choose from Templates' option", async () => {
      await expect(
        myRooms.filesNavigation.contextMenu.menu.getByText("Template Gallery"),
      ).toBeVisible();
    });

    await test.step("Verify action menu shows 'Upload PDF form' option", async () => {
      await expect(
        myRooms.filesNavigation.contextMenu.menu.getByText("Upload PDF form"),
      ).toBeVisible();
      await myRooms.filesNavigation.contextMenu.close();
    });

    await test.step("Verify Content creator CAN access Complete folder", async () => {
      await myRooms.filesTable.openContextMenuForItem(
        formFillingSystemFolders.complete,
      );
      await myRooms.filesTable.contextMenu.clickOption("Open");
      await expect(
        page.getByRole("heading", { name: formFillingSystemFolders.complete }),
      ).toBeVisible();
      await myRooms.navigation.gotoBack();
      await page.waitForLoadState("load");
    });

    await test.step("Verify Content creator CAN access In Process folder", async () => {
      await myRooms.filesTable.openContextMenuForItem(
        formFillingSystemFolders.inProcess,
      );
      await myRooms.filesTable.contextMenu.clickOption("Open");
      await expect(
        page.getByRole("heading", { name: formFillingSystemFolders.inProcess }),
      ).toBeVisible();
      await myRooms.navigation.gotoBack();
      await page.waitForLoadState("load");
    });

    await test.step("Verify Content creator CAN create a new folder", async () => {
      const newFolderName = "TestFolder";
      await myRooms.filesNavigation.openCreateDropdown();
      await myRooms.filesNavigation.selectCreateAction("New folder");
      await myRooms.filesNavigation.modal.checkModalExist();
      await myRooms.filesNavigation.modal.fillCreateTextInput(newFolderName);
      await myRooms.filesNavigation.modal.clickCreateButton();
      await expect(
        page.getByText(newFolderName, { exact: true }),
      ).toBeVisible();

      // Create a second folder that will be actually deleted in the delete step
      await myRooms.filesNavigation.openCreateDropdown();
      await myRooms.filesNavigation.selectCreateAction("New folder");
      await myRooms.filesNavigation.modal.checkModalExist();
      await myRooms.filesNavigation.modal.fillCreateTextInput(
        "TestFolderToDelete",
      );
      await myRooms.filesNavigation.modal.clickCreateButton();
      await expect(
        page.getByText("TestFolderToDelete", { exact: true }),
      ).toBeVisible();
    });

    await test.step("Verify Content creator CAN delete own files and folders", async () => {
      await myRooms.filesTable.openContextMenuForItem("TestFolderToDelete");
      await myRooms.filesTable.contextMenu.clickOption(
        folderContextMenuOption.delete,
      );
      const deleteModal = new FolderDeleteModal(page);
      await deleteModal.clickDeleteFolder();
      await myRooms.toast.dismissToastSafely(
        "The folder TestFolderToDelete successfully moved to Trash",
      );
      await expect(
        page.getByText("TestFolderToDelete", { exact: true }),
      ).not.toBeVisible();
    });

    await test.step("Verify Content creator CAN copy own folder to My Documents", async () => {
      await myRooms.filesTable.openContextMenuForItem("TestFolder");
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
        "TestFolder successfully copied to My documents",
      );
      // Original folder remains in the room after copy
      await expect(
        page
          .locator('[data-testid^="files-cell-name"]')
          .getByText("TestFolder", { exact: true }),
      ).toBeVisible();
    });

    await test.step("Verify Content creator CAN move own folder to My Documents", async () => {
      await myRooms.filesTable.openContextMenuForItem("TestFolder");
      await myRooms.filesTable.contextMenu.clickSubmenuOption(
        folderContextMenuOption.moveOrCopy,
        pdfFormMoveOrCopySubmenu.moveTo,
      );
      const filesSelectPanel = new FilesSelectPanel(page);
      await filesSelectPanel.checkFileSelectPanelExist();
      await filesSelectPanel.gotoDocSpaceRoot();
      await filesSelectPanel.select("documents");
      await filesSelectPanel.confirmSelection();
      // Conflict dialog always appears because the folder was copied to My Documents in the previous step
      const folderConflict = new ConflictResolveDialog(page);
      await folderConflict.resolveWith("Copy and keep both folders");
      await myRooms.toast.dismissToastSafely(
        "successfully moved to My documents",
      );
      // Folder is no longer in the room after move
      await expect(
        page.getByText("TestFolder", { exact: true }),
      ).not.toBeVisible();
    });

    await test.step("Verify Content creator CANNOT delete other users' files and folders", async () => {
      await myRooms.filesTable.openContextMenuForItem(ownerFolderName);
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          folderContextMenuOption.open,
        ),
      ).toBeVisible();
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          folderContextMenuOption.delete,
        ),
      ).not.toBeVisible();
      await myRooms.filesTable.contextMenu.close();
    });

    await test.step("Verify Content creator CANNOT move or copy other users' files and folders", async () => {
      await myRooms.filesTable.openContextMenuForItem(ownerFolderName);
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          folderContextMenuOption.open,
        ),
      ).toBeVisible();
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          folderContextMenuOption.moveOrCopy,
        ),
      ).not.toBeVisible();
      await myRooms.filesTable.contextMenu.close();
    });

    await test.step("Verify Content creator CANNOT rename other users' files and folders", async () => {
      await myRooms.filesTable.openContextMenuForItem(ownerFolderName);
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          folderContextMenuOption.open,
        ),
      ).toBeVisible();
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          folderContextMenuOption.rename,
        ),
      ).not.toBeVisible();
      await myRooms.filesTable.contextMenu.close();
    });
  });

  test("Verify PDF file permissions and form filling", async ({ page }) => {
    await test.step("Setup: Login as owner and add Content creator user via UI", async () => {
      // Login as owner
      await login.loginToPortal();
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(roomName);
      await shortTour.clickSkipTour();

      // Add user with Content creator role via UI
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.openPeopleList();
      await roomsInviteDialog.contactsPanel.selectAccessType("contentCreator");
      await roomsInviteDialog.contactsPanel.selectUserByEmail(
        contentCreatorEmail,
      );
      await roomsInviteDialog.contactsPanel.clickSelectButton();
      await roomsInviteDialog.verifyUserRole(
        contentCreatorEmail,
        "Content creator",
      );
      await roomsInviteDialog.submitInviteDialog();

      // Verify user appears in Contacts list - wait for backend to process
      await myRooms.infoPanel.openTab("Contacts");
      await expect(
        roomInfoPanel.getMemberByEmail(contentCreatorEmail),
      ).toBeVisible({ timeout: 10000 });

      await myRooms.infoPanel.close();
      await myRooms.filesTable.openContextMenuForItem("PDF block");
      await myRooms.filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.blockVersion,
      );
      await myRooms.filesTable.expectLockIconVisible("PDF block");

      // Clear cookies to logout from owner account
      await page.context().clearCookies();
    });

    await test.step("Login as Content creator", async () => {
      await login.loginWithCredentials(
        contentCreatorEmail,
        contentCreatorPassword,
      );
      await myRooms.roomsTable.openRoomByName(roomName);
      await shortTour.clickSkipTour();
    });

    await test.step("Verify lock icon is visible on PDF form locked by owner", async () => {
      await myRooms.filesTable.expectLockIconVisible("PDF block");
    });

    await test.step("Verify tooltip shows the file is locked by owner", async () => {
      await myRooms.filesTable.expectLockTooltipContains(
        "PDF block",
        "This file is locked by",
      );
    });

    await test.step("Verify Content creator cannot edit or unblock the locked PDF form", async () => {
      await myRooms.filesTable.openContextMenuForItem("PDF block");
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          pdfFormContextMenuOption.edit,
        ),
      ).not.toBeVisible();
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          formFillingRoomPdfContextMenuOption.blockVersion,
        ),
      ).not.toBeVisible();
      await myRooms.filesTable.contextMenu.close();
      await myRooms.filesTable.expectLockIconVisible("PDF block");
    });

    await test.step("Verify file context menu shows 'Download' option for owner's PDF form", async () => {
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          pdfFormContextMenuOption.download,
        ),
      ).toBeVisible();
      await myRooms.filesTable.contextMenu.close();
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

    await test.step("Verify Content creator CAN upload PDF forms", async () => {
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

    await test.step("Verify Content creator CAN upload PDF form from DocSpace", async () => {
      await myRooms.filesNavigation.openCreateDropdown();
      await myRooms.filesNavigation.contextMenu.clickSubmenuOption(
        "Upload PDF form",
        "From DocSpace",
      );
      const selectPanel = new RoomSelectPanel(page);
      await selectPanel.checkSelectorExist();
      await selectPanel.select("documents");
      await selectPanel.selectItemByText("ONLYOFFICE Resume Sample");
      await selectPanel.confirmSelection();
      await page.waitForLoadState("load");
      await expect(page.getByText("ONLYOFFICE Resume Sample")).toBeVisible();
    });

    await test.step("Verify Content creator CAN start filling own PDF form", async () => {
      await myRooms.filesTable.openContextMenuForItem(
        "ONLYOFFICE Resume Sample",
      );
      await myRooms.filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.startFilling,
      );
      // Modal with copy link appears — confirms the action was allowed
      await shortTour.clickModalCloseButton();
    });

    await test.step("Verify editing icon appears on own PDF form after start filling", async () => {
      await myRooms.filesTable.expectFillingIconVisible(
        "ONLYOFFICE Resume Sample",
      );
    });

    await test.step("Verify 'Stop filling' is visible in context menu for own PDF form", async () => {
      await myRooms.filesTable.openContextMenuForItem(
        "ONLYOFFICE Resume Sample",
      );
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          formFillingRoomPdfContextMenuOption.stopFilling,
        ),
      ).toBeVisible();
      await myRooms.filesTable.contextMenu.close();
    });

    await test.step("Verify Content creator CAN stop filling own PDF form", async () => {
      const stopFillingModal = new StopFillingModal(page);
      await myRooms.filesTable.openContextMenuForItem(
        "ONLYOFFICE Resume Sample",
      );
      await myRooms.filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.stopFilling,
      );
      await stopFillingModal.clickConfirm();
      await myRooms.filesTable.expectFillingIconNotVisible(
        "ONLYOFFICE Resume Sample",
      );
    });

    await test.step("Verify Content creator CAN copy own file to My Documents", async () => {
      await myRooms.filesTable.openContextMenuForItem(
        "ONLYOFFICE Resume Sample",
      );
      await myRooms.filesTable.contextMenu.clickSubmenuOption(
        pdfFormContextMenuOption.moveOrCopy,
        pdfFormMoveOrCopySubmenu.copy,
      );
      const filesSelectPanel = new FilesSelectPanel(page);
      await filesSelectPanel.checkFileSelectPanelExist();
      await filesSelectPanel.gotoDocSpaceRoot();
      await filesSelectPanel.select("documents");
      await filesSelectPanel.confirmSelection();
      const fileCopyConflict = new ConflictResolveDialog(page);
      await fileCopyConflict.resolveWith("Overwrite with version update");
      await myRooms.toast.dismissToastSafely(
        "ONLYOFFICE Resume Sample.pdf successfully copied to My documents",
      );
      // Original file remains in the room after copy
      await expect(
        page
          .locator('[data-testid^="files-cell-name"]')
          .getByText("ONLYOFFICE Resume Sample", { exact: true }),
      ).toBeVisible();
    });

    await test.step("Verify Content creator CAN move own file to My Documents", async () => {
      await myRooms.filesTable.openContextMenuForItem(
        "ONLYOFFICE Resume Sample",
      );
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
        "ONLYOFFICE Resume Sample.pdf successfully moved to My documents",
      );
      // File is no longer in the room after move
      await expect(
        page
          .locator('[data-testid^="files-cell-name"]')
          .getByText("ONLYOFFICE Resume Sample", { exact: true }),
      ).not.toBeVisible();
    });

    await test.step("Verify Content creator CAN view file version history", async () => {
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      await myRooms.filesTable.contextMenu.clickSubmenuOption(
        pdfFormContextMenuOption.moreOptions,
        pdfFormMoreOptionsSubmenu.showVersionHistory,
      );
      const versionHistory = new FileVersionHistory(page);
      await versionHistory.checkFileNameVisible("PDF from device");
      await versionHistory.checkVersionsVisible();
    });

    await test.step("Verify earliest version has correct context menu options", async () => {
      const versionHistory = new FileVersionHistory(page);
      await versionHistory.checkVersionMenuOptions(
        1,
        ["Open", "Edit comment", "Restore", "Download"],
        ["Delete"],
      );
      await versionHistory.close();
    });

    await test.step("Verify Content creator CAN restore the earliest version", async () => {
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      await myRooms.filesTable.contextMenu.clickSubmenuOption(
        pdfFormContextMenuOption.moreOptions,
        pdfFormMoreOptionsSubmenu.showVersionHistory,
      );
      const versionHistory = new FileVersionHistory(page);
      await versionHistory.checkFileNameVisible("PDF from device");
      const versionCountBefore = await versionHistory.getVersionCount();
      await versionHistory.clickVersionMenuOption(1, "Restore");
      // After restore a new version is created, so the total count increases by 1
      await expect(versionHistory.versionItems).toHaveCount(
        versionCountBefore + 1,
      );
      // The new version has a comment indicating which revision it was restored from
      await expect(
        page.getByText(/Restored from the revision of/),
      ).toBeVisible();
      await versionHistory.close();
    });

    await test.step("Verify Content creator CAN start filling owner's PDF form", async () => {
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      await myRooms.filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.startFilling,
      );
      // Modal with copy link appears — confirms the action was allowed
      await shortTour.clickModalCloseButton();
    });

    await test.step("Verify editing icon appears on owner's PDF form after start filling", async () => {
      await myRooms.filesTable.expectFillingIconVisible("PDF from device");
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

    // TODO: Bug 80858 - Stop filling and Edit should not be visible for Content creator on owner's form.
    // Currently both options appear in the context menu: Stop filling shows a permission error toast,
    // Edit triggers a stop filling dialog, stops filling and opens the file for editing.
    // Step is skipped until the bug is fixed.
    await test.step("TODO Bug 80858: Verify Stop filling is hidden for Content creator on owner's form", async () => {
      test.info().annotations.push({
        type: "issue",
        description:
          "Bug 80858: Stop filling and Edit incorrectly visible for Content creator on owner's form",
      });
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

    await test.step("Verify Content creator CAN download PDF form via context menu", async () => {
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

    await test.step("Verify Content creator CAN submit the PDF form", async () => {
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
  });

  // TODO Bug 81218: unskip when fixed
  test.skip("[Bug 81218] Verify Sync responses to XLSX access by ContentCreator role", async ({
    page,
  }) => {
    // CC's own form (uploaded from DocSpace templates, not in room yet)
    const CC_FORM = "ONLYOFFICE Resume Sample";
    // Owner's form (uploaded by owner in beforeEach)
    const OWNER_FORM = "PDF from device";

    // Helper: fill and submit a form that is already in filling mode.
    // Opens the editor in a new tab, submits, and closes the tab.
    const fillAndSubmit = async (formName: string) => {
      const pagePromise = page
        .context()
        .waitForEvent("page", { timeout: 30000 });
      await myRooms.filesTable.openContextMenuForItem(formName);
      await myRooms.filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.fill,
      );
      const pdfPage = await pagePromise;
      await pdfPage.waitForLoadState("load");
      const pdfForm = new FilesPdfForm(pdfPage);
      await pdfForm.waitForEditorFrame();
      const completed = await pdfForm.clickSubmitButton();
      await completed.waitForPageLoad();
      await pdfPage.close();
      await page.reload({ waitUntil: "load" });
    };

    // Phase 1: owner adds CC to room and submits own form.
    // After this, "PDF from device" submission folder exists in Complete.
    await test.step("Setup: Owner adds CC to room and submits own form", async () => {
      await login.loginToPortal();
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(roomName);
      await shortTour.clickSkipTour();

      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.openPeopleList();
      await roomsInviteDialog.contactsPanel.selectAccessType("contentCreator");
      await roomsInviteDialog.contactsPanel.selectUserByEmail(
        contentCreatorEmail,
      );
      await roomsInviteDialog.contactsPanel.clickSelectButton();
      await roomsInviteDialog.verifyUserRole(
        contentCreatorEmail,
        "Content creator",
      );
      await roomsInviteDialog.submitInviteDialog();
      await myRooms.infoPanel.openTab("Contacts");
      await expect(
        roomInfoPanel.getMemberByEmail(contentCreatorEmail),
      ).toBeVisible({ timeout: 10000 });
      await myRooms.infoPanel.close();

      // Owner starts filling and submits own form
      await myRooms.filesTable.openContextMenuForItem(OWNER_FORM);
      await myRooms.filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.startFilling,
      );
      await shortTour.clickModalCloseButton();
      await myRooms.filesTable.expectFillingIconVisible(OWNER_FORM);
      await fillAndSubmit(OWNER_FORM);

      await page.context().clearCookies();
    });

    // Phase 2: CC uploads own form, submits own form, submits owner's form,
    // then verifies syncResponsesToXlsx access in Complete without logging out.
    await test.step("ContentCreator: upload own form and submit both forms", async () => {
      await login.loginWithCredentials(
        contentCreatorEmail,
        contentCreatorPassword,
      );
      await myRooms.roomsTable.openRoomByName(roomName);
      await shortTour.clickSkipTour();

      // Upload CC's own form from DocSpace templates
      await myRooms.filesNavigation.openCreateDropdown();
      await myRooms.filesNavigation.contextMenu.clickSubmenuOption(
        "Upload PDF form",
        "From DocSpace",
      );
      const selectPanel = new RoomSelectPanel(page);
      await selectPanel.checkSelectorExist();
      await selectPanel.select("documents");
      await selectPanel.selectItemByText(CC_FORM);
      await selectPanel.confirmSelection();
      await page.waitForLoadState("load");
      await expect(page.getByText(CC_FORM)).toBeVisible();

      // CC starts filling and submits own form
      await myRooms.filesTable.openContextMenuForItem(CC_FORM);
      await myRooms.filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.startFilling,
      );
      await shortTour.clickModalCloseButton();
      await myRooms.filesTable.expectFillingIconVisible(CC_FORM);
      await fillAndSubmit(CC_FORM);

      // CC also submits owner's form (already in filling mode from Phase 1)
      await fillAndSubmit(OWNER_FORM);
    });

    await test.step("ContentCreator navigates to Complete folder", async () => {
      await myRooms.filesTable.openContextMenuForItem(
        formFillingSystemFolders.complete,
      );
      await myRooms.filesTable.contextMenu.clickOption(
        folderContextMenuOption.open,
      );
      await expect(
        page.getByRole("heading", {
          name: formFillingSystemFolders.complete,
        }),
      ).toBeVisible();
    });

    await test.step("Verify Sync responses to XLSX IS visible for CC on own form submission folder", async () => {
      await myRooms.filesTable.openContextMenuForItem(CC_FORM);
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          folderContextMenuOption.syncResponsesToXlsx,
        ),
      ).toBeVisible();
      await myRooms.filesTable.contextMenu.close();
    });

    await test.step("Verify Sync responses to XLSX is NOT visible for CC on owner's form submission folder", async () => {
      await myRooms.filesTable.openContextMenuForItem(OWNER_FORM);
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          folderContextMenuOption.open,
        ),
      ).toBeVisible(); // anchor: confirms menu is fully loaded
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          folderContextMenuOption.syncResponsesToXlsx,
        ),
      ).not.toBeVisible();
      await myRooms.filesTable.contextMenu.close();
    });
  });
});
