import InfoPanel from "../common/InfoPanel";

const SEARCH_BUTTON = "#info_search";
const SEARCH_INPUT = 'input[placeholder=" "]';
const NO_MEMBERS_FOUND_TEXT = "No members found";
const SEARCH_CLOSE_BUTTON = "#search_close";
const ADD_USER_BUTTON = "#info_add-user";
// Context menu button inside each member row in the members list
const MEMBER_CONTEXT_MENU_BUTTON =
  '.members-list-item [data-test-id="combo-button"]';
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
}
export default RoomInfoPanel;
