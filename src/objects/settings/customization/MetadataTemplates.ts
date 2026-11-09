import { expect, Page } from "@playwright/test";
import { getPortalUrl } from "@/config";

export type TMetadataFieldType =
  | "Text"
  | "Number"
  | "Date"
  | "Single select"
  | "Multi select";

export type TMetadataField = {
  name: string;
  type: TMetadataFieldType;
  // Required for "Single select" / "Multi select", ignored for other types
  options?: string[];
};

// Tab root
const METADATA_TEMPLATES_PATH =
  "/portal-settings/customization/metadata-templates";
const CREATE_TEMPLATE_BUTTON = "metadata_create_template_button";
// Users without access are redirected to the error page
const ACCESS_DENIED_URL = /\/error\/401/;
const ACCESS_DENIED_TEXT = "Sorry, the resource is not currently accessible.";

// Templates table
const TABLE_CONTAINER = "table-container";
const TEMPLATE_ROW = '[data-testid^="metadata_template_row_"]';
const TEMPLATE_ROW_VISIBLE_TOGGLE =
  '[data-testid^="metadata_template_visible_"]';
const TABLE_CELL = "table-cell";
const ROW_CONTEXT_MENU_BUTTON = "context-menu-button";
// Row menu items have no testid - matched by role + name
const ROW_MENU_EDIT = "Edit";
const ROW_MENU_DELETE = "Delete";
const CONFIRM_DELETE_BUTTON = "confirm_delete_button";

// Template create/edit panel
const TEMPLATE_PANEL = "metadata_template_panel";
const PANEL_HEADER = "aside-header";
const TEMPLATE_VISIBLE_TOGGLE = "metadata_template_visible_toggle";
const TOGGLE_INPUT = "toggle-button-input";
const TOGGLE_LABEL = "toggle-button-container";
const TEMPLATE_NAME_INPUT = "metadata_template_name_input";
const ADD_FIELD_BUTTON = "metadata_add_field_button";
const FIELD_ROW = 'div:has(> [data-testid="metadata_field_drag_handle"])';
const FIELD_CONTEXT_MENU_BUTTON = "context-menu-button";
const FIELD_MENU_EDIT = "edit_item";
const FIELD_MENU_DELETE = "delete_item";
const TEMPLATE_SAVE_BUTTON = "metadata_template_save_button";

// Add/Edit field panel
const FIELD_NAME_INPUT = "metadata_field_name_input";
const FIELD_TYPE_COMBOBOX = "metadata_field_type_combobox";
const FIELD_OPTION_INPUT_PLACEHOLDER = "Option value";
const ADD_OPTION_BUTTON = "metadata_add_option_button";
const FIELD_SUBMIT_BUTTON = "metadata_field_submit_button";
const OPTION_DELETE_ICON = "icon-button";
// Shared by the template panel and the field panel - always scope it
const PANEL_CANCEL_BUTTON = "metadata_cancel_button";

// Dropdown items are keyed by the backend field type enum
const FIELD_TYPE_ITEM: Record<TMetadataFieldType, string> = {
  Text: "drop_down_item_0",
  Date: "drop_down_item_1",
  Number: "drop_down_item_2",
  "Single select": "drop_down_item_3",
  "Multi select": "drop_down_item_4",
};

const SELECT_TYPES: TMetadataFieldType[] = ["Single select", "Multi select"];

class MetadataTemplates {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ---------- Tab / table ----------

  // Direct link - used to check access for users without the Settings menu
  async openByUrl(portalDomain: string) {
    await this.page.goto(
      `${getPortalUrl(portalDomain)}${METADATA_TEMPLATES_PATH}`,
    );
  }

  async checkAccessDenied() {
    await expect(this.page).toHaveURL(ACCESS_DENIED_URL);
    await expect(this.page.getByText(ACCESS_DENIED_TEXT)).toBeVisible();
    await expect(this.createTemplateButton).toHaveCount(0);
  }

  get createTemplateButton() {
    return this.page.getByTestId(CREATE_TEMPLATE_BUTTON);
  }

  private get table() {
    return this.page.getByTestId(TABLE_CONTAINER);
  }

  // The list is virtualized: one role=row wraps all templates, so scope by
  // the per-template row testid. The first cell holds the template name.
  private getRow(name: string) {
    return this.page.locator(TEMPLATE_ROW).filter({
      has: this.page
        .getByTestId(TABLE_CELL)
        .first()
        .getByText(name, { exact: true }),
    });
  }

