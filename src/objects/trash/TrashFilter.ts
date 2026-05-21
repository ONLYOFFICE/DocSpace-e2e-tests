import { Page } from "@playwright/test";
import BaseFilter from "../common/BaseFilter";
import { FILTER_TYPE, FILTER_AUTHOR } from "@/src/utils/constants/filter";

const ROOM_FILTER_LABEL = "Select room";
const ROOM_PICKER_MODAL = "#modal-dialog";

class TrashFilter extends BaseFilter {
  constructor(page: Page) {
    super(page);
  }

  get authorMeTag() {
    return this.filterDialog.locator(FILTER_AUTHOR.ME);
  }

  get authorOtherTag() {
    return this.filterDialog.locator(FILTER_AUTHOR.OTHER);
  }

  get typeFoldersTag() {
    return this.filterDialog.locator(FILTER_TYPE.FOLDERS);
  }

  get typeAllFilesTag() {
    return this.filterDialog.locator(FILTER_TYPE.ALL_FILES);
  }

  get typeDocumentsTag() {
    return this.filterDialog.locator(FILTER_TYPE.DOCUMENTS);
  }

  get typeSpreadsheetsTag() {
    return this.filterDialog.locator(FILTER_TYPE.SPREADSHEETS);
  }

  get typePresentationsTag() {
    return this.filterDialog.locator(FILTER_TYPE.PRESENTATIONS);
  }

  get typePdfTag() {
    return this.filterDialog.locator(FILTER_TYPE.PDF);
  }

  get typeFormsTag() {
    return this.filterDialog.locator(FILTER_TYPE.FORMS);
  }

  get typeDiagramsTag() {
    return this.filterDialog.locator(FILTER_TYPE.DIAGRAMS);
  }

  get typeArchiveTag() {
    return this.filterDialog.locator(FILTER_TYPE.ARCHIVE);
  }

  get typeImagesTag() {
    return this.filterDialog.locator(FILTER_TYPE.IMAGES);
  }

  get typeMediaTag() {
    return this.filterDialog.locator(FILTER_TYPE.MEDIA);
  }

  get roomFilterTag() {
    return this.filterDialog.getByText(ROOM_FILTER_LABEL);
  }

  async selectRoomFilter(roomName: string) {
    await this.roomFilterTag.click();
    const modal = this.page.locator(ROOM_PICKER_MODAL);
    await modal.getByText(roomName, { exact: true }).click({ force: true });
    await modal
      .getByRole("button", { name: "Select", exact: true })
      .click({ force: true });
  }
}

export default TrashFilter;
