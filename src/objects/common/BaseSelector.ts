import { TRoomCreateTitles } from "@/src/utils/constants/rooms";
import { expect, Page } from "@playwright/test";

const NEW_SELECTOR_ITEM_INPUT_SELECTOR = "input.input-component.not-selectable";

class BaseSelector {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get selector() {
    return this.page.getByTestId("selector");
  }

  private get selectorAddButton() {
    return this.page.getByTestId("selector-add-button");
  }

  private get emptyContainerCreateNewItem() {
    return this.page.locator(".empty-folder_container-links").first();
  }

  private get newSelectorItemInput() {
    return this.selector.locator(
      `${NEW_SELECTOR_ITEM_INPUT_SELECTOR}:not([placeholder="Search"])`,
    );
  }

  private get newSelectorItem() {
    return this.newSelectorItemInput.locator("..");
  }

  async checkSelectorExist() {
    await expect(this.selector.getByTestId("selector-item-0")).toBeVisible();
  }

  async close() {
    await this.page.mouse.click(1, 1);
  }

  async gotoRoot() {
    await this.selector.getByText("DocSpace", { exact: true }).click();
  }

  async gotoBack(source: "empty" | "header") {
    switch (source) {
      case "empty":
        await this.selector.getByText("Back", { exact: true }).click();
        break;
      case "header":
        await this.selector
          .getByTestId("aside-header")
          .locator(".icon-button_svg")
          .click();
        break;
      default:
        break;
    }
  }

  async checkEmptyContainerExist() {
    await expect(
      this.selector.getByText("No files and folders here yet"),
    ).toBeVisible();
  }

  async select(type: "documents" | "rooms") {
    switch (type) {
      case "documents":
        await this.selector.getByTestId("selector-item-0").click();
        break;
      case "rooms":
        await this.selector.getByTestId("selector-item-1").click();
        break;
    }
  }

  async acceptCreate() {
    await expect(this.newSelectorItem).toBeVisible();
    await this.newSelectorItem.getByRole("img").nth(1).click();
    await expect(this.newSelectorItem).not.toBeVisible();
  }

  async getItemByName(name: string) {
    const item = this.selector
      .locator(`[data-testid^="selector-item-"]`)
      .filter({ hasText: name });
    await expect(item).toBeVisible();
    return item;
  }

  async selectItemByText(text: string, doubleClick = false) {
    const item = await this.getItemByName(text);
    if (doubleClick) {
      await item.dblclick();
    } else {
      await item.click();
    }
  }

  async selectFirstItem() {
    await this.selector.getByTestId("selector-item-1").click();
  }

  async createNewItem() {
    if (await this.selectorAddButton.isVisible()) {
      await this.selectorAddButton.click();
    } else {
      await this.emptyContainerCreateNewItem.click();
    }
  }

  async checkCreateNewRoomDropdownExist() {
    await expect(
      this.selector.locator(".selector-create-new-dropdown"),
    ).toBeVisible();
  }

  async selectCreateRoomType(roomType: TRoomCreateTitles) {
    await this.selector.getByText(roomType, { exact: true }).click();
  }

  async fillNewItemName(name: string) {
    await expect(this.newSelectorItemInput).toBeVisible();
    await this.newSelectorItemInput.fill(name);
  }

  async createNewFolder(folderName?: string) {
    await this.createNewItem();
    if (folderName) {
      await this.fillNewItemName(folderName);
    }
    await this.acceptCreate();
  }

  async createNewRoom(roomType: TRoomCreateTitles) {
    await this.createNewItem();
    await expect(
      this.selector.locator(".selector-create-new-dropdown"),
    ).toBeVisible();

    await this.selector.getByText(roomType, { exact: true }).click();
    await this.fillNewItemName(roomType);
    await this.acceptCreate();
  }
}

export default BaseSelector;
