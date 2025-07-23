import { expect, Page } from "@playwright/test";
import RoomsEmptyView from "./RoomsEmptyView";
import RoomsCreateDialog from "./RoomsCreateDialog";
import BaseNavigation from "../common/BaseNavigation";
import InfoPanel from "../common/InfoPanel";
import RoomsTable from "./RoomsTable";
import RoomsTypesDropdown from "./RoomsTypeDropdown";
import RoomsArticle from "./RoomsArticle";
import RoomsEditDialog from "./RoomsEditDialog";
import RoomsChangeOwnerDialog from "./RoomsChangeOwnerDialog";
import RoomsAccessSettingsDialog from "./RoomsAccessSettingsDialog";
import RoomsFilter from "./RoomsFilter";
import BaseInviteDialog from "../common/BaseInviteDialog";
import RoomEmptyView from "./RoomEmptyView";
import BaseSelector from "../common/BaseSelector";
import RoomsSelectPanel from "./RoomsSelectPanel";
import BaseToast from "../common/BaseToast";
import FilesTable from "../files/FilesTable";

const navActions = {
} as const;
const MODIFIED_CHECKBOX = ".table-container_settings-checkbox:has(span:text-is('Modified'))";

class FormFillingRoom {
  private page: Page;
 
  roomsEmptyView: RoomsEmptyView;
  roomsCreateDialog: RoomsCreateDialog;
  roomsChangeOwnerDialog: RoomsChangeOwnerDialog;
  navigation: BaseNavigation;
  infoPanel: InfoPanel;
  roomsTable: RoomsTable;
  roomsTypeDropdown: RoomsTypesDropdown;
  roomsArticle: RoomsArticle;
  roomsEditDialog: RoomsEditDialog;
  roomsAccessSettingsDialog: RoomsAccessSettingsDialog;
  roomsFilter: RoomsFilter;
  inviteDialog: BaseInviteDialog;
  roomEmptyView: RoomEmptyView;
  selector: BaseSelector;
  selectPanel: RoomsSelectPanel;
  filesTable: FilesTable;
  toast: BaseToast;
    constructor(page: Page) {
    this.page = page;
    this.navigation = new BaseNavigation(page, navActions);
    this.infoPanel = new InfoPanel(page);
    this.roomEmptyView = new RoomEmptyView(page);
    this.roomsTable = new RoomsTable(page);
    this.roomsEmptyView = new RoomsEmptyView(page);
    this.roomsCreateDialog = new RoomsCreateDialog(page);
    this.roomsTypeDropdown = new RoomsTypesDropdown(page);
    this.roomsArticle = new RoomsArticle(page);
    this.roomsEditDialog = new RoomsEditDialog(page);
    this.roomsChangeOwnerDialog = new RoomsChangeOwnerDialog(page);
    this.roomsAccessSettingsDialog = new RoomsAccessSettingsDialog(page);
    this.roomsFilter = new RoomsFilter(page);
    this.inviteDialog = new BaseInviteDialog(page);
    this.selector = new BaseSelector(page);
    this.selectPanel = new RoomsSelectPanel(page);
    this.filesTable = new FilesTable(page);
    this.toast = new BaseToast(page);
  }
  private get modifiedCheckbox() {
    return this.page.locator(MODIFIED_CHECKBOX);
  }
  async hideModifiedColumn() {
    await this.roomsTable.hideTableColumn(this.modifiedCheckbox);
  }
}
export default FormFillingRoom;
