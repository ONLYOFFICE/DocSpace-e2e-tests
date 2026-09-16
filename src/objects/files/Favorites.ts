import { expect, Page } from "@playwright/test";
import { getPortalUrl } from "../../../config";
import BasePage from "../common/BasePage";
import FilesTable from "./FilesTable";
import FilesFilter from "./FilesFilter";
import FilesSelectPanel from "./FilesSelectPanel";
import { apps, filesSubItems } from "@/src/utils/constants/navigation";
import { documentContextMenuOption } from "@/src/utils/constants/files";

class Favorites extends BasePage {
  private portalDomain: string;

  filesTable: FilesTable;
  filesFilter: FilesFilter;

  constructor(page: Page, portalDomain: string) {
    super(page);
    this.portalDomain = portalDomain;
    this.filesTable = new FilesTable(page);
    this.filesFilter = new FilesFilter(page);
  }

  private async waitForFavoritesPage() {
    await expect(this.page).toHaveURL(/files\/favorite/);
    await this.filesTable.checkTableExist();
  }

  async open() {
    await this.page.goto(
      `${getPortalUrl(this.portalDomain)}/files/favorite/filter`,
    );
    await this.waitForFavoritesPage();
  }

  async openFromNavigation() {
    await this.sidebar.openSubItem(apps.files, filesSubItems.favorites);
    await this.waitForFavoritesPage();
  }

  async searchFavorites(searchValue: string) {
    await this.filesFilter.fillFilesSearchInputAndCheckRequest(searchValue);
  }

  async clearSearch() {
    await this.filesFilter.clearSearchText();
  }

  async removeFromFavorites(itemName: string) {
    const row = await this.filesTable.getRowByTitle(itemName);
    const favoriteButton = row.locator(
      '[data-testid="icon-button"][data-iconname*="favorite"]',
    );
    await expect(favoriteButton).toBeVisible();
    await favoriteButton.click();
  }

  // Favorites offers a direct top-level "Copy" (no "Move or copy" submenu,
  // since it's a cross-cutting view, not a real folder you can move out of).
  // Right-clicking the row's name link, not the row container, since the
  // container's empty space right-clicks into the "New" file dropdown instead.
  async openCopyToFormsSelector(itemName: string) {
    const row = await this.filesTable.getRowByTitle(itemName);
    const nameLink = row.locator('[data-testid="link"]').first();
    await expect(nameLink).toBeVisible();
    await expect(async () => {
      await nameLink.click({ button: "right" });
      await expect(this.filesTable.contextMenu.menu).toBeVisible({
        timeout: 3000,
      });
    }).toPass({ timeout: 15000 });

    await this.filesTable.contextMenu.clickOption(documentContextMenuOption.copy);
    const filesSelectPanel = new FilesSelectPanel(this.page);
    await filesSelectPanel.checkSelectPanelOpen();
    await filesSelectPanel.gotoDocSpaceRoot();
    await filesSelectPanel.select("forms");
    return filesSelectPanel;
  }
}

export default Favorites;
