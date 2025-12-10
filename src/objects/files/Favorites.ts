import { expect, Page } from "@playwright/test";
import BasePage from "../common/BasePage";
import FilesTable from "./FilesTable";
import FilesFilter from "./FilesFilter";

const FAVORITES_NAV_ITEM = "#document_catalog-favorites";

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
    await this.page.goto(`https://${this.portalDomain}/files/favorite/filter`);
    await this.waitForFavoritesPage();
  }

  async openFromNavigation() {
    const navItem = this.page.locator(FAVORITES_NAV_ITEM);
    await expect(navItem).toBeVisible();
    await navItem.click();
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
}

export default Favorites;
