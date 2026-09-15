import { expect, Page } from "@playwright/test";
import { BaseContextMenu } from "../common/BaseContextMenu";

const CREATE_ROOM = "#create-room";
const INVITE_USERS = "#invite-root-room";
const UPLOAD_FROM_DEVICE_BUTTON = "#uploads";
const MIGRATION_DATA = "#migration-data";
const CREATE_FORM_SPACE = "#create-form-space";
const AI_CHAT_OPTION = "#open-ai-chat";

const ROOMS_EMPTY_VIEW_TITLE = "No rooms here yet";
const FORMS_EMPTY_VIEW_TITLE = "No form spaces yet here";
const FORMS_EMPTY_VIEW_SUBTITLE = "Please create the first form space.";

const AI_CHAT_ITEM = {
  id: AI_CHAT_OPTION,
  title: "AI Chat",
  description: "Get answers, find files and draft content with AI.",
} as const;

// This empty-view component is shared by the Rooms and Forms root sections;
// only the item set differs.
const ROOMS_EMPTY_VIEW_ITEMS = [
  {
    id: CREATE_ROOM,
    title: "Create a new room",
    description: "Start the workspace by creating a room",
  },
  {
    id: INVITE_USERS,
    title: "Invite new users",
    description: "Send an invitation to add new members to the workspace",
  },
  {
    id: MIGRATION_DATA,
    title: "Import data",
    description:
      "Transfer your data into Apps from ONLYOFFICE Workspace, Google Workspace, or Nextcloud.",
  },
  AI_CHAT_ITEM,
] as const;

const FORMS_EMPTY_VIEW_ITEMS = [
  {
    id: CREATE_FORM_SPACE,
    title: "Create a new form space",
    description: "Start the workspace by creating a form space",
  },
  AI_CHAT_ITEM,
] as const;

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

  private get createNewFileAction() {
    return this.page.getByRole("button", {
      name: "Create a new file",
      exact: true,
    });
  }

  async checkNoRoomsExist() {
    await expect(
      this.page.getByText("Please create the first room."),
    ).toBeVisible();
  }

  async checkNoRoomsTitleExist() {
    await expect(this.page.getByText(ROOMS_EMPTY_VIEW_TITLE)).toBeVisible();
  }

  async checkNoFormSpacesExist() {
    await expect(this.page.getByText(FORMS_EMPTY_VIEW_TITLE)).toBeVisible();
    await expect(this.page.getByText(FORMS_EMPTY_VIEW_SUBTITLE)).toBeVisible();
  }

  private async checkEmptyViewItems(
    items: readonly { id: string; title: string; description: string }[],
  ) {
    for (const item of items) {
      const wrapper = this.page.locator(item.id);
      await expect(
        wrapper.getByText(item.title, { exact: true }),
      ).toBeVisible();
      await expect(
        wrapper.getByText(item.description, { exact: true }),
      ).toBeVisible();
    }
  }

  async checkRoomsEmptyViewItemsExist() {
    await this.checkEmptyViewItems(ROOMS_EMPTY_VIEW_ITEMS);
  }

  async checkFormsEmptyViewItemsExist() {
    await this.checkEmptyViewItems(FORMS_EMPTY_VIEW_ITEMS);
  }

  async clickAiChatOption() {
    await this.page.locator(AI_CHAT_OPTION).click();
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

  // Empty room's welcome screen quick action; opens the same create dropdown
  // as the toolbar "+" button, which isn't functional while the room is empty.
  async clickCreateNewFile() {
    await expect(this.createNewFileAction).toBeVisible();
    await this.createNewFileAction.click();
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
