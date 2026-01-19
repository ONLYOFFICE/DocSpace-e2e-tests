import { expect, Page } from "@playwright/test";
import RoomsEmptyView from "./RoomsEmptyView";
import RoomsCreateDialog from "./RoomsCreateDialog";
import BaseNavigation from "../common/BaseNavigation";
import InfoPanel from "../common/InfoPanel";
import RoomsTable from "./RoomsTable";
import RoomsTypesDropdown from "./RoomsTypeDropdown";
import FilesNavigation from "../files/FilesNavigation";
import {
  roomCreateTitles,
  roomDialogSource,
  roomToastMessages,
  TRoomDialogSource,
} from "@/src/utils/constants/rooms";
import RoomsArticle from "./RoomsArticle";
import RoomsEditDialog from "./RoomsEditDialog";
import RoomsChangeOwnerDialog from "./RoomsChangeOwnerDialog";
import RoomsAccessSettingsDialog from "./RoomsAccessSettingsDialog";
import RoomsFilter from "./RoomsFilter";
import BaseInviteDialog from "../common/BaseInviteDialog";
import BasePage from "../common/BasePage";
import BaseSelector from "../common/BaseSelector";
import BaseToast from "../common/BaseToast";
import FilesTable from "../files/FilesTable";

const navActions = {
  moveToArchive: {
    button: "#menu-archive",
    submit: "#shared_move-to-archived-modal_submit",
  },
  delete: {
    button: "#menu-delete",
    submit: "#delete-file-modal_submit",
    confirmCheckboxSelector: "#modal-dialog label[data-testid='checkbox']",
  },
} as const;

class MyRooms extends BasePage {
  private portalDomain: string;

  roomsEmptyView: RoomsEmptyView;
  roomsCreateDialog: RoomsCreateDialog;
  roomsChangeOwnerDialog: RoomsChangeOwnerDialog;
  navigation: BaseNavigation;
  infoPanel: InfoPanel;
  roomsTable: RoomsTable;
  roomsTypeDropdown: RoomsTypesDropdown;
  filesNavigation: FilesNavigation;
  roomsArticle: RoomsArticle;
  roomsEditDialog: RoomsEditDialog;
  roomsAccessSettingsDialog: RoomsAccessSettingsDialog;
  roomsFilter: RoomsFilter;
  inviteDialog: BaseInviteDialog;
  selector: BaseSelector;
  filesTable: FilesTable;
  toast: BaseToast;

  constructor(page: Page, portalDomain: string) {
    super(page);
    this.portalDomain = portalDomain;

    this.navigation = new BaseNavigation(page, navActions);
    this.infoPanel = new InfoPanel(page);
    this.roomsTable = new RoomsTable(page);
    this.roomsEmptyView = new RoomsEmptyView(page);
    this.roomsCreateDialog = new RoomsCreateDialog(page);
    this.roomsTypeDropdown = new RoomsTypesDropdown(page);
    this.filesNavigation = new FilesNavigation(page);
    this.roomsArticle = new RoomsArticle(page);
    this.roomsEditDialog = new RoomsEditDialog(page);
    this.roomsChangeOwnerDialog = new RoomsChangeOwnerDialog(page);
    this.roomsAccessSettingsDialog = new RoomsAccessSettingsDialog(page);
    this.roomsFilter = new RoomsFilter(page);
    this.inviteDialog = new BaseInviteDialog(page);
    this.selector = new BaseSelector(page);
    this.filesTable = new FilesTable(page);
    this.toast = new BaseToast(page);
  }

  async open() {
    await this.page.goto(`https://${this.portalDomain}/rooms/shared`, {
      waitUntil: "load",
    });
    await expect(this.page).toHaveURL(/.*rooms\/shared.*/);
    await this.roomsEmptyView.checkNoRoomsExist();
  }

  async openWithoutEmptyCheck() {
    await this.page.goto(`https://${this.portalDomain}/rooms/shared`, {
      waitUntil: "load",
    });
    await expect(this.page).toHaveURL(/.*rooms\/shared.*/);
  }

  async openTemplatesTab() {
    await this.page.getByTestId("templates_tab").click();
  }

  async openRoomsTab() {
    await this.page.locator("span").filter({ hasText: "Rooms" }).click();
  }

  async checkHeadingExist(name: string) {
    await expect(
      this.page.getByRole("heading", { name, level: 1 }),
    ).toBeVisible();
  }

  async backToRooms() {
    await this.navigation.gotoBack();
    await this.roomsTable.checkTableExist();
  }

  async openCreateRoomDialog(source: TRoomDialogSource) {
    switch (source) {
      case roomDialogSource.navigation:
        await this.navigation.clickAddButton();
        break;
      case roomDialogSource.emptyView:
        await this.roomsEmptyView.openCreateDialog();
        break;
      case roomDialogSource.article:
        await this.roomsArticle.openCreateDialog();
        break;
    }
    await this.roomsCreateDialog.checkRoomTypeExist(roomCreateTitles.public);
  }

  async createRooms() {
    for (const roomType of Object.values(roomCreateTitles)) {
      if (roomType === roomCreateTitles.fromTemplate) {
        continue;
      }
      await this.openCreateRoomDialog(roomDialogSource.navigation);
      await this.roomsCreateDialog.openRoomType(roomType);
      await this.roomsCreateDialog.openRoomCover();
      await this.roomsCreateDialog.createRoomWithCover(roomType);

      if (roomType === roomCreateTitles.formFilling) {
        const tipsModal = this.page.getByText(
          "Welcome to the Form Filling Room!",
        );
        await expect(tipsModal).toBeVisible({ timeout: 10000 });
        await this.page.mouse.click(1, 1);
      }

      await this.roomsEmptyView.checkEmptyRoomExist(roomType);
      await this.backToRooms();
    }
  }
  async createFormFillingRoom(roomName: string, tags?: string[]) {
    await this.roomsArticle.openCreateDialog();
    await this.roomsCreateDialog.openRoomType(roomCreateTitles.formFilling);
    await this.roomsCreateDialog.openRoomCover();
    await this.roomsCreateDialog.selectCoverColor();
    await this.roomsCreateDialog.selectCoverIcon();
    await this.roomsCreateDialog.saveCover();
    await this.roomsCreateDialog.fillRoomName(roomName);

    // Add tags if they are provided
    if (tags?.length) {
      for (const tag of tags) {
        await this.roomsCreateDialog.createTag(tag);
      }
    }
    await this.roomsCreateDialog.clickRoomDialogSubmit();
    const tipsModal = this.page.getByText("Welcome to the Form Filling Room!");
    await expect(tipsModal).toBeVisible({ timeout: 10000 });
  }
  async moveAllRoomsToArchive() {
    await this.roomsTable.selectAllRows();
    await this.navigation.performAction(navActions.moveToArchive);
    await this.removeToast(roomToastMessages.roomsArchived);
  }

  async moveToArchive() {
    await expect(this.page.getByText("Move to Archive?")).toBeVisible();
    await this.page.locator("#shared_move-to-archived-modal_submit").click();
  }

  async deleteAllRooms() {
    await this.roomsTable.selectAllRows();
    await this.navigation.performAction(navActions.delete);
    await this.removeToast(roomToastMessages.selectedTemplatesDeleted);
  }

  async openRoom(roomName: string) {
    await this.roomsTable.openContextMenu(roomName);
    await this.roomsTable.contextMenu.clickOption("Open");
  }
}

export default MyRooms;
