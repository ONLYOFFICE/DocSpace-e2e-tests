import { expect, Page } from "@playwright/test";

import BaseNavigation from "../common/BaseNavigation";
import BaseTable from "../common/BaseTable";
import TrashSelector from "./TrashSelector";
import TrashEmptyView from "./TrashEmptyView";
import BaseDialog from "../common/BaseDialog";
import BaseFilter from "../common/BaseFilter";
import InfoPanel from "../common/InfoPanel";
import BasePage from "../common/BasePage";
import { toastMessages } from "@/src/utils/constants/trash";

const navActions = {
  restore: {
    button: "#menu-restore",
  },
  delete: {
    button: "#menu-delete",
    submit: "#delete-file-modal_submit",
  },
} as const;

class Trash extends BasePage {
  navigation: BaseNavigation;
  trashTable: BaseTable;
  trashEmptyView: TrashEmptyView;

  dialog: BaseDialog;
  trashSelector: TrashSelector;
  filter: BaseFilter;
  infoPanel: InfoPanel;

  constructor(page: Page) {
    super(page);

    this.navigation = new BaseNavigation(page, navActions);
    this.trashTable = new BaseTable(page);
    this.trashEmptyView = new TrashEmptyView(page);
    this.dialog = new BaseDialog(page);
    this.trashSelector = new TrashSelector(page);
    this.filter = new BaseFilter(page);
    this.infoPanel = new InfoPanel(page);
  }

  async open() {
    await this.page.locator("#document_catalog-trash").click();
    await expect(this.page).toHaveURL(/.*files\/trash.*/);
    await this.page.waitForLoadState("load");
  }

  async openRestoreSelector() {
    await this.trashTable.selectAllRows();
    await this.navigation.performAction(navActions.restore);
    await this.trashSelector.checkSelectorExist();
  }

  async deleteForever() {
    await this.trashTable.selectAllRows();
    await this.navigation.performAction(navActions.delete);
    await this.removeToast(toastMessages.deleted);
    await this.trashEmptyView.checkNoDocsTextExist();
  }

  async checkActionRequiredDialogExist() {
    await this.dialog.checkDialogTitleExist("Action required");
  }

  async closeActionRequiredDialog() {
    await this.dialog.close();
  }

  async openEmptyTrashDialog(source: "header" | "table") {
    switch (source) {
      case "header":
        await this.navigation.openContextMenu();
        await this.navigation.performAction({
          button: "#header_option_empty-trash",
        });
        break;
      case "table":
        await this.trashTable.openContextMenuRow(
          this.trashTable.tableRows.first(),
        );
        await this.page.locator("#option_delete").click();
        break;
    }
    await this.dialog.checkDialogTitleExist("Delete forever?");
    await this.dialog.close();
  }

  async openRestoreAllSelector() {
    await this.navigation.openContextMenu();
    await this.navigation.performAction({
      button: "#header_option_restore-all",
    });
    await this.removeToast(toastMessages.restored);
    await this.trashSelector.checkSelectorExist();
  }
}

export default Trash;
