import { expect, Page } from "@playwright/test";
import ContactsTable from "./ContactsTable";
import {
  aiLimitPeriods,
  changeAiLimitDialog,
  TAiLimitPeriod,
} from "@/src/utils/constants/ai";

// Cell testid is "contacts_ai_limit_<rowIndex>", so it is matched by prefix
// inside the user's row. The storage quota cell has a "combobox" too - always
// scope the combobox inside this cell.
const AI_LIMIT_CELL = '[data-testid^="contacts_ai_limit_"]';
const AI_SPENDING_CELL = '[data-testid^="contacts_ai_spending_cell_"]';
const AI_SPENDING_SETTING = "table_settings_AISpending";
const COMBOBOX = "combobox";
const DROPDOWN = "dropdown";
const MENU_CHANGE_LIMIT = "drop_down_item_change-limit";
const MENU_SET_TO_DEFAULT = "drop_down_item_default-limit";
const DIALOG_AMOUNT_INPUT = "change_ai_limit_amount_input";
const DIALOG_PERIOD_COMBOBOX = "change_ai_limit_period_combobox";
const DIALOG_SUBMIT = "change_ai_limit_dialog_submit";
const DIALOG_CANCEL = "change_ai_limit_dialog_cancel";
const DIALOG_CLOSE = "aside_header_close_icon_button";
const COMBO_BUTTON = '[data-test-id="combo-button"]';

const usd = (amount: number) => `US$${amount.toFixed(2)}`;

// Contacts > "AI spending" column and the "Change AI limit" dialog.
class ContactsAiLimit {
  private page: Page;
  private table: ContactsTable;

  constructor(page: Page, table: ContactsTable) {
    this.page = page;
    this.table = table;
  }

  // The column is offered in the table settings only while the limit per
  // user is on.
  async expectColumnAvailable(available: boolean) {
    await expect(this.table.tableRows.first()).toBeVisible();
    await this.table.expectColumnSettingAvailable(
      AI_SPENDING_SETTING,
      available,
    );
  }

  // The column is off by default and is turned on in the table settings.
  async showColumn() {
    const cells = this.page.locator(AI_SPENDING_CELL);
    await expect(this.table.tableRows.first()).toBeVisible();
    await expect(cells).toHaveCount(0);
    await this.table.toggleColumnSetting(AI_SPENDING_SETTING);
    await expect(cells.first()).toBeVisible();
  }

  private async cell(userName: string) {
    const row = await this.table.getRowByNameText(userName);
    return row.locator(AI_LIMIT_CELL);
  }

  // Every row renders its own AI limit dropdown (closed ones stay in the DOM),
  // so only the visible one is the open menu.
  private get menu() {
    return this.page
      .getByTestId(DROPDOWN)
      .filter({ has: this.page.getByTestId(MENU_CHANGE_LIMIT) })
      .filter({ visible: true });
  }

  private get dialog() {
    return this.page
      .getByRole("dialog")
      .filter({ hasText: changeAiLimitDialog.title });
  }

  // Cell text is "US$0.00 / " followed by the combobox "US$10.00 per day".
  async expectLimit(
    userName: string,
    limit: { spent: number; amount: number; period: TAiLimitPeriod },
  ) {
    const cell = await this.cell(userName);
    await expect(cell).toContainText(`${usd(limit.spent)} / `);
    await expect(cell.getByTestId(COMBOBOX)).toContainText(
      `${usd(limit.amount)} ${aiLimitPeriods[limit.period].label}`,
    );
  }

  async openMenu(userName: string) {
    const cell = await this.cell(userName);
    await cell.getByTestId(COMBOBOX).click();
    await expect(this.menu).toBeVisible();
  }

  // "Set to default" is offered only when the user has an individual limit.
  async expectMenuItems(hasIndividualLimit: boolean) {
    await expect(this.menu.getByTestId(MENU_CHANGE_LIMIT)).toHaveText(
      changeAiLimitDialog.title,
    );
    const setToDefault = this.menu.getByTestId(MENU_SET_TO_DEFAULT);
    if (hasIndividualLimit) {
      await expect(setToDefault).toBeVisible();
    } else {
      await expect(setToDefault).toHaveCount(0);
    }
  }

  async closeMenu() {
    await this.page.keyboard.press("Escape");
    await expect(this.menu).toBeHidden();
  }

  async openChangeLimitDialog(userName: string) {
    await this.openMenu(userName);
    await this.menu.getByTestId(MENU_CHANGE_LIMIT).click();
    await expect(this.dialog).toBeVisible();
  }

  async setToDefault(userName: string) {
    await this.openMenu(userName);
    await this.menu.getByTestId(MENU_SET_TO_DEFAULT).click();
    await expect(this.menu).toBeHidden();
  }

  // "Current period: Spent US$0.00 of US$10.00 (0%)." has no testids.
  async expectDialogContent(limit: {
    spent: number;
    amount: number;
    period: TAiLimitPeriod;
  }) {
    await expect(this.dialog).toContainText(changeAiLimitDialog.title);
    await expect(this.dialog).toContainText(changeAiLimitDialog.description);
    await expect(this.dialog).toContainText(
      `Spent ${usd(limit.spent)} of ${usd(limit.amount)}`,
    );
    await this.expectDialogAmount(limit.amount);
    await this.expectDialogPeriod(limit.period);
  }

  async expectDialogAmount(amount: number) {
    await expect(this.dialog.getByTestId(DIALOG_AMOUNT_INPUT)).toHaveValue(
      new RegExp(`^${amount}(\\.0+)?$`),
    );
  }

  async expectDialogPeriod(period: TAiLimitPeriod) {
    await expect(this.dialog.getByTestId(DIALOG_PERIOD_COMBOBOX)).toContainText(
      aiLimitPeriods[period].label,
    );
  }

  async expectDialogPeriodHint(
    period: keyof typeof changeAiLimitDialog.periodHint,
  ) {
    await expect(this.dialog).toContainText(
      changeAiLimitDialog.periodHint[period],
    );
  }

  async fillDialogAmount(amount: number) {
    await this.dialog.getByTestId(DIALOG_AMOUNT_INPUT).fill(String(amount));
  }

  // The dropdown is portaled out of the dialog; its options reuse the
  // limit_period_* testids of the AI limits tab.
  async selectDialogPeriod(period: TAiLimitPeriod) {
    await this.dialog
      .getByTestId(DIALOG_PERIOD_COMBOBOX)
      .locator(COMBO_BUTTON)
      .click();
    const option = this.page
      .getByRole("listbox")
      .filter({ visible: true })
      .getByTestId(aiLimitPeriods[period].option);
    await option.click();
    await this.expectDialogPeriod(period);
  }

  async submitDialog() {
    await this.dialog.getByTestId(DIALOG_SUBMIT).click();
    await expect(this.dialog).toBeHidden();
  }

  async cancelDialog() {
    await this.dialog.getByTestId(DIALOG_CANCEL).click();
    await expect(this.dialog).toBeHidden();
  }

  async closeDialog() {
    await this.dialog.getByTestId(DIALOG_CLOSE).click();
    await expect(this.dialog).toBeHidden();
  }
}

export default ContactsAiLimit;
