import { expect, Page } from "@playwright/test";
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
const CHANGE_QUOTA_UNIT_COMBO =
  '[data-testid="quota-combo-box"] [data-test-id="combo-button"]';
const CHANGE_QUOTA_SUBMIT = "change_quota_dialog_submit";
const CHANGE_QUOTA_CANCEL = "change_quota_dialog_cancel";

const ADD_NEW_LINK_BUTTON = "info_panel_members_add_new_link_button";
const EXTERNAL_LINKS_DISABLED_TEXT =
  "external links are disabled by your administrator";

const HISTORY_EXPORT_POPUP = "info_history_export_popup";
const HISTORY_EXPORT_ALL_OPTION = "info_history_export_all";
const HISTORY_EXPORT_DATE_RANGE_OPTION = "info_history_export_date-range";
const HISTORY_EXPORT_SUBMIT_BUTTON = "info_history_export_submit";
const HISTORY_EXPORT_CANCEL_BUTTON = "info_history_export_cancel";

export type THistoryExportRange = "All history" | "Date range";

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

  // Returns the member row that contains the given display name (e.g. a group name)
  public getMemberByName(name: string) {
    return this.infoPanel
      .locator(".members-list-item")
      .filter({ hasText: name });
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

  async removeMemberByName(name: string) {
    const memberRow = this.getMemberByName(name);
    await memberRow.locator('[data-test-id="combo-button"]').click();
    await this.page.getByRole("listbox").getByText("Remove").click();
    await expect(memberRow).not.toBeVisible();
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
    const button = this.page.getByTestId(ADD_NEW_LINK_BUTTON);
    await button.waitFor({ state: "visible" });
    await button.click();
  }

  async expectExternalLinksDisabled() {
    await expect(
      this.page.getByText(EXTERNAL_LINKS_DISABLED_TEXT, { exact: false }),
    ).toBeVisible();
    await expect(this.page.getByTestId(ADD_NEW_LINK_BUTTON)).toHaveCount(0);
  }

  // Export history popup - opened from the inherited `exportHistoryButton`
  // (base History tab toolbar, see InfoPanel.ts).
  private get exportHistoryPopup() {
    return this.page.getByTestId(HISTORY_EXPORT_POPUP);
  }
  private get exportHistoryAllOption() {
    return this.page.getByTestId(HISTORY_EXPORT_ALL_OPTION);
  }
  private get exportHistoryDateRangeOption() {
    return this.page.getByTestId(HISTORY_EXPORT_DATE_RANGE_OPTION);
  }
  private get exportHistorySubmitButton() {
    return this.page.getByTestId(HISTORY_EXPORT_SUBMIT_BUTTON);
  }
  private get exportHistoryCancelButton() {
    return this.page.getByTestId(HISTORY_EXPORT_CANCEL_BUTTON);
  }

  async openExportHistoryMenu() {
    // Wait for the History tab's own content to render before interacting
    // with its toolbar - avoids racing the tab switch from openTab("History").
    await expect(this.historyList).toBeVisible();
    await this.exportHistoryButton.click();
    await expect(this.exportHistoryPopup).toBeVisible();
  }

  async cancelExportHistoryMenu() {
    await this.exportHistoryCancelButton.click();
    await expect(this.exportHistoryPopup).not.toBeVisible();
  }

  async selectExportHistoryRange(range: THistoryExportRange) {
    const option =
      range === "All history"
        ? this.exportHistoryAllOption
        : this.exportHistoryDateRangeOption;
    await option.click();
  }

  // Submits the export. The report is generated asynchronously; once ready a
  // toast confirms it and the finished report opens automatically in a new
  // tab, so the caller gets that tab's Page back to assert against.
  async submitExportHistory(): Promise<Page> {
    const [reportPage] = await Promise.all([
      this.page.context().waitForEvent("page", { timeout: 60_000 }),
      this.exportHistorySubmitButton.click(),
    ]);
    await expect(this.exportHistoryPopup).not.toBeVisible();
    return reportPage;
  }

  async checkExportHistoryToastVisible() {
    await this.toast.checkToastMessage("exported to Files", 30_000);
  }

  async exportHistory(
    range: THistoryExportRange = "All history",
  ): Promise<Page> {
    await this.openExportHistoryMenu();
    await this.selectExportHistoryRange(range);
    return this.submitExportHistory();
  }

  async openGoToDateCalendar() {
    await expect(this.historyList).toBeVisible();
    await this.goToDateButton.click();
  }

  // A day cell in the currently displayed month of the "Go to date" calendar.
  // Days outside the current month ("isSecondary") are excluded by default since
  // the same day number can otherwise match a cell from the previous/next month.
  // Pass `crossesMonth: true` for a target date that falls in the adjacent month
  // (e.g. "yesterday" when today is the 1st) - there it's the only matching cell.
  private historyCalendarDay(day: number, crossesMonth = false) {
    const filter = crossesMonth
      ? "button"
      : "button:not([class*='isSecondary'])";
    return this.infoPanel
      .getByRole("button", { name: day.toString(), exact: true })
      .and(this.page.locator(filter));
  }

  // Days with no activity are disabled - the calendar only lets you jump to a
  // date that actually has history entries.
  async checkHistoryDayDisabled(day: number, crossesMonth = false) {
    await expect(this.historyCalendarDay(day, crossesMonth)).toBeDisabled();
  }

  async selectHistoryDay(day: number, crossesMonth = false) {
    const dayButton = this.historyCalendarDay(day, crossesMonth);
    await expect(dayButton).toBeEnabled();
    await dayButton.click();
  }

  // Picks today's date in the "Go to date" calendar that opens under the toolbar.
  async selectHistoryToday() {
    await this.selectHistoryDay(new Date().getDate());
  }
}
export default RoomInfoPanel;
