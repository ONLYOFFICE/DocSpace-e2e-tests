import { expect, Page } from "@playwright/test";
import BaseToast from "../common/BaseToast";

const UPLOAD_FORM_DOCSPACE = "#upload-pdf-form";
const CREATE_FORM = "#create-form";
const SHARE_ROOM = "#share-room";

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
  private get createFormButton() {
    return this.page.locator(CREATE_FORM);
  }
  private get shareRoomButton() {
    return this.page.locator(SHARE_ROOM);
  }
   async uploadPdfFromDocSpace() {
    await expect(this.uploadPdfFromDocSpaceButton).toBeVisible();
    await this.uploadPdfFromDocSpaceButton.click();
  }
  async createFormClick() {
    await expect(this.createFormButton).toBeVisible();
    await this.createFormButton.click();
  }
  async shareRoomClick() {
    await expect(this.shareRoomButton).toBeVisible();
    await this.shareRoomButton.click();
    await this.toast.removeToast();
  }
}

export default RoomEmptyView;
