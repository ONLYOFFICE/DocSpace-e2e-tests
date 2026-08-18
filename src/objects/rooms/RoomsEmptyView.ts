import { expect, Page } from "@playwright/test";
import { BaseContextMenu } from "../common/BaseContextMenu";

const CREATE_ROOM = "#create-room";
const INVITE_USERS = "#invite-root-room";
const UPLOAD_FROM_DEVICE_BUTTON = "#uploads";

class RoomsEmptyView {
  page: Page;
  contextMenu: BaseContextMenu;

  constructor(page: Page) {
    this.page = page;
    this.contextMenu = new BaseContextMenu(page);
  }

  private get createNewRoom() {
    return this.page.locator(CREATE_ROOM);
  }

  private get inviteUsersButton() {
    return this.page.locator(INVITE_USERS);
  }

  async checkNoRoomsExist() {
    await expect(
      this.page.getByText("Please create the first room."),
    ).toBeVisible();
  }

  async checkNoTemplatesExist() {
    await expect(this.page.getByText("No templates here yet")).toBeVisible();
  }

  async checkEmptyRoomExist(roomName: string) {
    await expect(
      this.page.getByRole("button", { name: `Welcome to the ${roomName}` }),
    ).toBeVisible({ timeout: 10000 });
  }

  async openCreateDialog() {
    await this.createNewRoom.click();
  }

  async uploadFilesFromDevice(filePaths: string | string[]) {
    const paths = Array.isArray(filePaths) ? filePaths : [filePaths];
    const uploadButton = this.page.locator(UPLOAD_FROM_DEVICE_BUTTON);
    await expect(uploadButton).toBeVisible();
    await uploadButton.click();
    await this.contextMenu.checkMenuExists();
    const [fileChooser] = await Promise.all([
      this.page.waitForEvent("filechooser"),
      this.contextMenu.clickOption({
        type: "data-testid",
        value: "upload-files",
      }),
    ]);
    await fileChooser.setFiles(paths);
  }

  async createFile(fileName: string) {
    await this.page.getByRole("button", { name: /actions/i }).click();
    await this.page.getByRole("menuitem", { name: "Document" }).click();
    const nameInput = this.page.locator('input[data-testid="text-input"]');
    await nameInput.fill(fileName);
    await this.page
      .locator('button[type="submit"][aria-label="Create"]')
      .click();
  }
}

export default RoomsEmptyView;
