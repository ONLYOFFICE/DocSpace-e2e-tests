import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import MyRooms from "@/src/objects/rooms/Rooms";
import { ShortTour } from "@/src/objects/rooms/ShortTourModal";
import RoomInfoPanel from "@/src/objects/rooms/RoomInfoPanel";
import RoomsInviteDialog from "@/src/objects/rooms/RoomsInviteDialog";
import Login from "@/src/objects/common/Login";
import ConflictResolveDialog from "@/src/objects/files/ConflictResolveDialog";
import FileVersionHistory from "@/src/objects/files/FileVersionHistory";
// import FilesPdfForm from "@/src/objects/files/FilesPdfForm"; // used in disabled Print step
import RoomSelectPanel from "@/src/objects/rooms/RoomSelectPanel";
import {
  folderContextMenuOption,
  // formFillingRoomPdfContextMenuOption, // used in disabled Print step
  pdfFormContextMenuOption,
  pdfFormMoreOptionsSubmenu,
} from "@/src/utils/constants/files";

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

    // Create FormFilling room via API
    roomName = "FormFillingRoom_ContentCreator";
    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: roomName,
      roomType: "FillingFormsRoom",
    });
    const roomBody = await roomResponse.json();
    roomId = roomBody.response.id;

    // Upload a PDF file to the room
    await apiSdk.files.uploadToFolder(
      "owner",
      roomId,
      "data/rooms/PDF from device.pdf",
    );

    // Create a folder owned by the owner (used to verify CC cannot delete/move other users' items)
    ownerFolderName = "OwnerFolder";
    await apiSdk.files.createFolder("owner", roomId, ownerFolderName);

    // Create Content creator user via API
    const { userData } = await apiSdk.profiles.addMember("owner", "User");
    contentCreatorEmail = userData.email;
    contentCreatorPassword = userData.password;

    // Create a second user (will be added to room via UI in test Setup step)
    const { userData: formFillerData } = await apiSdk.profiles.addMember(
      "owner",
      "User",
    );
    formFillerEmail = formFillerData.email;
  });

  test("Add user with Content creator role and verify permissions", async ({
    page,
  }) => {
    await test.step("Setup: Login as owner and add Content creator user via UI", async () => {
      // Login as owner
      await login.loginToPortal();

      // Navigate to the room
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
      ).toBeVisible({
        timeout: 10000,
      });

      // Add second user (Form filler) via UI - formFiller is default access, no need to change
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.openPeopleList();
      await roomsInviteDialog.contactsPanel.selectUserByEmail(formFillerEmail);
      await roomsInviteDialog.contactsPanel.clickSelectButton();
      await roomsInviteDialog.verifyUserRole(formFillerEmail, "Form filler");
      await roomsInviteDialog.submitInviteDialog();

      await myRooms.infoPanel.openTab("Contacts");
      await expect(roomInfoPanel.getMemberByEmail(formFillerEmail)).toBeVisible(
        {
          timeout: 10000,
        },
      );

      // Clear cookies to logout from owner account
      await page.context().clearCookies();
    });

    await test.step("Login as Content creator", async () => {
      await login.loginWithCredentials(
        contentCreatorEmail,
        contentCreatorPassword,
      );
      // Navigate to My Rooms page
      // await myRooms.openWithoutEmptyCheck();
      // Open the room
      await myRooms.roomsTable.openRoomByName(roomName);
      // Skip tour
      await shortTour.clickSkipTour();
    });
    await test.step("Verify Content creator CAN access Complete folder", async () => {
      await myRooms.filesTable.openContextMenuForItem("Complete");
      await myRooms.filesTable.contextMenu.clickOption("Open");
      await expect(
        page.getByRole("heading", { name: "Complete" }),
      ).toBeVisible();
      await myRooms.navigation.gotoBack();
      await page.waitForLoadState("domcontentloaded");
    });

    await test.step("Verify Content creator CAN access In Process folder", async () => {
      await myRooms.filesTable.openContextMenuForItem("In process");
      await myRooms.filesTable.contextMenu.clickOption("Open");
      await expect(
        page.getByRole("heading", { name: "In process" }),
      ).toBeVisible();
      await myRooms.navigation.gotoBack();
      await page.waitForLoadState("load");
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

    await test.step("Verify room context menu has no 'Edit room' option", async () => {
      await myRooms.infoPanel.close();
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
    });

    await test.step("Verify file context menu shows 'Download' option", async () => {
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          pdfFormContextMenuOption.download,
        ),
      ).toBeVisible();
      await myRooms.filesTable.contextMenu.close();
    });

    await test.step("Verify file context menu has no 'Edit' option for PDF form", async () => {
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          pdfFormContextMenuOption.edit,
        ),
      ).not.toBeVisible();
      await myRooms.filesTable.contextMenu.close();
    });

    await test.step("Verify file context menu has no 'Block' option for PDF form", async () => {
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          pdfFormContextMenuOption.blockVersion,
        ),
      ).not.toBeVisible();
      await myRooms.filesTable.contextMenu.close();
    });

    await test.step("Verify Content creator CAN delete own files and folders", async () => {
      await myRooms.filesTable.openContextMenuForItem("TestFolder");
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          folderContextMenuOption.delete,
        ),
      ).toBeVisible();
      await myRooms.filesTable.contextMenu.close();
    });

    await test.step("Verify Content creator CAN move or copy own files and folders", async () => {
      await myRooms.filesTable.openContextMenuForItem("TestFolder");
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          folderContextMenuOption.moveOrCopy,
        ),
      ).toBeVisible();
      await myRooms.filesTable.contextMenu.close();
    });

    await test.step("Verify Content creator CANNOT delete other users' files and folders", async () => {
      await myRooms.filesTable.openContextMenuForItem(ownerFolderName);
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
          folderContextMenuOption.moveOrCopy,
        ),
      ).not.toBeVisible();
      await myRooms.filesTable.contextMenu.close();
    });

    await test.step("Verify Content creator CANNOT rename other users' files and folders", async () => {
      await myRooms.filesTable.openContextMenuForItem(ownerFolderName);
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          folderContextMenuOption.rename,
        ),
      ).not.toBeVisible();
      await myRooms.filesTable.contextMenu.close();
    });

    await test.step("Verify Content creator CAN upload PDF forms", async () => {
      await myRooms.filesNavigation.openCreateDropdown();
      const [fileChooser] = await Promise.all([
        page.waitForEvent("filechooser"),
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
      await shortTour.clickModalCloseButton().catch(() => {});

      await page.waitForLoadState("load");
      await expect(page.getByText("ONLYOFFICE Resume Sample")).toBeVisible();
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

    // TODO: step disabled due to a bug — re-enable once fixed
    // await test.step("Verify Content creator CAN print PDF form in editor", async () => {
    //   await myRooms.filesTable.openContextMenuForItem("PDF from device");
    //   const [pdfPage] = await Promise.all([
    //     page.context().waitForEvent("page"),
    //     myRooms.filesTable.contextMenu.clickOption(
    //       formFillingRoomPdfContextMenuOption.startFilling,
    //     ),
    //   ]);
    //   await pdfPage.waitForLoadState("load");
    //   await pdfPage.waitForSelector('iframe[name="frameEditor"]', {
    //     state: "attached",
    //     timeout: 60000,
    //   });
    //   const pdfForm = new FilesPdfForm(pdfPage);
    //   await expect(pdfForm.submitButton).toBeVisible({ timeout: 60000 });
    //   await pdfForm.openMenu();
    //   await pdfForm.verifyDownloadAndPrintButtonsVisible();
    //   await pdfPage.close();
    // });
  });
});
