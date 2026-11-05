import { expect, Page } from "@playwright/test";
import { calendarDayLabel } from "./BaseCalendar";

// Empty state
const METADATA_EMPTY = "info_panel_metadata_empty";
const ADD_METADATA_BUTTON = "info_panel_metadata_add_link";
// "Add metadata" menu items have no testid - matched by role + name
const ADD_FROM_TEMPLATE_ITEM = "From template";

// Template picker
const TEMPLATE_PICKER_SEARCH = "metadata_template_search";
const TEMPLATE_PICKER_ITEM = '[data-testid^="metadata_template_item_"]';
const TEMPLATE_PICKER_NEXT_BUTTON = "metadata_template_next_button";
const TEMPLATE_PICKER_CANCEL_BUTTON = "metadata_template_cancel_button";

// Fill form
const FIELD_CONTAINER = "field-container";
const FIELD_LABEL = "label";
const VALUE_INPUT = "metadata_value_input";
const DATE_SELECTOR = "date-selector";
const CALENDAR = "calendar";
const SINGLE_CHOICE_INPUT = "metadata_single_choice_input";
const MULTI_CHOICE_BUTTON = "metadata_multi_choice_button";
const MULTI_CHOICE_DROPDOWN = "metadata_multi_choice_dropdown";
const FORM_SAVE_BUTTON = "metadata_template_save_button";

// Card
const CARD = "info_panel_metadata_card";
const CARD_TEXT = "text";
const TAG_ITEM = "tag_item";
const CARD_MENU = "info_panel_metadata_card_menu";
const CARD_MENU_EDIT = "metadata-card_edit_item";
const CARD_MENU_DELETE = "metadata-card_delete_item";
const CONFIRM_DELETE_BUTTON = "confirm_delete_button";

// Folder cascade
const CASCADE_TOGGLE = "info_panel_metadata_cascade_toggle";
const TOGGLE_INPUT = "toggle-button-input";
const TOGGLE_LABEL = "toggle-button-container";
const APPLY_CONFLICT_OPTION = {
  skip: "metadata_apply_conflict_0",
  overwrite: "metadata_apply_conflict_1",
} as const;
const APPLY_BUTTON = "metadata_apply_button";

// Metadata tab of the info panel. Open the tab first via
// infoPanel.openTab("Metadata").
class InfoPanelMetadata {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ---------- Empty state / template picker ----------

  async checkEmptyState() {
    await expect(this.page.getByTestId(METADATA_EMPTY)).toBeVisible();
    await expect(this.page.getByTestId(CARD)).toHaveCount(0);
  }

  private getPickerItem(name: string) {
    return this.page
      .locator(TEMPLATE_PICKER_ITEM)
      .filter({ has: this.page.getByText(name, { exact: true }) });
  }

  async openTemplatePicker() {
    await this.page.getByTestId(ADD_METADATA_BUTTON).click();
    await this.page
      .getByRole("menuitem", { name: ADD_FROM_TEMPLATE_ITEM })
      .click();
    await expect(this.page.getByTestId(TEMPLATE_PICKER_SEARCH)).toBeVisible();
  }

  async searchTemplateInPicker(text: string) {
    await this.page
      .getByTestId(TEMPLATE_PICKER_SEARCH)
      .getByRole("textbox")
      .fill(text);
  }

  async checkTemplateInPicker(name: string) {
    await expect(this.getPickerItem(name)).toBeVisible();
  }

  // Assert a visible template first so the list is known to be loaded
  async checkTemplateNotInPicker(name: string) {
    await expect(this.getPickerItem(name)).toHaveCount(0);
  }

  async closeTemplatePicker() {
    await this.page.getByTestId(TEMPLATE_PICKER_CANCEL_BUTTON).click();
    await expect(this.page.getByTestId(TEMPLATE_PICKER_SEARCH)).toBeHidden();
  }

  // Picks the template and opens its fill form
  async selectTemplateInPicker(name: string) {
    await this.getPickerItem(name).click();
    await this.page.getByTestId(TEMPLATE_PICKER_NEXT_BUTTON).click();
    await expect(this.page.getByTestId(FORM_SAVE_BUTTON)).toBeVisible();
  }

  // ---------- Fill form ----------

  private getFormField(label: string) {
    return this.page.getByTestId(FIELD_CONTAINER).filter({
      has: this.page.getByTestId(FIELD_LABEL).getByText(label, { exact: true }),
    });
  }

  async fillTextValue(label: string, value: string) {
    await this.getFormField(label).getByTestId(VALUE_INPUT).fill(value);
  }

  // Number fields share the text input
  async fillNumberValue(label: string, value: string) {
    await this.fillTextValue(label, value);
  }

  async checkFieldError(label: string, error: string) {
    await expect(this.getFormField(label)).toContainText(error);
  }

  async checkFieldNoError(label: string, error: string) {
    await expect(this.getFormField(label)).not.toContainText(error);
  }

