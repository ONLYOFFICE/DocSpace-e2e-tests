import { test } from "@/src/fixtures";
import { expect, Page } from "@playwright/test";
import FilesPdfForm from "@/src/objects/files/FilesPdfForm";
import MyRooms from "@/src/objects/rooms/Rooms";
import { ShortTour } from "@/src/objects/rooms/ShortTourModal";
import RoomInfoPanel from "@/src/objects/rooms/RoomInfoPanel";
import RoomsInviteDialog from "@/src/objects/rooms/RoomsInviteDialog";
import Login from "@/src/objects/common/Login";
import FolderDeleteModal from "@/src/objects/files/FolderDeleteModal";
import {
  folderContextMenuOption,
  formFillingRoomPdfContextMenuOption,
  pdfFormContextMenuOption,
  pdfFormDownloadSubmenu,
} from "@/src/utils/constants/files";

test.describe("FormFilling room - Form filler permissions", () => {
  let myRooms: MyRooms;
  let shortTour: ShortTour;
  let roomInfoPanel: RoomInfoPanel;
  let roomsInviteDialog: RoomsInviteDialog;
  let login: Login;

  let formFillerEmail: string;
  let formFillerPassword: string;
  let contentCreatorEmail: string;
  let roomName: string;
  let roomId: number;
  let ownerFolderName: string;

  test.beforeEach(async ({ page, api, apiSdk }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    shortTour = new ShortTour(page);
    roomInfoPanel = new RoomInfoPanel(page);
    roomsInviteDialog = new RoomsInviteDialog(page);
    login = new Login(page, api.portalDomain);

    // Create FormFilling room via API
    roomName = "FormFillingRoom_FormFiller";
    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: roomName,
      roomType: "FillingFormsRoom",
    });
    const roomBody = await roomResponse.json();
    roomId = roomBody.response.id;

    // Upload PDF file (version 1), then upload again to create version 2
    await apiSdk.files.uploadToFolder(
      "owner",
      roomId,
      "data/rooms/PDF from device.pdf",
    );
    await apiSdk.files.uploadToFolder(
      "owner",
      roomId,
      "data/rooms/PDF from device.pdf",
    );

    // Create a folder owned by the owner
    ownerFolderName = "OwnerFolder";
    await apiSdk.files.createFolder("owner", roomId, ownerFolderName);

    // Create Form filler user via API
    const { userData } = await apiSdk.profiles.addMember("owner", "User");
    formFillerEmail = userData.email;
    formFillerPassword = userData.password;

    // Create Content Creator user via API (used in info panel test to verify participant list visibility)
    const { userData: ccData } = await apiSdk.profiles.addMember(
      "owner",
      "User",
    );
    contentCreatorEmail = ccData.email;
  });

  test("Verify info panel and room permissions", async ({ page }) => {
    await test.step("Setup: Login as owner and add users via UI", async () => {
      await login.loginToPortal();
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(roomName);

      // Add user with Form filler role (default role in Form Filling rooms)
      await myRooms.infoPanel.open();
      await shortTour.clickSkipTour();
      await myRooms.infoPanel.openTab("Contacts");
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

      // Add Content Creator user (needed to verify filler can see participant list)
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

      // Clear cookies to logout from owner account
      await page.context().clearCookies();
    });

    await test.step("Login as Form filler", async () => {
      await login.loginWithCredentials(formFillerEmail, formFillerPassword);
      await myRooms.roomsTable.openRoomByName(roomName);
      const tourVisible = await shortTour.isTourVisible(6000);
      if (tourVisible) {
        await shortTour.clickSkipTour();
      }
    });

    await test.step("Verify Form filler CANNOT see Complete folder before filling", async () => {
      await expect(
        page
          .locator('[data-testid^="files-cell-name"]')
          .getByText("Complete", { exact: true }),
      ).not.toBeVisible();
    });

    await test.step("Verify Form filler CANNOT see In Process folder before filling", async () => {
      await expect(
        page
          .locator('[data-testid^="files-cell-name"]')
          .getByText("In process", { exact: true }),
      ).not.toBeVisible();
    });

    await test.step("Verify Form filler CANNOT invite users", async () => {
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await expect(roomInfoPanel.addUserButton).not.toBeVisible();
    });

    await test.step("Verify Form filler CANNOT change access level for participants", async () => {
      await expect(roomInfoPanel.memberContextMenuButtons).toHaveCount(0);
    });

    await test.step("Verify Form filler CAN view participant list", async () => {
      await expect(
        roomInfoPanel.getMemberByEmail(formFillerEmail),
      ).toBeVisible();
      await expect(
        roomInfoPanel.getMemberByEmail(contentCreatorEmail),
      ).toBeVisible();
    });

    await test.step("Verify Form filler CAN view room history", async () => {
      await myRooms.infoPanel.openTab("History");
      await expect(page.getByTestId("info_history_tab")).toBeVisible();
      await expect(page.getByText("Today")).toBeVisible();
    });

    await test.step("Verify Form filler CAN view Details tab", async () => {
      await myRooms.infoPanel.openTab("Details");
      await expect(page.getByTestId("info_details_tab")).toBeVisible();
    });

    await test.step("Verify Form filler CANNOT create/edit links", async () => {
      await expect(page.getByText("Link to fill out")).not.toBeVisible();
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

    await test.step("Verify Form filler has no create/upload button", async () => {
      await expect(page.locator("#header_add-button")).not.toBeVisible();
    });
  });

  test("Verify file and folder permissions", async ({ page }) => {
    await test.step("Setup: Login as owner, add Form filler user, and start filling", async () => {
      await login.loginToPortal();
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(roomName);

      await myRooms.infoPanel.open();
      await shortTour.clickSkipTour();
      await myRooms.infoPanel.openTab("Contacts");
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

      // Start filling the PDF form so Form filler gets the "Fill" option
      await myRooms.infoPanel.close();
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      await myRooms.filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.startFilling,
      );
      await shortTour.clickModalCloseButton();

      await page.context().clearCookies();
    });

    await test.step("Login as Form filler", async () => {
      await login.loginWithCredentials(formFillerEmail, formFillerPassword);
      await myRooms.roomsTable.openRoomByName(roomName);
      const tourVisible = await shortTour.isTourVisible(6000);
      if (tourVisible) {
        await shortTour.clickSkipTour();
      }
    });

    await test.step("Verify file context menu shows 'Download' option for PDF form", async () => {
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          pdfFormContextMenuOption.download,
        ),
      ).toBeVisible();
      await myRooms.filesTable.contextMenu.close();
    });

    await test.step("Verify file context menu shows 'Fill' option for PDF form", async () => {
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          formFillingRoomPdfContextMenuOption.fill,
        ),
      ).toBeVisible();
      await myRooms.filesTable.contextMenu.close();
    });

    await test.step("Verify Form filler CANNOT move or copy owner's folder", async () => {
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

    await test.step("Verify Form filler CANNOT delete owner's folder", async () => {
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

    await test.step("Verify Form filler CANNOT rename owner's folder", async () => {
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

    await test.step("Verify Form filler CANNOT view version history of PDF form", async () => {
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      // Anchor: fill option is visible, ensures menu is fully loaded
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          formFillingRoomPdfContextMenuOption.fill,
        ),
      ).toBeVisible();
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          pdfFormContextMenuOption.moreOptions,
        ),
      ).not.toBeVisible();
      await myRooms.filesTable.contextMenu.close();
    });

    await test.step("Verify Form filler CANNOT move or copy PDF form", async () => {
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          formFillingRoomPdfContextMenuOption.fill,
        ),
      ).toBeVisible();
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          pdfFormContextMenuOption.moveOrCopy,
        ),
      ).not.toBeVisible();
      await myRooms.filesTable.contextMenu.close();
    });

    await test.step("Verify Form filler CANNOT edit PDF form", async () => {
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          formFillingRoomPdfContextMenuOption.fill,
        ),
      ).toBeVisible();
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          pdfFormContextMenuOption.edit,
        ),
      ).not.toBeVisible();
      await myRooms.filesTable.contextMenu.close();
    });

    await test.step("Verify Form filler CANNOT block version of PDF form", async () => {
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          formFillingRoomPdfContextMenuOption.fill,
        ),
      ).toBeVisible();
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          pdfFormContextMenuOption.blockVersion,
        ),
      ).not.toBeVisible();
      await myRooms.filesTable.contextMenu.close();
    });

    await test.step("Verify Form filler CANNOT rename PDF form", async () => {
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          formFillingRoomPdfContextMenuOption.fill,
        ),
      ).toBeVisible();
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          pdfFormContextMenuOption.rename,
        ),
      ).not.toBeVisible();
      await myRooms.filesTable.contextMenu.close();
    });

    await test.step("Verify Form filler CANNOT delete PDF form", async () => {
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      // Anchor: fill option is visible to confirm menu is fully loaded
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          formFillingRoomPdfContextMenuOption.fill,
        ),
      ).toBeVisible();
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          pdfFormContextMenuOption.delete,
        ),
      ).not.toBeVisible();
      await myRooms.filesTable.contextMenu.close();
    });
  });

  test("Verify form filling workflow", async ({ page }) => {
    let pdfPage: Page;
    let pdfForm: FilesPdfForm;

    await test.step("Setup: Login as owner, add Form filler user, and start filling", async () => {
      await login.loginToPortal();
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(roomName);

      await myRooms.infoPanel.open();
      await shortTour.clickSkipTour();
      await myRooms.infoPanel.openTab("Contacts");
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

      // Start filling the PDF form so Form filler gets the "Fill" option
      await myRooms.infoPanel.close();
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      await myRooms.filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.startFilling,
      );
      await shortTour.clickModalCloseButton();

      await page.context().clearCookies();
    });

    await test.step("Login as Form filler", async () => {
      await login.loginWithCredentials(formFillerEmail, formFillerPassword);
      await myRooms.roomsTable.openRoomByName(roomName);
      const tourVisible = await shortTour.isTourVisible(6000);
      if (tourVisible) {
        await shortTour.clickSkipTour();
      }
    });

    await test.step("Verify Form filler CAN open PDF form and save as draft", async () => {
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      [pdfPage] = await Promise.all([
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
      pdfForm = new FilesPdfForm(pdfPage);
      await expect(pdfForm.submitButton).toBeVisible({ timeout: 60000 });
      // Closing the form tab saves it as a draft and triggers In Process folder to appear
      await pdfPage.close();
      await page.reload({ waitUntil: "load" });
    });

    await test.step("Verify In Process folder appears after opening and closing the form", async () => {
      await expect(
        page
          .locator('[data-testid^="files-cell-name"]')
          .getByText("In process", { exact: true }),
      ).toBeVisible();
    });

    await test.step("Verify Form filler CANNOT delete submission folder inside In process", async () => {
      await myRooms.filesTable.openContextMenuForItem("In process");
      await myRooms.filesTable.contextMenu.clickOption(
        folderContextMenuOption.open,
      );
      await expect(
        page.getByRole("heading", { name: "In process" }),
      ).toBeVisible();
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      // Anchor: open option is visible to confirm menu is fully loaded
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
      await myRooms.filesNavigation.gotoBack();
      await page.reload({ waitUntil: "load" });
    });

    await test.step("Verify filler CAN delete draft PDF from In process submission folder", async () => {
      await myRooms.filesTable.openContextMenuForItem("In process");
      await myRooms.filesTable.contextMenu.clickOption(
        folderContextMenuOption.open,
      );
      await expect(
        page.getByRole("heading", { name: "In process" }),
      ).toBeVisible();
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      await myRooms.filesTable.contextMenu.clickOption(
        folderContextMenuOption.open,
      );
      await expect(
        page.getByRole("heading", { name: "PDF from device" }),
      ).toBeVisible();
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      // Anchor: download is visible to confirm context menu is fully loaded
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          pdfFormContextMenuOption.download,
        ),
      ).toBeVisible();
      await myRooms.filesTable.contextMenu.clickOption(
        pdfFormContextMenuOption.delete,
      );
      const deleteModalInProcess = new FolderDeleteModal(page);
      await deleteModalInProcess.clickDeleteFolder();
      await myRooms.removeToast("successfully moved to Trash");
      await expect(
        page.getByText("No files in this folder yet"),
      ).toBeVisible();
      await myRooms.filesNavigation.gotoBack();
      await expect(
        page.getByRole("heading", { name: "In process" }),
      ).toBeVisible();
      await myRooms.filesNavigation.gotoBack();
      await page.reload({ waitUntil: "load" });
    });

    await test.step("Verify PDF form editor shows 'Download as PDF' and 'Print' buttons", async () => {
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      [pdfPage] = await Promise.all([
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
      pdfForm = new FilesPdfForm(pdfPage);
      await expect(pdfForm.submitButton).toBeVisible({ timeout: 60000 });
      await pdfForm.openMenu();
      await expect(pdfForm.printButton).toBeVisible();
      await expect(pdfForm.downloadAsPdfButton).toBeVisible();
    });

    await test.step("Verify Form filler CAN submit the form", async () => {
      const completedPage = await pdfForm.clickSubmitButton();
      await completedPage.waitForPageLoad();
      await pdfPage.close();
      await page.reload({ waitUntil: "load" });
    });

    await test.step("Verify Complete folder appears in room after form submission", async () => {
      await expect(
        page
          .locator('[data-testid^="files-cell-name"]')
          .getByText("Complete", { exact: true }),
      ).toBeVisible();
    });

    await test.step("Verify Form filler CANNOT delete submission folder inside Complete", async () => {
      await myRooms.filesTable.openContextMenuForItem("Complete");
      await myRooms.filesTable.contextMenu.clickOption(
        folderContextMenuOption.open,
      );
      await expect(
        page.getByRole("heading", { name: "Complete" }),
      ).toBeVisible();
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      // Anchor: open option is visible to confirm menu is fully loaded
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
      await myRooms.filesNavigation.gotoBack();
      await page.reload({ waitUntil: "load" });
    });

    await test.step("Verify filler CAN delete submitted PDF from Complete submission folder", async () => {
      await myRooms.filesTable.openContextMenuForItem("Complete");
      await myRooms.filesTable.contextMenu.clickOption(
        folderContextMenuOption.open,
      );
      await expect(
        page.getByRole("heading", { name: "Complete" }),
      ).toBeVisible();
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      await myRooms.filesTable.contextMenu.clickOption(
        folderContextMenuOption.open,
      );
      await expect(
        page.getByRole("heading", { name: "PDF from device" }),
      ).toBeVisible();
      await myRooms.filesTable.openContextMenuForItem("PDF from device");
      // Anchor: download is visible to confirm context menu is fully loaded
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          pdfFormContextMenuOption.download,
        ),
      ).toBeVisible();
      await myRooms.filesTable.contextMenu.clickOption(
        pdfFormContextMenuOption.delete,
      );
      const deleteModalComplete = new FolderDeleteModal(page);
      await deleteModalComplete.clickDeleteFolder();
      await myRooms.removeToast("successfully moved to Trash");
      await expect(
        page.getByText("No files in this folder yet"),
      ).toBeVisible();
      await myRooms.filesNavigation.gotoBack();
      await expect(
        page.getByRole("heading", { name: "Complete" }),
      ).toBeVisible();
      await myRooms.filesNavigation.gotoBack();
      await page.reload({ waitUntil: "load" });
    });

    await test.step("Verify Form filler CAN download PDF form via context menu", async () => {
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
  });
});
