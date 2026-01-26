import { expect, Page } from "@playwright/test";
import BaseFilter from "../common/BaseFilter";
import { docSort, TDocSort } from "@/src/utils/constants/files";
import { waitForGetFilesResponse } from "./api";

const filesFilter = {
  byFolders: "#filter_type-folders",
  byMedia: "#filter_type-media",
  byFiles: "#filter_type-all-files",
  byDocuments: "#filter_type-documents",
  bySpreadsheets: "#filter_type-spreadsheets",
  byPresentations: "#filter_type-presentations",
  byPdfDocuments: "#filter_type-pdf",
  byPdfForms: "#filter_type-forms",
  byDiagrams: "#filter_type-diagrams",
  byArchives: "#filter_type-archive",
  byImages: "#filter_type-images",
} as const;

const TITLE_FOLDERS = "#folder-tile-heading";
const EMPTY_VIEW_FILTER = "#empty-view-filter";

class FilesFilter extends BaseFilter {
  constructor(page: Page) {
    super(page);
  }

  async applySort(option: TDocSort) {
    const promise = waitForGetFilesResponse(this.page);
    await super.applySort(option);
    await promise;
  }

  async selectSortByName() {
    const promise = waitForGetFilesResponse(this.page);
    await super.selectSortOptionByText(docSort.name);
    await promise;
  }

  async selectFilterByFolders() {
    await super.selectFilterTag(filesFilter.byFolders);
  }

  async selectFilterByMedia() {
    await super.selectFilterTag(filesFilter.byMedia);
  }

  async selectFilterByFiles() {
    await super.selectFilterTag(filesFilter.byFiles);
  }

  async selectFilterByDocuments() {
    await super.selectFilterTag(filesFilter.byDocuments);
  }

  async selectFilterBySpreadsheets() {
    await super.selectFilterTag(filesFilter.bySpreadsheets);
  }

  async selectFilterByPresentations() {
    await super.selectFilterTag(filesFilter.byPresentations);
  }

  async selectFilterByPdfDocuments() {
    await super.selectFilterTag(filesFilter.byPdfDocuments);
  }

  async selectFilterByPdfForms() {
    await super.selectFilterTag(filesFilter.byPdfForms);
  }

  async selectFilterByDiagrams() {
    await super.selectFilterTag(filesFilter.byDiagrams);
  }

  async selectFilterByArchives() {
    await super.selectFilterTag(filesFilter.byArchives);
  }

  async selectFilterByImages() {
    await super.selectFilterTag(filesFilter.byImages);
  }

  async applyFilter() {
    const promise = waitForGetFilesResponse(this.page);
    await super.applyFilter();
    await promise;
  }

  async applyFilterWithoutCountWait() {
    const promise = this.page.waitForResponse((response) => {
      return (
        response.url().includes("api/2.0/files") &&
        response.request().method() === "GET" &&
        response.status() === 200
      );
    });
    await super.applyFilter();
    await promise;
  }
  async clearFilter() {
    const promise = waitForGetFilesResponse(this.page);
    await super.clearFilter();
    await promise;
  }

  async clearSearchText() {
    const promise = waitForGetFilesResponse(this.page);
    await super.clearSearchText();
    await promise;
  }

  private get titleFolders() {
    return this.page.locator(TITLE_FOLDERS);
  }

  async fillFilesSearchInputAndCheckRequest(searchValue: string) {
    await super.fillSearchInputAndCheckRequest(searchValue);
  }

  async switchToDocumentsCompactView() {
    await super.switchToCompactView();
  }

  async switchToDocumentsThumbnailView() {
    await super.switchToThumbnailView();
    await expect(this.titleFolders).toBeVisible();
  }

  async checkFilesEmptyViewExist() {
    await super.checkEmptyView("No findings");
  }

  async clearFilterFromEmptyView() {
    const promise = waitForGetFilesResponse(this.page);
    await this.page.locator(EMPTY_VIEW_FILTER).click();
    await promise;
  }
}

export default FilesFilter;