  private getRowCell(name: string, index: number) {
    return this.getRow(name).getByTestId(TABLE_CELL).nth(index);
  }

  private getRowVisibleToggle(name: string) {
    return this.getRow(name).locator(TEMPLATE_ROW_VISIBLE_TOGGLE);
  }

  async checkTabOpened() {
    await expect(this.createTemplateButton).toBeVisible();
  }

  async checkTemplateRow(
    name: string,
    expected: { fieldsCount: number; author: string },
  ) {
    await expect(this.getRow(name)).toBeVisible();
    await expect(this.getRowCell(name, 1)).toHaveText(
      String(expected.fieldsCount),
    );
    // Author cell also renders the role badge (e.g. "OWNER")
    await expect(this.getRowCell(name, 2)).toContainText(expected.author);
  }

  async checkTemplateNotInTable(name: string) {
    await expect(this.getRow(name)).toHaveCount(0);
  }

  async checkTableHidden() {
    await expect(this.table).toBeHidden();
  }

  async checkVisibilityInTable(name: string, visible: boolean) {
    const input = this.getRowVisibleToggle(name).getByTestId(TOGGLE_INPUT);
    if (visible) await expect(input).toBeChecked();
    else await expect(input).not.toBeChecked();
  }

  // Row toggle saves immediately, without a toast
  async setVisibilityInTable(name: string, visible: boolean) {
    const toggle = this.getRowVisibleToggle(name);
    if ((await toggle.getByTestId(TOGGLE_INPUT).isChecked()) !== visible) {
      await toggle.getByTestId(TOGGLE_LABEL).click();
    }
    await this.checkVisibilityInTable(name, visible);
  }

  private async openRowMenu(name: string) {
    await this.getRow(name).getByTestId(ROW_CONTEXT_MENU_BUTTON).click();
  }

  async openEditPanel(name: string) {
    await this.openRowMenu(name);
    await this.page.getByRole("menuitem", { name: ROW_MENU_EDIT }).click();
    await this.checkTemplatePanelHeader("Edit template");
    await expect(this.templateNameInput).toHaveValue(name);
  }

  async deleteTemplate(name: string) {
    await this.openRowMenu(name);
    await this.page.getByRole("menuitem", { name: ROW_MENU_DELETE }).click();
    await this.page.getByTestId(CONFIRM_DELETE_BUTTON).click();
  }

  // ---------- Template panel ----------

  private get templatePanel() {
    return this.page.getByTestId(TEMPLATE_PANEL);
  }

  private get templateNameInput() {
    return this.page.getByTestId(TEMPLATE_NAME_INPUT);
  }

  private get templateSaveButton() {
    return this.page.getByTestId(TEMPLATE_SAVE_BUTTON);
  }

  private getFieldRow(name: string) {
    return this.templatePanel.locator(FIELD_ROW).filter({ hasText: name });
  }

  async openCreatePanel() {
    await this.createTemplateButton.click();
    await this.checkTemplatePanelHeader("New template");
  }

  async checkTemplatePanelHeader(header: "New template" | "Edit template") {
    await expect(this.templateNameInput).toBeVisible();
    await expect(
      this.templatePanel.getByTestId(PANEL_HEADER).first(),
    ).toHaveText(header);
  }

  async fillTemplateName(name: string) {
    await this.templateNameInput.fill(name);
  }

  async setVisibleInPanel(visible: boolean) {
    const toggle = this.page.getByTestId(TEMPLATE_VISIBLE_TOGGLE);
    const input = toggle.getByTestId(TOGGLE_INPUT);
    if ((await input.isChecked()) !== visible) {
      await toggle.getByTestId(TOGGLE_LABEL).click();
    }
    if (visible) await expect(input).toBeChecked();
    else await expect(input).not.toBeChecked();
  }

  async checkFieldInPanel(field: TMetadataField) {
    await expect(this.getFieldRow(field.name)).toBeVisible();
    await expect(this.getFieldRow(field.name)).toContainText(field.type);
  }

  async checkFieldsCountInPanel(count: number) {
    await expect(this.templatePanel.locator(FIELD_ROW)).toHaveCount(count);
  }

  async deleteFieldInPanel(name: string) {
    await this.getFieldRow(name).getByTestId(FIELD_CONTEXT_MENU_BUTTON).click();
    await this.page.getByTestId(FIELD_MENU_DELETE).click();
    await expect(this.getFieldRow(name)).toHaveCount(0);
  }

