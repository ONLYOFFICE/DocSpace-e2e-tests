import {
  ROOM_CREATE_TITLES,
  TRoomCreateTitles,
} from "@/src/utils/constants/rooms";
import { expect, Page } from "@playwright/test";
import Screenshot from "../common/Screenshot";

const ROOM_DIALOG = "#modal-dialog";
const ROOM_SUBMIT_BUTTON = "#shared_create-room-modal_submit";
const ROOM_TEMPLATE_SUBMIT_BUTTON = "#create-room-template-modal_submit";
("#create-room-template-modal_cancel");

class RoomsCreateDialog {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get roomDialog() {
    return this.page.locator(ROOM_DIALOG);
  }

  private get roomDialogSubmitButton() {
    return this.page.locator(ROOM_SUBMIT_BUTTON);
  }

  private get roomTemplateSubmitButton() {
    return this.page.locator(ROOM_TEMPLATE_SUBMIT_BUTTON);
  }

  private get roomDialogHeader() {
    return this.page.getByTestId("aside-header");
  }

  private get roomIcon() {
    return this.page.getByTestId("room-icon");
  }

  private get roomIconDropdown() {
    return this.roomIcon.getByTestId("dropdown");
  }

  async checkRoomDialogExist() {
    await expect(this.roomDialog).toBeVisible();
  }

  async close() {
    await this.page.mouse.click(1, 1);
    await expect(this.roomDialog).not.toBeVisible();
  }

  async openRoomType(title: TRoomCreateTitles) {
    await this.roomDialog.getByTitle(title).click();
  }

  async clickBackArrow() {
    await this.roomDialogHeader.getByTestId("icon-button-svg").first().click();
  }

  async openRoomIconDropdown() {
    await this.roomIcon.click();
    await expect(this.roomIconDropdown).toBeVisible();
  }

  async clickCustomizeCover() {
    await this.roomIconDropdown.getByText("Customize cover").click();
  }

  async openRoomCover() {
    await this.openRoomIconDropdown();
    await this.clickCustomizeCover();
    await expect(this.page.getByText("Room cover")).toBeVisible();
  }

  async selectCoverColor() {
    await this.page.locator(".colors-container [color='#6191F2']").click();
  }

  async selectCoverIcon() {
    await this.page.locator(".cover-icon-container div").first().click();
  }

  async saveCover() {
    await this.page.getByRole("button", { name: "Apply" }).click();
  }

  async openAndValidateRoomTypes(screenshot: Screenshot) {
    for (const roomType of Object.values(ROOM_CREATE_TITLES)) {
      await this.openRoomType(roomType);

      let screenName = roomType.toLowerCase().replace(" ", "_");

      if (roomType === ROOM_CREATE_TITLES.FROM_TEMPLATE) {
        screenName += "_empty";
      }

      await screenshot.expectHaveScreenshot(`view_${screenName}`);

      await this.clickBackArrow();
    }
  }

  async fillRoomName(name: string) {
    await this.page.getByLabel("Name:").fill(name);
  }

  async fillTemplateName(name: string) {
    await this.page.getByLabel("Template name:").fill(name);
  }

  async clickRoomDialogSubmit() {
    await expect(this.roomDialogSubmitButton).toBeVisible();
    await this.roomDialogSubmitButton.click();
  }

  async clickRoomTemplateSubmit() {
    await expect(this.roomTemplateSubmitButton).toBeVisible();
    await this.roomTemplateSubmitButton.click();
  }

  async createRoomWithCover() {
    await this.selectCoverColor();
    await this.selectCoverIcon();
    await this.saveCover();
    await this.fillRoomName("room with cover");
    await this.clickRoomDialogSubmit();
  }

  async createRoomTemplate() {
    await this.fillTemplateName("room template");
    await this.clickRoomTemplateSubmit();
  }
}

export default RoomsCreateDialog;
