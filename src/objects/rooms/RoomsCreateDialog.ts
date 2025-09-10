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
const LOGO_NAME_CONTAINER = ".logo-name-container";
const TAG_NAME_INPUT = "#shared_tags-input";
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
    return this.page.locator(LOGO_NAME_CONTAINER).getByTestId("empty-icon");
  }

  private get roomIconDropdown() {
    return this.page.locator(LOGO_NAME_CONTAINER).getByTestId("dropdown");
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
    await expect(
      this.page.locator(".cover-icon-container svg").first(),
    ).toBeVisible();
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
    await this.fillInput(
      this.page.getByRole("textbox", { name: "Name:" }),
      name,
    );
  }

  async fillTemplateName(name: string) {
    await this.fillInput(
      this.page.getByRole("textbox", { name: "Template name:" }),
      name,
    );
  }

  async fillTag(tagName: string) {
    await this.fillInput(this.page.locator(TAG_NAME_INPUT), tagName);
  }

  async createTag(tagName: string) {
    await this.fillTag(tagName);
    await this.page
      .getByRole("option", { name: `Create tag “${tagName}”` })
      .click();
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
<<<<<<< HEAD
=======

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

  async setRoomCoverColor(colorIndex = ".sc-dwalKd.kOQVrm") {
    await this.page
      .getByTestId("modal")
      .getByTestId("room-icon")
      .getByTestId("icon-button-svg")
      .getByRole("img")
      .click();
    await this.page.getByText("Customize cover").click();

    //const colorButtons = this.page.locator('.colors-container > div .circle');
    await this.page.locator(colorIndex).click();

    await this.page.getByRole("button", { name: /apply/i }).click();
  }
>>>>>>> origin/main
}

export default RoomsCreateDialog;
