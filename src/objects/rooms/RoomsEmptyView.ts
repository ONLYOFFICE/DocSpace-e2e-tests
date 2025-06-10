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

  async clickCreateNewRoom() {
    await this.createNewRoom.click();
  }
}

export default RoomsEmptyView;