  // Picks a day of the month shown by default (current month)
  async selectDate(label: string, date: Date) {
    await this.getFormField(label).getByTestId(DATE_SELECTOR).click();
    await this.page
      .getByTestId(CALENDAR)
      .getByRole("button", { name: calendarDayLabel(date), exact: true })
      .click();
    await expect(this.page.getByTestId(CALENDAR)).toBeHidden();
  }

  async selectSingleOption(label: string, option: string) {
    await this.getFormField(label).getByTestId(SINGLE_CHOICE_INPUT).click();
    await this.page.getByRole("option", { name: option, exact: true }).click();
    await expect(
      this.getFormField(label).getByTestId(SINGLE_CHOICE_INPUT),
    ).toHaveText(option);
  }

  async selectMultiOptions(label: string, options: string[]) {
    await this.getFormField(label).getByTestId(MULTI_CHOICE_BUTTON).click();
    const dropdown = this.page.getByTestId(MULTI_CHOICE_DROPDOWN);
    for (const option of options) {
      await dropdown.getByRole("option", { name: option, exact: true }).click();
    }
    // Escape drops the whole form - close the dropdown by clicking the label
    await this.getFormField(label).getByTestId(FIELD_LABEL).click();
    await expect(dropdown).toBeHidden();
    for (const option of options) {
      await expect(
        this.getFormField(label).getByTestId(TAG_ITEM).getByText(option, {
          exact: true,
        }),
      ).toBeVisible();
    }
  }

  async checkSaveDisabled() {
    await expect(this.page.getByTestId(FORM_SAVE_BUTTON)).toBeDisabled();
  }

  // Save has no toast - wait for the card instead
  async saveValues() {
    await this.page.getByTestId(FORM_SAVE_BUTTON).click();
    await expect(this.page.getByTestId(FORM_SAVE_BUTTON)).toBeHidden();
    await expect(this.page.getByTestId(CARD).first()).toBeVisible();
  }

  // ---------- Card ----------

  private getCard(templateName: string) {
    return this.page.getByTestId(CARD).filter({
      has: this.page.getByTestId(CARD_TEXT).getByText(templateName, {
        exact: true,
      }),
    });
  }

  // Each card field is a div holding the label <p> and the value
  private getCardField(templateName: string, label: string) {
    return this.getCard(templateName).locator(
      `div:has(> [data-testid="${CARD_TEXT}"]:text-is("${label}"))`,
    );
  }

  async checkCardVisible(templateName: string) {
    await expect(this.getCard(templateName)).toBeVisible();
  }

  async checkCardValue(templateName: string, label: string, value: string) {
    await expect(this.getCardField(templateName, label)).toContainText(value);
  }

  async checkCardTags(templateName: string, label: string, tags: string[]) {
    const field = this.getCardField(templateName, label);
    await expect(field.getByTestId(TAG_ITEM)).toHaveText(tags);
  }

  async checkCardNotVisible(templateName: string) {
    await expect(this.getCard(templateName)).toHaveCount(0);
  }

  // Opens the fill form prefilled with the saved values; Save stays
  // disabled until something changes
  async openCardEdit(templateName: string) {
    await this.getCard(templateName).getByTestId(CARD_MENU).click();
    await this.page.getByTestId(CARD_MENU_EDIT).click();
    await expect(this.page.getByTestId(FORM_SAVE_BUTTON)).toBeVisible();
  }

  // Removes the template and its values from this item only; no toast
  async removeCard(templateName: string) {
    await this.getCard(templateName).getByTestId(CARD_MENU).click();
    await this.page.getByTestId(CARD_MENU_DELETE).click();
    await this.page.getByTestId(CONFIRM_DELETE_BUTTON).click();
    await this.checkCardNotVisible(templateName);
  }

  // ---------- Folder cascade ----------

  private get cascadeToggle() {
    return this.page.getByTestId(CASCADE_TOGGLE);
  }

  // Shown on a folder only after a template has been saved on it
  async checkCascadeToggleVisible() {
    await expect(this.cascadeToggle).toBeVisible();
  }

  async checkCascadeToggleHidden() {
    await expect(this.cascadeToggle).toBeHidden();
  }

  async checkCascadeEnabled(enabled: boolean) {
    const input = this.cascadeToggle.getByTestId(TOGGLE_INPUT);
    if (enabled) await expect(input).toBeChecked();
    else await expect(input).not.toBeChecked();
  }

  // Turning cascade on opens the "Apply metadata" dialog; the caller checks
  // the completion toast
  async enableCascade(conflict: "skip" | "overwrite") {
    await this.cascadeToggle.getByTestId(TOGGLE_LABEL).click();
    await this.page.getByTestId(APPLY_CONFLICT_OPTION[conflict]).click();
    await this.page.getByTestId(APPLY_BUTTON).click();
    await expect(this.page.getByTestId(APPLY_BUTTON)).toBeHidden();
    await this.checkCascadeEnabled(true);
  }

  // Turning cascade off has no dialog and no toast
  async disableCascade() {
    await this.cascadeToggle.getByTestId(TOGGLE_LABEL).click();
    await this.checkCascadeEnabled(false);
  }
}

export default InfoPanelMetadata;
