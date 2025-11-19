import {
  roomCreateTitles,
  roomTemplateTitles,
  TRoomCreateTitles,
} from "@/src/utils/constants/rooms";
import { expect, Page } from "@playwright/test";
import Screenshot from "../common/Screenshot";
import BaseDialog from "../common/BaseDialog";
import { waitForGetRoomsResponse } from "./api";

const ROOM_SUBMIT_BUTTON = "#shared_create-room-modal_submit";
const ROOM_TEMPLATE_SUBMIT_BUTTON = "#create-room-template-modal_submit";
const LOGO_NAME_CONTAINER = "create_edit_room_icon";
const TAG_NAME_INPUT = "create_edit_room_tags_input";
const ROOM_NAME_INPUT = "create_edit_room_input";

class RoomsCreateDialog extends BaseDialog {
  constructor(page: Page) {
    super(page);
  }

  private get roomDialogSubmitButton() {
    return this.page.locator(ROOM_SUBMIT_BUTTON);
  }

  private get roomTemplateSubmitButton() {
    return this.page.locator(ROOM_TEMPLATE_SUBMIT_BUTTON);
  }

  private get roomTypeDropdownButton() {
    return this.page.getByTestId("room-type-dropdown-button");
  }

  private get roomIcon() {
    return this.page.getByTestId(LOGO_NAME_CONTAINER).getByTestId("empty-icon");
  }

  private get roomIconDropdown() {
    return this.page.getByTestId(LOGO_NAME_CONTAINER).getByTestId("dropdown");
  }

  async checkRoomTypeExist(roomType: TRoomCreateTitles) {
    await expect(this.dialog.getByTitle(roomType)).toBeVisible();
  }

  async openRoomType(title: TRoomCreateTitles) {
    if (title !== roomCreateTitles.fromTemplate) {
      await this.dialog.getByTitle(title).click();
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
    await this.roomIconDropdown.getByText("Customize cover").click();
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

  async createRoomWithCover(roomName: string) {
    await this.selectCoverColor();
    await this.selectCoverIcon();
    await this.saveCover();
    await this.fillRoomName(roomName);
    await this.clickRoomDialogSubmit();
  }

  async createPublicRoomTemplate() {
    await this.fillTemplateName(roomTemplateTitles.roomTemplate);
    await this.clickRoomTemplateSubmit();
  }

  async createPublicRoomFromTemplate() {
    await this.fillTemplateName(roomTemplateTitles.fromTemplate);
    await this.clickRoomDialogSubmit();
  }

  async toggleAutomaticIndexing(enable: boolean) {
    const block = this.page.getByTestId("virtual_data_room_automatic_indexing");
    const checkbox = block.getByTestId("toggle-button-input");
    const label = block.getByTestId("toggle-button-container");

    const isChecked = await checkbox.isChecked();
    if (isChecked !== enable) {
      await label.click();
    }
    await expect(checkbox).toBeChecked({ checked: enable });
  }

  async toggleRestrictCopyAndDownload(enable: boolean) {
    const block = this.page.getByTestId(
      "virtual_data_room_restrict_copy_download",
    );
    const checkbox = block.getByTestId("toggle-button-input");
    const label = block.getByTestId("toggle-button-container");

    const isChecked = await checkbox.isChecked();
    if (isChecked !== enable) {
      await label.click();
    }
    await expect(checkbox).toBeChecked({ checked: enable });
  }

  async toggleFileLifetime(enable: boolean) {
    const block = this.page.getByTestId("virtual_data_room_file_lifetime");
    const checkbox = block.getByTestId("toggle-button-input");
    const label = block.getByTestId("toggle-button-container");

    const isChecked = await checkbox.isChecked();
    if (isChecked !== enable) {
      await label.click();
    }
    await expect(checkbox).toBeChecked({ checked: enable });
  }

  async setFileLifetimeDays(days: number) {
    const input = this.page.getByTestId(
      "virtual_data_room_file_lifetime_input",
    );
    await input.fill(days.toString());
    await expect(input).toHaveValue(days.toString());
  }

  async selectFileLifetimeUnit(unit: "Days" | "Months" | "Years") {
    const comboBox = this.page.getByTestId(
      "virtual_data_room_file_lifetime_period_combobox",
    );
    await comboBox.click();
    await this.page.getByRole("option", { name: unit }).click();
    await expect(comboBox).toContainText(unit);
  }

  async selectFileLifetimeAction(
    action: "Move to Trash" | "Delete permanently",
  ) {
    const comboBox = this.page.getByTestId(
      "virtual_data_room_file_lifetime_delete_combobox",
    );
    await comboBox.click();
    await this.page.getByRole("option", { name: action }).click();
    await expect(comboBox).toContainText(action);
  }

  async toggleWatermarks(enable: boolean) {
    const block = this.page.getByTestId("virtual_data_room_add_watermarks");
    const checkbox = block.getByTestId("toggle-button-input");
    const label = block.getByTestId("toggle-button-container");

    const isChecked = await checkbox.isChecked();
    if (isChecked !== enable) {
      await label.click();
    }
    await expect(checkbox).toBeChecked({ checked: enable });
  }

  async selectWatermarkType(type: "Viewer info" | "Image") {
    const block = this.page.getByTestId("virtual_data_room_add_watermarks");
    const option =
      type === "Viewer info"
        ? block.getByTestId("virtual_data_room_watermarks_radio_viewer_info")
        : block.getByTestId("virtual_data_room_watermarks_radio_image");

    await option.click();
    await expect(option.locator("input[type='radio']")).toBeChecked();
  }

  async selectWatermarkElements(
    elements: Array<
      "username" | "useremail" | "useripadress" | "currentdate" | "roomname"
    >,
  ) {
    const block = this.page.getByTestId("virtual_data_room_add_watermarks");
    for (const el of elements) {
      const tab = block.getByTestId(`virtual_data_room_watermark_tab_${el}`);
      await tab.click();
      await expect(tab).toHaveAttribute("aria-selected", "true");
    }
  }

  async setWatermarkStaticText(text: string) {
    const input = this.page.getByTestId(
      "virtual_data_room_watermark_text_input",
    );
    await input.fill(text);
    await expect(input).toHaveValue(text);
  }

  async selectWatermarkPosition(position: string) {
    const comboBox = this.page.getByTestId(
      "virtual_data_room_watermark_position_combobox",
    );
    await comboBox.click();
    await this.page.getByRole("option", { name: position }).click();
    await expect(comboBox).toContainText(position);
  }

  async setRoomCoverColor(colorTestId = "color_item_6") {
    await this.page.getByTestId("create_edit_room_icon").click();
    await this.page.getByTestId("create_edit_room_customize_cover").click();
    await this.page.getByTestId(colorTestId).click();
    const applyButton = this.page.getByTestId("room_logo_cover_apply_button");
    await applyButton.click();
  }
}

export default RoomsCreateDialog;