  async openEditFieldPanel(name: string) {
    await this.getFieldRow(name).getByTestId(FIELD_CONTEXT_MENU_BUTTON).click();
    await this.page.getByTestId(FIELD_MENU_EDIT).click();
    await expect(this.fieldNameInput).toHaveValue(name);
  }

  async checkSaveDisabled() {
    await expect(this.templateSaveButton).toBeDisabled();
  }

  async checkSaveEnabled() {
    await expect(this.templateSaveButton).toBeEnabled();
  }

  async saveTemplate() {
    await this.templateSaveButton.click();
    await expect(this.templateNameInput).toBeHidden();
  }

  // Click Save when the backend is expected to reject it - the panel stays open
  async clickSaveTemplate() {
    await this.templateSaveButton.click();
  }

  async cancelTemplatePanel() {
    await this.templatePanel.getByTestId(PANEL_CANCEL_BUTTON).click();
    await expect(this.templateNameInput).toBeHidden();
  }

  async createTemplate(
    name: string,
    fields: TMetadataField[],
    options: { visible?: boolean } = {},
  ) {
    await this.openCreatePanel();
    await this.fillTemplateName(name);
    if (options.visible === false) await this.setVisibleInPanel(false);
    for (const field of fields) {
      await this.addField(field);
    }
    await this.saveTemplate();
  }

  // ---------- Add/Edit field panel ----------

  private get fieldNameInput() {
    return this.page.getByTestId(FIELD_NAME_INPUT);
  }

  private get fieldSubmitButton() {
    return this.page.getByTestId(FIELD_SUBMIT_BUTTON);
  }

  private get optionInputs() {
    return this.page.getByPlaceholder(FIELD_OPTION_INPUT_PLACEHOLDER);
  }

  async openAddFieldPanel() {
    await this.page.getByTestId(ADD_FIELD_BUTTON).click();
    await expect(this.fieldNameInput).toBeVisible();
  }

  async fillFieldName(name: string) {
    await this.fieldNameInput.fill(name);
  }

  async selectFieldType(type: TMetadataFieldType) {
    await this.page.getByTestId(FIELD_TYPE_COMBOBOX).click();
    await this.page.getByTestId(FIELD_TYPE_ITEM[type]).click();
    await expect(this.page.getByTestId(FIELD_TYPE_COMBOBOX)).toContainText(
      type,
    );
  }

  // Select types start with one empty option input; extra inputs are added
  // via "Add option"
  async fillOptions(options: string[]) {
    for (const [index, value] of options.entries()) {
      if ((await this.optionInputs.count()) <= index) {
        await this.page.getByTestId(ADD_OPTION_BUTTON).click();
      }
      await this.optionInputs.nth(index).fill(value);
    }
  }

  private async getOptionInput(value: string) {
    const count = await this.optionInputs.count();
    for (let i = 0; i < count; i++) {
      if ((await this.optionInputs.nth(i).inputValue()) === value) {
        return this.optionInputs.nth(i);
      }
    }
    throw new Error(`Option "${value}" not found in the field panel`);
  }

  async renameOption(oldValue: string, newValue: string) {
    const input = await this.getOptionInput(oldValue);
    await input.fill(newValue);
  }

  // The trash icon sits next to the option input
  async deleteOption(value: string) {
    const input = await this.getOptionInput(value);
    const countBefore = await this.optionInputs.count();
    await input.locator("xpath=..").getByTestId(OPTION_DELETE_ICON).click();
    await expect(this.optionInputs).toHaveCount(countBefore - 1);
  }

  async checkFieldSubmitDisabled() {
    await expect(this.fieldSubmitButton).toBeDisabled();
  }

  async checkFieldSubmitEnabled() {
    await expect(this.fieldSubmitButton).toBeEnabled();
  }

  async submitField() {
    await this.fieldSubmitButton.click();
    await expect(this.fieldNameInput).toBeHidden();
  }

  async addField(field: TMetadataField) {
    await this.openAddFieldPanel();
    await this.fillFieldName(field.name);
    await this.selectFieldType(field.type);
    if (SELECT_TYPES.includes(field.type)) {
      await this.fillOptions(field.options ?? []);
    }
    await this.submitField();
    await this.checkFieldInPanel(field);
  }
}

export default MetadataTemplates;
