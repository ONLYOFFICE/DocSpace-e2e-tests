import { TRoomCreateTitles } from "@/src/utils/constants/rooms";
import { expect, Page } from "@playwright/test";

class BaseSelector {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  protected get selector() {
    return this.page.getByTestId("selector");
  }

  protected get selectorBody() {
    return this.selector.locator(".selector-body-scroll");
  }

  private get selectorAddButton() {
    return this.page.getByTestId("selector-add-button");
  }

  private get emptyContainerCreateNewItem() {
    return this.page.locator(".empty-folder_container-links").first();
  }

  private get newSelectorItem() {
    return this.selectorBody
      .locator("input.input-component.not-selectable")
      .locator("..");
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

  async gotoBack() {
    await this.selector.getByText("Back", { exact: true }).click();
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

  async selectItemByName(name: string) {
    await this.selector.getByText(name, { exact: true }).click();
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
    await this.newSelectorItem.getByRole("textbox").fill(name);
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
