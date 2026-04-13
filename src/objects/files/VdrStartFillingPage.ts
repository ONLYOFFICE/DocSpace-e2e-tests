import { expect, Page } from "@playwright/test";

const START_FILLING_URL = /\/doceditor\/start-filling/;
// BEM-style class, no CSS module hash - stable selector
const VDR_COMPLETED_LAYOUT = ".completed-form__vdr-layout";
const FILL_FORM_BUTTON = '[data-testid="fill_form_button"]';
const COPY_LINK_BUTTON = '[data-testid="copy_link_button"]';
const GO_TO_ROOM_LINK = '[data-testid="go_to_room_link"]';
const COPY_LINK_INPUT_BLOCK = '[data-testid="copy_link_input_block"]';
const COMPLETED_FORM_FILE_CONTAINER =
  '[data-testid="completed_form_file_container"]';
const HEADING = '[data-testid="heading"]';
const HEADING_TEXT = "Form is ready for filling in room";

class VdrStartFillingPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get layout() {
    return this.page.locator(VDR_COMPLETED_LAYOUT);
  }

  private get fillFormButton() {
    return this.page.locator(FILL_FORM_BUTTON);
  }

  private get copyLinkButton() {
    return this.page.locator(COPY_LINK_BUTTON);
  }

  private get goToRoomLink() {
    return this.page.locator(GO_TO_ROOM_LINK);
  }

  private get copyLinkInputBlock() {
    return this.page.locator(COPY_LINK_INPUT_BLOCK);
  }

  private get completedFormFileContainer() {
    return this.page.locator(COMPLETED_FORM_FILE_CONTAINER);
  }

  private get heading() {
    return this.page.locator(HEADING);
  }

  async waitForPageLoad() {
    await expect(this.page).toHaveURL(START_FILLING_URL, { timeout: 15000 });
    await expect(this.layout).toBeVisible();
  }

  async checkButtonsVisible() {
    await expect(this.fillFormButton).toBeVisible();
    await expect(this.copyLinkButton).toBeVisible();
    await expect(this.goToRoomLink).toBeVisible();
  }

  async checkPageElementsVisible() {
    await expect(this.copyLinkInputBlock).toBeVisible();
    await expect(this.completedFormFileContainer).toBeVisible();
  }

  async checkHeading() {
    await expect(this.heading).toContainText(HEADING_TEXT);
  }
}

export default VdrStartFillingPage;
