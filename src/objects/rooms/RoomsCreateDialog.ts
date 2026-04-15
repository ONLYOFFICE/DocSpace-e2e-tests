import {
  roomCreateTitles,
  roomTemplateTitles,
  TRoomCreateTitles,
} from "@/src/utils/constants/rooms";
import { expect, Page } from "@playwright/test";
import Screenshot from "../common/Screenshot";
import BaseDialog from "../common/BaseDialog";
import { waitForGetRoomsResponse, waitForCreateRoomResponse } from "./api";

const ROOM_SUBMIT_BUTTON = "create_room_dialog_save";
const SAVE_FORM_AS_XLSX_BLOCK = "#save-form-as-xlsx";
const SEND_FORM_TO_EXTERNAL_DB_BLOCK = "#send-form-to-external-db";
const TOGGLE_INPUT = "toggle-button-input";
const TOGGLE_LABEL = "toggle-button-container";
const GO_TO_INTEGRATIONS_LINK =
  'a[href="/portal-settings/integration/third-party-services?consumer=externaldb"]';
const ROOM_TEMPLATE_SUBMIT_BUTTON = "#create-room-template-modal_submit";
const LOGO_NAME_CONTAINER = "create_edit_room_icon";
const TAG_NAME_INPUT = "create_edit_room_tags_input";
const ROOM_NAME_INPUT = "create_edit_room_input";
const ROOM_TYPE_DROPDOWN_BUTTON = "room-type-dropdown-button";
const CUSTOMIZE_COVER_BUTTON = "create_edit_room_customize_cover";

class RoomsCreateDialog extends BaseDialog {
  constructor(page: Page) {
    super(page);
  }

  private get roomDialogSubmitButton() {
    return this.page.getByTestId(ROOM_SUBMIT_BUTTON);
  }

  private get roomTemplateSubmitButton() {
    return this.page.locator(ROOM_TEMPLATE_SUBMIT_BUTTON);
  }

  private get roomTypeDropdownButton() {
    return this.page.getByTestId(ROOM_TYPE_DROPDOWN_BUTTON);
  }

  private get roomIcon() {
    return this.page.getByTestId(LOGO_NAME_CONTAINER).getByTestId("empty-icon");
  }

  private get roomIconDropdown() {
    return this.page.getByTestId(LOGO_NAME_CONTAINER).getByTestId("dropdown");
  }

  private get customizeCoverButton() {
    return this.page.getByTestId(CUSTOMIZE_COVER_BUTTON);
  }

  async checkRoomTypeExist(roomType: TRoomCreateTitles) {
    await expect(this.dialog.getByText(roomType)).toBeVisible();
  }

  async openRoomType(title: TRoomCreateTitles) {
    if (title !== roomCreateTitles.fromTemplate) {
      await this.dialog.getByText(title).click();
      await expect(this.roomTypeDropdownButton).toBeVisible();
    } else {
      const promise = waitForGetRoomsResponse(this.page);
      await this.dialog.getByTitle(title).click();
      await promise;
    }
  }

  async openRoomIconDropdown() {
    await expect(this.roomIcon).toBeVisible();
    await this.roomIcon.click();
    await expect(this.roomIconDropdown).toBeVisible();
  }

  async clickCustomizeCover() {
    await this.customizeCoverButton.click();
  }

  async openRoomCover() {
    const isRoomIconDropdownVisible = await this.roomIconDropdown.isVisible();

    if (!isRoomIconDropdownVisible) {
      await this.openRoomIconDropdown();
    }
    await this.clickCustomizeCover();
    await expect(this.page.getByText("Room cover")).toBeVisible();
    await expect(this.page.getByTestId("color_item_selected_0")).toBeVisible();
  }

  async selectCoverColor() {
    await this.page.getByTestId("color_item_6").click();
  }

  async selectCoverIcon() {
    await this.page.getByTestId("room_logo_cover_icon_0").click();
  }

  async saveCover() {
    await this.page.getByTestId("room_logo_cover_apply_button").click();
  }

  async checkNoTemplatesFoundExist() {
    await expect(this.dialog.getByText("No templates found")).toBeVisible();
  }

  async openAndValidateRoomTypes(screenshot: Screenshot) {
    for (const roomType of Object.values(roomCreateTitles)) {
      await this.openRoomType(roomType);

      let screenName = roomType.toLowerCase().replace(" ", "_");

      if (roomType === roomCreateTitles.fromTemplate) {
        await this.checkNoTemplatesFoundExist();
        screenName += "_empty";
      }

      await screenshot.expectHaveScreenshot(`view_${screenName}`);

      await this.clickBackArrow();
    }
  }

