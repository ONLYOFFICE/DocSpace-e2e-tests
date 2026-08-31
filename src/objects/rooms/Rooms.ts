import { expect, Page } from "@playwright/test";
import { getPortalUrl } from "../../../config";
import RoomsEmptyView from "./RoomsEmptyView";
import RoomsCreateDialog from "./RoomsCreateDialog";
import BaseNavigation from "../common/BaseNavigation";
import InfoPanel from "../common/InfoPanel";
import RoomsTable from "./RoomsTable";
import RoomsTypesDropdown from "./RoomsTypeDropdown";
import FilesNavigation from "../files/FilesNavigation";
import {
  roomContextMenuOption,
  roomCreateTitles,
  roomDialogSource,
  roomToastMessages,
  roomTypesCreatableFromRooms,
  formFillingSystemFolders,
  TRoomDialogSource,
} from "@/src/utils/constants/rooms";
import QuickActions from "../common/QuickActions";
import {
  apps,
  roomsSubItems,
  formsSubItems,
} from "@/src/utils/constants/navigation";
import RoomsEditDialog from "./RoomsEditDialog";
import RoomsEditTemplateDialog from "./RoomsEditTemplateDialog";
import RoomsChangeOwnerDialog from "./RoomsChangeOwnerDialog";
import RoomsAccessSettingsDialog from "./RoomsAccessSettingsDialog";
import RoomTemplateDeleteModal from "./RoomTemplateDeleteModal";
import RoomsFilter from "./RoomsFilter";
import BaseInviteDialog from "../common/BaseInviteDialog";
import BasePage from "../common/BasePage";
import BaseSelector from "../common/BaseSelector";
import BaseToast from "../common/BaseToast";
import FilesTable from "../files/FilesTable";
import RoomsGroupTags from "./RoomsGroupTags";
import DocumentEditor from "../files/DocumentEditor";
import { documentContextMenuOption } from "@/src/utils/constants/files";
import { formsSectionEmptyView } from "@/src/utils/constants/forms";

const navActions = {
  moveToArchive: {
    button: "#menu-archive",
    submit: "#shared_move-to-archived-modal_submit",
  },
  delete: {
    button: "#menu-delete-room",
    submit: "#delete-file-modal_submit",
    confirmCheckboxSelector:
      "#modal-dialog label[data-testid='delete_warning_checkbox']",
  },
  pin: {
    button: "#menu-pin",
  },
} as const;

