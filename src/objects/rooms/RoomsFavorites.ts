import { expect, Page } from "@playwright/test";
import BasePage from "../common/BasePage";
import FilesTable from "../files/FilesTable";
import FilesFilter from "../files/FilesFilter";
import { apps, roomsSubItems } from "@/src/utils/constants/navigation";

class RoomsFavorites extends BasePage {
  filesTable: FilesTable;
  filesFilter: FilesFilter;

  constructor(page: Page) {
    super(page);
    this.filesTable = new FilesTable(page);
    this.filesFilter = new FilesFilter(page);
  }

  async openFromNavigation() {
    await this.sidebar.openSubItem(apps.rooms, roomsSubItems.favorites);
    await expect(this.page).toHaveURL(/\/rooms\/favorite/);
  }

  async checkNoFavoriteFilesTextExist() {
    await expect(
      this.page.getByText("No favorite files yet", { exact: true }),
    ).toBeVisible();
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

export default RoomsFavorites;
