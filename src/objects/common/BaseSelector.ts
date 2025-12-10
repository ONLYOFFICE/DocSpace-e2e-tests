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

  private get globalSelectorItems() {
    return this.page.locator(`[data-testid^="selector-item-"]`);
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
        await this.selector.getByTestId("selector-add-button").click();
        break;
      default:
        break;
    }
  }

  async checkSelectorAddButtonExist() {
    await expect(this.selectorAddButton).toBeVisible();
  }

  async checkEmptyContainerExist() {
    await expect(
      this.selector.getByText("No files and folders here yet"),
    ).toBeVisible();
  }

  async select(type: "documents" | "rooms") {
    switch (type) {
      case "documents":
        await this.selectItemByIndex(1);
        break;
      case "rooms":
        await this.selectItemByIndex(2);
        break;
    }
  }

  async acceptCreate() {
    await expect(this.newSelectorItem).toBeVisible();
    // TODO ACCEPT BUTTON BY TEST ID;
    await this.page
      .locator(".Selector-module__inputWrapper--PcjcU")
      .first()
      .click();
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

  async selectItemByIndex(index: number, doubleClick = false) {
    if (index < 0) {
      throw new Error("Index must be a non-negative number");
    }

    const item = this.selector.getByTestId(`selector-item-${index}`);

    if (doubleClick) {
      await item.dblclick();
    } else {
      await item.click();
    }
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

  async selectItemByTextGlobal(text: string, doubleClick = false) {
    const item = this.globalSelectorItems.filter({ hasText: text });
    await expect(item).toBeVisible();
    if (doubleClick) {
      await item.dblclick();
    } else {
      await item.click();
    }
  }
}

export default BaseSelector;