const DRAFT_LABEL = "badge-text";
const ARTICLE_CONTAINER = "#article-container";
const ROOM_STORAGE_WARNING = ".warning-text";
const CREATE_FORM_SET_OPTION = "create-form-set";

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
  quickActions: QuickActions;
  roomsEditDialog: RoomsEditDialog;
  roomsEditTemplateDialog: RoomsEditTemplateDialog;
  roomsAccessSettingsDialog: RoomsAccessSettingsDialog;
  roomTemplateDeleteModal: RoomTemplateDeleteModal;
  roomsFilter: RoomsFilter;
  inviteDialog: BaseInviteDialog;
  selector: BaseSelector;
  filesTable: FilesTable;
  toast: BaseToast;
  roomsGroupTags: RoomsGroupTags;

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
    this.quickActions = new QuickActions(page);
    this.roomsEditDialog = new RoomsEditDialog(page);
    this.roomsEditTemplateDialog = new RoomsEditTemplateDialog(page);
    this.roomsChangeOwnerDialog = new RoomsChangeOwnerDialog(page);
    this.roomsAccessSettingsDialog = new RoomsAccessSettingsDialog(page);
    this.roomTemplateDeleteModal = new RoomTemplateDeleteModal(page);
    this.roomsFilter = new RoomsFilter(page);
    this.inviteDialog = new BaseInviteDialog(page);
    this.selector = new BaseSelector(page);
    this.filesTable = new FilesTable(page);
    this.toast = new BaseToast(page);
    this.roomsGroupTags = new RoomsGroupTags(page);
  }

  async open() {
    await this.page.goto(`${getPortalUrl(this.portalDomain)}/rooms/shared`, {
      waitUntil: "load",
    });
    await expect(this.page).toHaveURL(/.*rooms\/shared.*/);
    await this.roomsEmptyView.checkNoRoomsExist();
  }

  async openWithoutEmptyCheck() {
    await expect(async () => {
      await this.page.goto(`${getPortalUrl(this.portalDomain)}/rooms/shared`, {
        waitUntil: "load",
      });
    }).toPass({ timeout: 30000 });
    await expect(this.page).toHaveURL(/.*rooms\/shared.*/);
    await expect(this.page.locator(ARTICLE_CONTAINER)).toBeVisible();
  }

  // Rooms and Templates used to be tabs on the rooms page; they are now items in
  // the app sidebar (the templates_tab / rooms_tab testids no longer exist).
  async openTemplates() {
    await this.sidebar.openSubItem(apps.rooms, roomsSubItems.templates);
  }

  async openRooms() {
    await this.sidebar.navigate(apps.rooms);
  }

  async openForms() {
    await this.sidebar.navigate(apps.forms);
    await expect(this.page.locator(ARTICLE_CONTAINER)).toBeVisible();
  }

  async openFormsRecent() {
    await this.sidebar.openSubItem(apps.forms, formsSubItems.recent);
  }

  async openFormsFavorites() {
    await this.sidebar.openSubItem(apps.forms, formsSubItems.favorites);
  }

  private get emptyView() {
    return this.page.getByTestId("empty-view");
  }

  private async expectSectionEmptyView(section: {
    heading: string;
    title: string;
    description: string;
  }) {
    await expect(
      this.page.getByRole("heading", { name: section.heading, exact: true }),
    ).toBeVisible();
    await expect(this.emptyView).toBeVisible();
    await expect(this.emptyView.getByText(section.title)).toBeVisible();
    await expect(this.emptyView.getByText(section.description)).toBeVisible();
  }

  async expectFormsRecentEmptyView() {
    await this.expectSectionEmptyView(formsSectionEmptyView.recent);
  }

  async expectFormsFavoritesEmptyView() {
    await this.expectSectionEmptyView(formsSectionEmptyView.favorites);
  }

  async checkHeadingExist(name: string) {
    await expect(
      this.page.getByRole("heading", { name, level: 1 }),
    ).toBeVisible();
  }

  async backToRooms() {
    await this.navigation.gotoBack();
    await expect(this.page).toHaveURL(/\/rooms\/shared\/?(filter)?([?#].*)?$/);
    await expect(this.page.locator(ARTICLE_CONTAINER)).toBeVisible();
    await this.roomsTable.checkTableExist();
  }

  /**
   * Opens room creation. `navigation` and `emptyView` land on the room type
   * list; `quickActions` skips it and opens the create form for the tile's type,
   * so the type-list assertion only applies to the first two.
   */
  async openCreateRoomDialog(
    source: TRoomDialogSource,
    tileName: string = roomCreateTitles.public,
  ) {
    switch (source) {
      case roomDialogSource.navigation:
        await this.navigation.clickAddButton();
        break;
      case roomDialogSource.emptyView:
        await this.roomsEmptyView.openCreateDialog();
        break;
      case roomDialogSource.quickActions:
        await this.quickActions.click(tileName);
        await this.roomsCreateDialog.checkCreateFormExist();
        return;
    }
    await this.roomsCreateDialog.checkRoomTypeExist(roomCreateTitles.public);
  }

  async createRooms() {
    for (const roomType of roomTypesCreatableFromRooms) {
      await this.openCreateRoomDialog(roomDialogSource.navigation);
      await this.roomsCreateDialog.openRoomType(roomType);
      await this.roomsCreateDialog.createRoom(roomType);

      await this.roomsEmptyView.checkEmptyRoomExist(roomType);
      await this.backToRooms();
    }
  }
  // Form Set is only creatable from the Forms app now, not from Rooms.
  async openFormSetCreateDialog() {
    await this.sidebar.navigate(apps.forms);
    await this.navigation.openCreateDropdown();
    await this.navigation.contextMenu.clickOption({
      type: "data-testid",
      value: CREATE_FORM_SET_OPTION,
    });
    await this.roomsCreateDialog.openRoomType(roomCreateTitles.formSet);
  }

  async createFormFillingRoom(roomName: string, tags?: string[]) {
    await this.openFormSetCreateDialog();
    await this.roomsCreateDialog.fillRoomName(roomName);

    // Add tags if they are provided
    if (tags?.length) {
      for (const tag of tags) {
        await this.roomsCreateDialog.createTag(tag);
      }
    }
    await this.roomsCreateDialog.clickRoomDialogSubmit();
    // Tour tips modal is temporarily not shown; may come back later.
    // const tipsModal = this.page.getByText("Welcome to the Form Filling Room!");
    // await expect(tipsModal).toBeVisible({ timeout: 20000 });
    await this.checkHeadingExist(roomName);
  }
  async moveAllRoomsToArchive() {
    await this.roomsTable.selectAllRows();
    await this.archiveSelectedRooms();
  }

  async selectRooms(titles: string[]) {
    if (titles.length === 0) return;
    for (const title of titles) {
      const row = await this.roomsTable.getRowByTitle(title);
      await expect(row).toBeVisible();
      await row.locator("[data-testid='table-cell']").first().click();
      await this.roomsTable.expectRowIsChecked(row);
    }
  }

  async archiveSelectedRooms() {
    await this.navigation.performAction(navActions.moveToArchive);
    await this.removeToast(roomToastMessages.roomsArchived);
  }

  async deleteSelectedRooms() {
    await this.navigation.performAction(navActions.delete);
  }

  async pinSelectedRooms() {
    await this.navigation.performAction(navActions.pin);
  }

  async moveToArchive() {
    await expect(this.page.getByText("Move to Archive?")).toBeVisible();
    await this.page.locator("#shared_move-to-archived-modal_submit").click();
  }

  async downloadRoom(title: string) {
    const download = await this.waitForDownload(async () => {
      await this.roomsTable.openContextMenu(title);
      await this.roomsTable.clickContextMenuOption(
        roomContextMenuOption.manage,
      );
      await this.roomsTable.contextMenu.clickOption("Download");
    });
    expect(download.suggestedFilename().toLowerCase()).toContain(".zip");
    await download.delete();
  }

  async openRoom(roomName: string) {
    await this.roomsTable.openContextMenu(roomName);
    await this.roomsTable.contextMenu.clickOption("Open");
  }

  async openFileInEditorInSameTab(fileName: string): Promise<DocumentEditor> {
    await this.filesTable.openContextMenuForItem(fileName, true);
    await this.filesTable.contextMenu.clickOption(
      documentContextMenuOption.edit,
    );
    await this.page.waitForURL(/doceditor/, {
      waitUntil: "load",
      timeout: 30000,
    });
    const editor = new DocumentEditor(this.page);
    await editor.waitForLoad();
    return editor;
  }
  async verifyCompleteFolderVisible() {
    await expect(
      this.page.getByText(formFillingSystemFolders.complete, { exact: true }),
    ).toBeVisible();
  }

  async verifyCompleteFolderNotVisible() {
    await expect(
      this.page.getByText(formFillingSystemFolders.complete, { exact: true }),
    ).not.toBeVisible();
  }
  async verifyInProcessFolderVisible() {
    await expect(
      this.page.getByText(formFillingSystemFolders.inProcess, {
        exact: true,
      }),
    ).toBeVisible();
  }

  async verifyInProcessFolderNotVisible() {
    await expect(
      this.page.getByText(formFillingSystemFolders.inProcess, {
        exact: true,
      }),
    ).not.toBeVisible();
  }
  async verifyDraftLabelVisible() {
    await expect(this.page.getByTestId(DRAFT_LABEL)).toBeVisible();
  }

  async verifyDraftLabelNotVisible() {
    await expect(this.page.getByTestId(DRAFT_LABEL)).not.toBeVisible();
  }

  async expectRoomStorageLimitExceeded() {
    await expect(
      this.page
        .locator(ROOM_STORAGE_WARNING)
        .filter({ hasText: "Room storage limit exceeded" }),
    ).toBeVisible();
  }

  async expectRoomStorageLimitNotExceeded() {
    await expect(
      this.page
        .locator(ROOM_STORAGE_WARNING)
        .filter({ hasText: "Room storage limit exceeded" }),
    ).not.toBeVisible();
  }
}

export default MyRooms;
