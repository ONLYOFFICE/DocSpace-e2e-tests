import { expect, Page } from "@playwright/test";

const GROUP_TAGS_ROW = ".group-tags";
const CREATE_GROUP_TAG_BUTTON = "create_group_tag";
const CREATE_GROUP_ICON_BUTTON = "create_group_icon_button";
const SELECTOR_ITEM = '[data-testid^="selector-item-"]';
const SELECTOR_SEARCH_INPUT = "selector_search_input";
const SELECTOR_SUBMIT_BUTTON = "selector_submit_button";
const SELECTOR_CANCEL_BUTTON = "selector_cancel_button";
const MODAL_DIALOG = "modal-dialog";
const GROUP_NAME_INPUT = "enter_group_name_input";
const SUBMIT_GROUP_BUTTON = "submit_group_icon_button";
const CANCEL_GROUP_BUTTON = "cancel_group_icon_button";
const GROUP_MANAGEMENT_BUTTON = '[class*="groupManagementButton"]';
const EDIT_ROOM_GROUPS_TEXT = "Edit room groups";
const CREATE_NEW_GROUP_BUTTON = "create_new_group_button";
const GROUPING_TOGGLE_CONTAINER = "toggle-button-container";
const EDIT_GROUP_ICON_BUTTON = "edit_group_icon_button";
const DELETE_GROUP_ICON_BUTTON = "delete_group_icon_button";
const GROUP_NAME_IN_LIST = '[class*="nameGroup"]';
const CLOSE_PANEL_BUTTON = "aside_header_close_icon_button";
const DELETE_GROUP_BUTTON_TEXT = "Delete group";
const SAVE_BUTTON_TEXT = "Save";
const EMPTY_VIEW = "empty-view";
const EMPTY_VIEW_TEXT =
  "There are no rooms here. Try adding a room or remove this group";
const GROUP_TAG_LABEL = ".selected-item_label";
const ALL_ROOMS_TAG = "all_rooms_tags_measure";
const MANAGE_GROUPS_BUTTON = "#manage-groups";

class RoomsGroupTags {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get groupTagsRow() {
    return this.page.locator(GROUP_TAGS_ROW);
  }

  // Clicks the + button in the group-tags row - only visible before the first group is created
  async clickCreateGroup() {
    await this.page.getByTestId(CREATE_GROUP_TAG_BUTTON).click();
  }

  // Opens the group management panel - always accessible
  async openGroupManagementPanel() {
    await this.page.getByTestId(CREATE_GROUP_ICON_BUTTON).click();
  }

  async searchInSelector(query: string) {
    await this.page.getByTestId(SELECTOR_SEARCH_INPUT).fill(query);
  }

  async selectRoomInSelector(roomName: string) {
    await this.page
      .locator(SELECTOR_ITEM)
      .filter({
        has: this.page.getByRole("paragraph").filter({ hasText: roomName }),
      })
      .click();
  }

  async submitSelector() {
    await this.page.getByTestId(SELECTOR_SUBMIT_BUTTON).click();
  }

  async cancelSelector() {
    await this.page.getByTestId(SELECTOR_CANCEL_BUTTON).click();
  }

  async selectGroupIcon(iconName: string) {
    await this.page.getByTestId(`select_icon_${iconName}`).click();
  }

  async fillGroupNameAndCreate(groupName: string, iconName?: string) {
    await this.page
      .getByTestId(MODAL_DIALOG)
      .getByTestId(GROUP_NAME_INPUT)
      .fill(groupName);
    if (iconName) {
      await this.selectGroupIcon(iconName);
    }
    await this.page.getByTestId(SUBMIT_GROUP_BUTTON).click();
  }

  async createGroup(groupName: string, roomName: string) {
    await this.clickCreateGroup();
    await this.selectRoomInSelector(roomName);
    await this.submitSelector();
    await this.fillGroupNameAndCreate(groupName);
  }

  async cancelGroupCreation(groupName: string) {
    await this.page
      .getByTestId(MODAL_DIALOG)
      .getByTestId(GROUP_NAME_INPUT)
      .fill(groupName);
    await this.page.getByTestId(CANCEL_GROUP_BUTTON).click();
  }

  async createGroupFromSettings(groupName: string, roomName: string) {
    await this.page.getByTestId(CREATE_NEW_GROUP_BUTTON).click();
    await this.selectRoomInSelector(roomName);
    await this.submitSelector();
    await this.fillGroupNameAndCreate(groupName);
  }

  async editGroupName(currentName: string, newName: string) {
    await this.page
      .locator("div")
      .filter({
        has: this.page
          .locator(GROUP_NAME_IN_LIST)
          .filter({ hasText: currentName }),
      })
      .filter({ has: this.page.getByTestId(EDIT_GROUP_ICON_BUTTON) })
      .getByTestId(EDIT_GROUP_ICON_BUTTON)
      .click();
    const input = this.page.getByTestId(GROUP_NAME_INPUT);
    await input.clear();
    await input.fill(newName);
    await this.page.getByTestId(SUBMIT_GROUP_BUTTON).click();
  }

  async deleteGroup(groupName: string) {
    await this.page
      .locator("div")
      .filter({
        has: this.page
          .locator(GROUP_NAME_IN_LIST)
          .filter({ hasText: groupName }),
      })
      .filter({ has: this.page.getByTestId(DELETE_GROUP_ICON_BUTTON) })
      .getByTestId(DELETE_GROUP_ICON_BUTTON)
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
    await this.groupTagsRow
      .locator(GROUP_TAG_LABEL)
      .filter({ hasText: groupName })
      .click();
  }

  async selectAllRoomsTag() {
    await this.page.getByTestId(ALL_ROOMS_TAG).click();
  }

  async checkGroupTagSelected() {
    await expect(this.page).toHaveURL(/[?&]groupId=\d+/);
  }

  async checkGroupTagVisible(groupName: string) {
    await expect(
      this.groupTagsRow.locator(GROUP_TAG_LABEL).filter({ hasText: groupName }),
    ).toBeVisible({ timeout: 30000 });
  }

  async checkGroupTagNotVisible(groupName: string) {
    await expect(
      this.groupTagsRow.locator(GROUP_TAG_LABEL).filter({ hasText: groupName }),
    ).not.toBeVisible();
  }

  async toggleGrouping() {
    await this.page.getByTestId(GROUPING_TOGGLE_CONTAINER).click();
  }

  async closePanel() {
    await this.page.getByTestId(CLOSE_PANEL_BUTTON).click();
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
