import { expect, Page } from "@playwright/test";

const CREATE_ROOM = "#create-room";
const INVITE_USERS = "#invite-root-room";

class RoomsEmptyView {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get createNewRoom() {
    return this.page.locator(CREATE_ROOM);
  }

  private get inviteUsersButton() {
    return this.page.locator(INVITE_USERS);
  }

  async checkNoRoomsExist() {
    await expect(this.page.getByText("Welcome to DocSpace")).toBeVisible();
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

  async createFile(fileName: string) {
    await this.page.getByRole('button', { name: /actions/i }).click();
    await this.page.getByRole('menuitem', { name: 'Document' }).click();
    const nameInput = this.page.locator('input[data-testid="text-input"]');
  await nameInput.fill(fileName);
  await this.page.locator('button[type="submit"][aria-label="Create"]').click();
  }
}

export default RoomsEmptyView;
