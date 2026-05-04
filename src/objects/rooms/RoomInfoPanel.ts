import InfoPanel from "../common/InfoPanel";

const SHARE_ROOM_BUTTON = "#share-room";
const SEARCH_BUTTON = "#info_search";
const SEARCH_INPUT = 'input[placeholder=" "]';
const NO_MEMBERS_FOUND_TEXT = "No members found";
const SEARCH_CLOSE_BUTTON = "#search_close";
const ADD_USER_BUTTON = "#info_add-user";
// Context menu button inside each member row in the members list
const MEMBER_CONTEXT_MENU_BUTTON =
  '.members-list-item [data-test-id="combo-button"]';

const STORAGE_QUOTA_COMBO = '#Storage [data-test-id="combo-button-arrow"]';
const QUOTA_OPTION_CHANGE = "drop_down_item_change-quota";
const QUOTA_OPTION_DEFAULT = "drop_down_item_default-quota";
const QUOTA_OPTION_NO_QUOTA = "drop_down_item_no-quota";

const CHANGE_QUOTA_INPUT = "quota-text-input";
const CHANGE_QUOTA_UNIT_COMBO = '[data-testid="quota-combo-box"] [data-test-id="combo-button"]';
const CHANGE_QUOTA_SUBMIT = "change_quota_dialog_submit";
const CHANGE_QUOTA_CANCEL = "change_quota_dialog_cancel";
class RoomInfoPanel extends InfoPanel {
  private get searchButton() {
    return this.infoPanel.locator(SEARCH_BUTTON);
  }
  private get searchInput() {
    return this.infoPanel.locator(SEARCH_INPUT);
  }
  public get noMembersFound() {
    return this.page.getByText(NO_MEMBERS_FOUND_TEXT);
  }
  public get searchCloseButton() {
    return this.page.locator(SEARCH_CLOSE_BUTTON);
  }
  public get addUserButton() {
    return this.infoPanel.locator(ADD_USER_BUTTON);
  }
  // Returns all context menu buttons in the members list
  public get memberContextMenuButtons() {
    return this.page.locator(MEMBER_CONTEXT_MENU_BUTTON);
  }
  // Returns the member row that contains the given email address
  public getMemberByEmail(email: string) {
    return this.infoPanel
      .locator(".members-list-item")
      .filter({ hasText: email });
  }
  async clickSearchButton() {
    await this.searchButton.click();
    await this.searchInput.waitFor({ state: "visible" });
  }
  async search(text: string) {
    await this.clickSearchButton();
    await this.searchInput.fill(text);
  }
  async clearSearch() {
    await this.searchCloseButton.click();
  }
  async clickAddUser() {
    await this.addUserButton.click();
  }
  async openSharePanel() {
    await this.close();
    await this.page.locator(SHARE_ROOM_BUTTON).click();
    await this.checkInfoPanelExist();
  }

  private get storageQuotaCombo() {
    return this.infoPanel.locator(STORAGE_QUOTA_COMBO);
  }

  async openStorageQuotaCombo() {
    await this.storageQuotaCombo.click();
  }

  async selectChangeQuota() {
    await this.openStorageQuotaCombo();
    await this.page.getByTestId(QUOTA_OPTION_CHANGE).click();
  }

  async selectDefaultQuota() {
    await this.openStorageQuotaCombo();
    await this.page.getByTestId(QUOTA_OPTION_DEFAULT).click();
  }

  async selectNoQuota() {
    await this.openStorageQuotaCombo();
    await this.page.getByTestId(QUOTA_OPTION_NO_QUOTA).click();
  }

  async setRoomQuota(value: string, unit: "KB" | "MB" | "GB" | "TB") {
    await this.selectChangeQuota();
    await this.page.getByTestId(CHANGE_QUOTA_INPUT).fill(value);
    await this.page.locator(CHANGE_QUOTA_UNIT_COMBO).click();
    await this.page.getByRole("option", { name: unit, exact: true }).click();
    await this.page.getByTestId(CHANGE_QUOTA_SUBMIT).click();
  }

  async cancelChangeQuota() {
    await this.page.getByTestId(CHANGE_QUOTA_CANCEL).click();
  }

  async addNewSharedLink() {
    const button = this.page.getByTestId(
      "info_panel_members_add_new_link_button",
    );
    await button.waitFor({ state: "visible" });
    await button.click();
  }
}
export default RoomInfoPanel;
