import { expect, Page } from "@playwright/test";

const GROUP_TAGS_ROW = ".group-tags";
const CREATE_GROUP_BUTTON_TEXT = "Create group";
const SELECTOR_ITEM = '[data-testid^="selector-item-"]';
const SELECTOR_SUBMIT_BUTTON = "selector_submit_button";
const MODAL_DIALOG = "modal-dialog";
const TEXT_INPUT = "text-input";
const CREATE_BUTTON_TEXT = "Create";
const GROUP_MANAGEMENT_BUTTON = '[class*="groupManagementButton"]';
const EDIT_ROOM_GROUPS_TEXT = "Edit room groups";
const SETTINGS_CREATE_GROUP_BUTTON = "selector-add-button";
const GROUPING_SETTINGS_PANEL = '[class*="settingRoomGroups"]';
const GROUPING_TOGGLE = "toggle-button";
const ICON_BUTTON_INNER =
  '[class*="notSelectable"] > div > .injected-svg > g > path';
const EDIT_GROUP_ICON = `.edit_icon ${ICON_BUTTON_INNER}`;
const DELETE_GROUP_ICON = `.delete_icon ${ICON_BUTTON_INNER}`;
const DELETE_GROUP_BUTTON_TEXT = "Delete group";
const SAVE_BUTTON_TEXT = "Save";
const EMPTY_VIEW = "empty-view";
const EMPTY_VIEW_TEXT =
  "There are no rooms here. Try adding a room or remove this group";
const MANAGE_GROUPS_BUTTON = "#manage-groups";

class RoomsGroupTags {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get groupTagsRow() {
    return this.page.locator(GROUP_TAGS_ROW);
  }

  async clickCreateGroup() {
    await this.groupTagsRow.getByText(CREATE_GROUP_BUTTON_TEXT).click();
  }

  async selectRoomInSelector(roomName: string) {
    await this.page
      .locator(SELECTOR_ITEM)
      .filter({ hasText: roomName })
      .click();
  }

  async submitSelector() {
    await this.page.getByTestId(SELECTOR_SUBMIT_BUTTON).click();
  }

  async fillGroupNameAndCreate(groupName: string) {
    await this.page
      .getByTestId(MODAL_DIALOG)
      .getByTestId(TEXT_INPUT)
      .fill(groupName);
    await this.page.getByRole("button", { name: CREATE_BUTTON_TEXT }).click();
  }

  async createGroup(groupName: string, roomName: string) {
    await this.clickCreateGroup();
    await this.selectRoomInSelector(roomName);
    await this.submitSelector();
    await this.fillGroupNameAndCreate(groupName);
  }

  async createGroupFromSettings(groupName: string, roomName: string) {
    await this.page.getByTestId(SETTINGS_CREATE_GROUP_BUTTON).click();
    await this.selectRoomInSelector(roomName);
    await this.submitSelector();
    await this.fillGroupNameAndCreate(groupName);
  }

  async editGroupName(currentName: string, newName: string) {
    await this.page
      .locator(SELECTOR_ITEM)
      .filter({ hasText: currentName })
      .locator(EDIT_GROUP_ICON)
      .first()
      .click();
    const input = this.page.getByTestId(TEXT_INPUT);
    await input.clear();
    await input.fill(newName);
    await this.page.keyboard.press("Enter");
  }

  async deleteGroup(groupName: string) {
    await this.page
      .locator(SELECTOR_ITEM)
      .filter({ hasText: groupName })
      .locator(DELETE_GROUP_ICON)
      .first()
      .click();
    await this.page
      .getByRole("button", { name: DELETE_GROUP_BUTTON_TEXT })
      .click();
  }

  async openGroupSettings(groupName: string) {
    await this.groupTagsRow.getByText(groupName).click();
    await this.page.locator(GROUP_MANAGEMENT_BUTTON).click();
    await this.page.getByText(EDIT_ROOM_GROUPS_TEXT).click();
  }

  async selectGroupTag(groupName: string) {
    await this.groupTagsRow.getByText(groupName).click();
  }

  async checkGroupTagSelected(_groupName: string) {
    await expect(this.page).toHaveURL(/[?&]groupId=\d+/);
  }

  async checkGroupTagVisible(groupName: string) {
    await expect(this.groupTagsRow.getByText(groupName)).toBeVisible();
  }

  async checkGroupTagNotVisible(groupName: string) {
    await expect(this.groupTagsRow.getByText(groupName)).not.toBeVisible();
  }

  async toggleGrouping() {
    await this.page
      .locator(GROUPING_SETTINGS_PANEL)
      .getByTestId(GROUPING_TOGGLE)
      .click();
  }

  async clickSave() {
    await this.page.getByRole("button", { name: SAVE_BUTTON_TEXT }).click();
  }

  async checkGroupTagsRowVisible() {
    await expect(this.page.locator(GROUP_TAGS_ROW)).toBeVisible();
  }

  async checkGroupTagsRowNotVisible() {
    await expect(this.page.locator(GROUP_TAGS_ROW)).not.toBeVisible();
  }

  async checkEmptyGroupView() {
    await expect(this.page.getByTestId(EMPTY_VIEW)).toBeVisible();
    await expect(this.page.getByText(EMPTY_VIEW_TEXT)).toBeVisible();
  }

  async checkManageGroupsButtonVisible() {
    await expect(this.page.locator(MANAGE_GROUPS_BUTTON)).toBeVisible();
  }
}

export default RoomsGroupTags;
