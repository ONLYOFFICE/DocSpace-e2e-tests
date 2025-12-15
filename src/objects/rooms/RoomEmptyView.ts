import { expect, Page } from "@playwright/test";
import BaseToast from "../common/BaseToast";

const UPLOAD_FORM_DOCSPACE = "#upload-pdf-form";
const UPLOAD_FORM_DEVICE = "#create-form";
const SHARE_ROOM = "#share-room";
const EMPTY_VIEW = "empty-view"; 
const FILE_INPUT = '#customFileInput';

class RoomEmptyView {
  page: Page;
  toast: BaseToast; 
  constructor(page: Page) {
    this.page = page;
    this.toast = new BaseToast(page);
  }
  private get uploadPdfFromDocSpaceButton() {
    return this.page.locator(UPLOAD_FORM_DOCSPACE);
  }
  private get uploadFormButton() {
    return this.page.locator(UPLOAD_FORM_DEVICE);
  }
  private get shareRoomButton() {
    return this.page.locator(SHARE_ROOM);
  }
  
  private get emptyView() {
    return this.page.getByTestId(EMPTY_VIEW);
  }
   private get fileInput() {
    return this.page.locator(FILE_INPUT);
  }

  async checkEmptyView() {
    await expect(this.emptyView).toBeVisible();
  }

  async uploadPdfFromDocSpace() {
    await expect(this.uploadPdfFromDocSpaceButton).toBeVisible();
    await this.uploadPdfFromDocSpaceButton.click();
  }
  async uploadFormClick() {
    await expect(this.uploadFormButton).toBeVisible();
    await this.uploadFormButton.click();
  }

async uploadPdfForm(filePath: string) {
  await Promise.all([
    this.page.waitForResponse(
      (res) => res.url().includes("/upload/check") && res.status() === 200,
    ),
    this.fileInput.first().setInputFiles(filePath)
  ]);
}
  async shareRoomClick() {
    await expect(this.shareRoomButton).toBeVisible();
    await this.shareRoomButton.click();
  }
}

export default RoomEmptyView;
