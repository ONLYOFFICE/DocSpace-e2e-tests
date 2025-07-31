import { expect, Page } from "@playwright/test";
import BaseToast from "../common/BaseToast";

const UPLOAD_FORM_DOCSPACE = "#upload-pdf-form";
const UPLOAD_FORM_DEVICE = "#create-form";
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
  private get uploadFormButton() {
    return this.page.locator(UPLOAD_FORM_DEVICE);
  }
  private get shareRoomButton() {
    return this.page.locator(SHARE_ROOM);
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
    const upload = async (selector: string, filePath: string) => {
    await Promise.all([
      this.page.waitForResponse(
        (res) =>
          res.url().includes("/upload/check") && res.status() === 200,
      ),
      await this.page.locator('#customFileInput').first().setInputFiles(filePath),
    ]);
    };
    await upload("#customFileInput", filePath);
  }
  async shareRoomClick() {
    await expect(this.shareRoomButton).toBeVisible();
    await this.shareRoomButton.click();
    await this.toast.removeToast();
  }
}

export default RoomEmptyView;
