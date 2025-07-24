import {
  roomCreateTitles,
  roomTemplateTitles,
  TRoomCreateTitles,
} from "@/src/utils/constants/rooms";
import { expect, Page } from "@playwright/test";
import Screenshot from "../common/Screenshot";
import BaseDialog from "../common/BaseDialog";

const ROOM_SUBMIT_BUTTON = "#shared_create-room-modal_submit";
const ROOM_TEMPLATE_SUBMIT_BUTTON = "#create-room-template-modal_submit";
const LOGO_NAME_CONTAINER = ".logo-name-container";
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
      const promise = this.page.waitForResponse((response) => {
        return (
          response.url().includes("files/rooms?count") &&
          response.request().method() === "GET" &&
          response.status() === 200
        );
      });
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
    const block = this.page.locator('.virtual-data-room-block_header', { hasText: "Automatic indexing" });
    const checkbox = block.locator('[data-testid="toggle-button-input"]');
    const label = block.locator('[data-testid="toggle-button-container"]');
    const isChecked = await checkbox.isChecked();
    if (isChecked !== enable) {
      await label.click();
    }
    await expect(checkbox).toBeChecked({ checked: enable });
  }

  async toggleRestrictCopyAndDownload(enable: boolean) {
    const block = this.page.locator('.virtual-data-room-block_header', { hasText: "Restrict copy and download" });
    const checkbox = block.locator('[data-testid="toggle-button-input"]');
    const label = block.locator('[data-testid="toggle-button-container"]');
    const isChecked = await checkbox.isChecked();
    if (isChecked !== enable) {
      await label.click();
    }
    await expect(checkbox).toBeChecked({ checked: enable });
  }

  async toggleFileLifetime(enable: boolean) {
    const block = this.page.locator('.virtual-data-room-block_header', { hasText: "File lifetime" });
    const checkbox = block.locator('[data-testid="toggle-button-input"]');
    const label = block.locator('[data-testid="toggle-button-container"]');
    const isChecked = await checkbox.isChecked();
    if (isChecked !== enable) {
      await label.click();
    }
    await expect(checkbox).toBeChecked({ checked: enable });
  }

  async setFileLifetimeDays(days: number) {
    const input = this.page
      .locator('.virtual-data-room-block')
      .filter({ hasText: "File lifetime" })
      .locator('[data-testid="text-input"]');
    await input.fill(days.toString());
    await expect(input).toHaveValue(days.toString());
  }

  async selectFileLifetimeUnit(unit: string) {
    
    const comboBox = this.page
      .locator('.virtual-data-room-block')
      .filter({ hasText: "File lifetime" })
      .locator('[data-testid="combobox"]')
      .first();
  
    await comboBox.click();
    
    await this.page.locator(`role=option[name="${unit}"]`).click();
    
    await expect(comboBox).toContainText(unit);
  }

  async selectFileLifetimeAction(action: string) {
    
    const comboBox = this.page
      .locator('.virtual-data-room-block')
      .filter({ hasText: "File lifetime" })
      .locator('[data-testid="combobox"]')
      .nth(1);
  
    await comboBox.click();
    await this.page.locator(`role=option[name="${action}"]`).click();
    await expect(comboBox).toContainText(action);
  }
  
  async toggleWatermarks(enable: boolean) {
  const block = this.page.locator('.virtual-data-room-block_header', { hasText: "Add watermarks to documents" });
  const checkbox = block.locator('[data-testid="toggle-button-input"]');
  const label = block.locator('[data-testid="toggle-button-container"]');
  const isChecked = await checkbox.isChecked();
  if (isChecked !== enable) {
    await label.click();
  }
  await expect(checkbox).toBeChecked({ checked: enable });
}

  async selectWatermarkType(type: "Viewer info" | "Image") {
    const block = this.page.locator('.virtual-data-room-block').filter({ hasText: "Add watermarks to documents" });
    
    await block.locator('[data-testid="radio-button"]', { hasText: type }).click();
    
    const radio = block.locator('[data-testid="radio-button"]', { hasText: type }).locator('input[type="radio"]');
    await expect(radio).toBeChecked();
  }
  
  async selectWatermarkElements(elements: string[]) {
    const block = this.page.locator('.virtual-data-room-block').filter({ hasText: "Add watermarks to documents" });
    for (const el of elements) {
      const tab = block.locator(`[data-testid="${el}"]`);
      await tab.click();
      await expect(tab).toHaveClass(/Tabs-module__selected--ZS8Ss/); 
    }
  }
  
  async setWatermarkStaticText(text: string) {
    const block = this.page.locator('.virtual-data-room-block').filter({ hasText: "Add watermarks to documents" });
    const input = block.locator('input[data-testid="text-input"]');
    await input.fill(text);
    await expect(input).toHaveValue(text);
  }

  async selectWatermarkPosition(position: string) {
    const block = this.page.locator('.virtual-data-room-block').filter({ hasText: "Add watermarks to documents" });
    const combo = block.locator('[data-testid="combobox"]');
    await combo.click();
    
    const item = this.page.locator('[data-testid="drop-down-item"]', { hasText: position });
    await item.click();
    await expect(combo).toContainText(position);
  }

  async setRoomCoverColor(colorIndex = 1) {
  
    await this.page.locator('[data-testid="icon-button-svg"]').click();
    await this.page.getByText('Customize cover').click();
  
    const colorButtons = this.page.locator('.colors-container > div .circle');
    await colorButtons.nth(colorIndex).click();

  await this.page.getByRole('button', { name: /apply/i }).click();
  }
  


}

export default RoomsCreateDialog;