  async fillRoomName(name: string) {
    await this.fillInput(this.page.getByTestId(ROOM_NAME_INPUT), name);
  }

  async fillTemplateName(name: string) {
    await this.fillInput(
      this.page.getByRole("textbox", { name: "Template name:" }),
      name,
    );
  }

  async fillTag(tagName: string) {
    const tagInput = this.page.getByTestId(TAG_NAME_INPUT);
    await tagInput.fill(tagName);
    await this.fillInput(tagInput, tagName);
  }

  async createTag(tagName: string) {
    await this.fillTag(tagName);
    await this.page.getByTestId("drop-down-item").click();
  }

  async createTags(count: number) {
    for (let i = 1; i <= count; i++) {
      await this.createTag(`tagName${i}`);
    }
  }

  async closeTag(tagName: string) {
    await this.page.getByLabel(tagName).locator("path").click();
  }

  async clickRoomDialogSubmit() {
    await this.clickSubmitButton(this.roomDialogSubmitButton);
  }

  async clickRoomTemplateSubmit() {
    await expect(this.roomTemplateSubmitButton).toBeVisible();
    await this.roomTemplateSubmitButton.click();
  }

  async createRoom(roomName: string) {
    await this.fillRoomName(roomName);
    const createRoomPromise = waitForCreateRoomResponse(this.page);
    await this.clickRoomDialogSubmit();
    await createRoomPromise;
  }

  async createRoomWithCover(roomName: string) {
    await this.selectCoverColor();
    await this.selectCoverIcon();
    await this.saveCover();
    await this.fillRoomName(roomName);
    const createRoomPromise = waitForCreateRoomResponse(this.page);
    await this.clickRoomDialogSubmit();
    await createRoomPromise;
  }

  async createPublicRoomTemplate() {
    await this.fillTemplateName(roomTemplateTitles.roomTemplate);
    await this.clickRoomTemplateSubmit();
  }

  async createPublicRoomFromTemplate() {
    await this.fillTemplateName(roomTemplateTitles.fromTemplate);
    await this.clickRoomDialogSubmit();
  }

  async expectSaveFormAsXlsxChecked(checked: boolean) {
    const checkbox = this.page
      .locator(SAVE_FORM_AS_XLSX_BLOCK)
      .getByTestId(TOGGLE_INPUT);
    await expect(checkbox).toBeChecked({ checked });
  }

  async toggleSaveFormAsXlsx(enable: boolean) {
    const block = this.page.locator(SAVE_FORM_AS_XLSX_BLOCK);
    const checkbox = block.getByTestId(TOGGLE_INPUT);
    const label = block.getByTestId(TOGGLE_LABEL);

    const isChecked = await checkbox.isChecked();
    if (isChecked !== enable) {
      await label.click();
    }
    await expect(checkbox).toBeChecked({ checked: enable });
  }

  async expectSendFormToExternalDbChecked(checked: boolean) {
    const checkbox = this.page
      .locator(SEND_FORM_TO_EXTERNAL_DB_BLOCK)
      .getByTestId(TOGGLE_INPUT);
    await expect(checkbox).toBeChecked({ checked });
  }

  async toggleSendFormToExternalDb(enable: boolean) {
    const block = this.page.locator(SEND_FORM_TO_EXTERNAL_DB_BLOCK);
    const checkbox = block.getByTestId(TOGGLE_INPUT);
    const label = block.getByTestId(TOGGLE_LABEL);

    const isChecked = await checkbox.isChecked();
    if (isChecked !== enable) {
      await label.click();
    }
    await expect(checkbox).toBeChecked({ checked: enable });
  }

  get goToIntegrationsLink() {
    return this.page.locator(GO_TO_INTEGRATIONS_LINK);
  }

  async setRoomCoverColor(colorTestId = "color_item_6") {
    await this.page.getByTestId("create_edit_room_icon").click();
    await this.page.getByTestId("create_edit_room_customize_cover").click();
    const normalizedId = colorTestId.replace(
      "color_item_selected_",
      "color_item_",
    );
    const selectedId = normalizedId.replace(
      "color_item_",
      "color_item_selected_",
    );
    const colorOption = this.page.locator(
      `[data-testid="${normalizedId}"], [data-testid="${selectedId}"]`,
    );
    await expect(colorOption.first()).toBeVisible();
    await colorOption.first().click();
    const applyButton = this.page.getByTestId("room_logo_cover_apply_button");
    await applyButton.click();
  }
}

export default RoomsCreateDialog;
