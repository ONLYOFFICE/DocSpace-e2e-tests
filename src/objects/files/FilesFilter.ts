import { expect, Page, test } from "@playwright/test";
import BaseFilter from "../common/BaseFilter";
import { docSort, TDocSort } from "@/src/utils/constants/files";
import { waitForGetFilesResponse } from "./api";

const filesFilter = {
  byFolders: "filter_tag_2",
  byMedia: "filter_tag_12",
} as const;

const TITLE_FOLDERS = "#folder-tile-heading";

class FilesFilter extends BaseFilter {
  constructor(page: Page) {
    super(page);
  }

  async applySort(option: TDocSort) {
    return test.step('Apply sort', async () => {
    const promise = waitForGetFilesResponse(this.page);
    await super.applySort(option);
    await promise;
  });
  }

  async selectSortByName() {
    return test.step('Select sort by name', async () => {
    const promise = waitForGetFilesResponse(this.page);
    await super.selectSortOptionByText(docSort.name);
    await promise;
  });
  }

  async selectFilterByFolders() {
    return test.step('Select filter by folders', async () => {
    await super.selectFilterTag(filesFilter.byFolders);
  });
  }

  async selectFilterByMedia() {
    return test.step('Select filter by media', async () => {
    await super.selectFilterTag(filesFilter.byMedia);
  });
  }

  async applyFilter() {
    return test.step('Apply filter', async () => {
    const promise = waitForGetFilesResponse(this.page);
    await super.applyFilter();
    await promise;
  });
  }
  
  async clearFilter() {
    return test.step('Clear filter', async () => {
    const promise = waitForGetFilesResponse(this.page);
    await super.clearFilter();
    await promise;
  });
  }

  async clearSearchText() {
    return test.step('Clear search text', async () => {
    const promise = waitForGetFilesResponse(this.page);
    await super.clearSearchText();
    await promise;
  });
  }

  private get titleFolders() {
    return this.page.locator(TITLE_FOLDERS);
  }

  async fillFilesSearchInputAndCheckRequest(searchValue: string) {
    return test.step('Fill files search input and check request', async () => {
    await super.fillSearchInputAndCheckRequest(searchValue);
  });
  }

  async switchToDocumentsCompactView() {
    return test.step('Switch to documents compact view', async () => {
    await super.switchToCompactView();
  });
  }

  async switchToDocumentsThumbnailView() {
    return test.step('Switch to documents thumbnail view', async () => {
    await super.switchToThumbnailView();
    await expect(this.titleFolders).toBeVisible();
  });
  }

  async checkFilesEmptyViewExist() {
    return test.step('Check files empty view exist', async () => {
    await super.checkEmptyView("No findings");
  });
  }
}

export default FilesFilter;
