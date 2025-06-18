import { expect, Page } from "@playwright/test";

import BaseNavigation from "../common/BaseNavigation";
import BaseTable from "../common/BaseTable";
import TrashSelector from "./TrashSelector";
import TrashEmptyView from "./TrashEmptyView";
import BaseDialog from "../common/BaseDialog";
import BaseFilter from "../common/BaseFilter";
import InfoPanel from "../common/InfoPanel";

const navActions = {
  restore: {
    button: "#menu-restore",
  },
  delete: {
    button: "#menu-delete",
    submit: "#delete-file-modal_submit",
  },
} as const;

class Trash {
  private page: Page;

  navigation: BaseNavigation;
  trashTable: BaseTable;
  trashEmptyView: TrashEmptyView;

  dialog: BaseDialog;
  trashSelector: TrashSelector;
  filter: BaseFilter;
  infoPanel: InfoPanel;

  constructor(page: Page) {
    this.page = page;

    this.navigation = new BaseNavigation(page, navActions);
    this.trashTable = new BaseTable(page.locator("#table-container"));
    this.trashEmptyView = new TrashEmptyView(page);
    this.dialog = new BaseDialog(page);
    this.trashSelector = new TrashSelector(page);
    this.filter = new BaseFilter(page);
    this.infoPanel = new InfoPanel(page);
  }

  async open() {
    await this.page.locator("#document_catalog-trash").click();
    await this.page.waitForLoadState("load");
    await expect(this.page).toHaveURL(/.*files\/trash.*/);
  }

  async openRestoreSelector() {
    await this.trashTable.selectAllRows();
    await this.navigation.performAction(navActions.restore);
    await this.trashSelector.checkSelectorExist();
  }

  async deleteForever() {
    await this.trashTable.selectAllRows();
    await this.navigation.performAction(navActions.delete);
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
    await this.trashSelector.checkSelectorExist();
  }

  // async hideLastActivityColumn() {
  //   await this.archiveTable.hideTableColumn(
  //     this.page.locator(LAST_ACTIVITY_CHECKBOX),
  //   );
  // }
}

export default Trash;
