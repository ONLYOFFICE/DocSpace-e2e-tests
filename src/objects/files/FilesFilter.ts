import { expect, Page } from "@playwright/test";
import BaseFilter from "../common/BaseFilter";

const FILES_FILTER = {
  BY_FOLDERS: "#filter_type-folders",
  BY_MEDIA: "#filter_type-media",
} as const;

const TITLE_FOLDERS = "#folder-tile-heading";

class FilesFilter extends BaseFilter {
  constructor(page: Page) {
    super(page);
  }

  async selectFilterByFolders() {
    await this.selectFilterTag(FILES_FILTER.BY_FOLDERS);
  }

  async selectFilterByMedia() {
    await this.selectFilterTag(FILES_FILTER.BY_MEDIA);
  }

  private get titleFolders() {
    return this.page.locator(TITLE_FOLDERS);
  }

  async fillFilesSearchInputAndCheckRequest(searchValue: string) {
    await this.fillSearchInputAndCheckRequest(
      searchValue,
      `filterValue=${encodeURIComponent(searchValue)}`,
    );
  }

  async switchToDocumentsCompactView() {
    await this.switchToCompactView();
  }

  async switchToDocumentsThumbnailView() {
    await this.switchToThumbnailView();
    await expect(this.titleFolders).toBeVisible();
  }

  async checkFilesEmptyViewExist() {
    await this.checkEmptyView("No findings");
  }
}

export default FilesFilter;
