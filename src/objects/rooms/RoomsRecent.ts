import { expect, Page } from "@playwright/test";
import BasePage from "../common/BasePage";
import FilesTable from "../files/FilesTable";
import FilesFilter from "../files/FilesFilter";
import InfoPanel from "../common/InfoPanel";
import { apps, roomsSubItems } from "@/src/utils/constants/navigation";

class RoomsRecent extends BasePage {
  filesTable: FilesTable;
  filesFilter: FilesFilter;
  infoPanel: InfoPanel;

  constructor(page: Page) {
    super(page);
    this.filesTable = new FilesTable(page);
    this.filesFilter = new FilesFilter(page);
    this.infoPanel = new InfoPanel(page);
  }

  async openFromNavigation() {
    await this.sidebar.openSubItem(apps.rooms, roomsSubItems.recent);
    await expect(this.page).toHaveURL(/\/rooms\/recent/);
  }

  async checkNoRecentFilesTextExist() {
    await expect(
      this.page.getByText("No recent files yet", { exact: true }),
    ).toBeVisible();
  }
}

export default RoomsRecent;
