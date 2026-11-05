import { expect, Page } from "@playwright/test";

const ADD_METADATA_BUTTON = "info_panel_metadata_add_link";
// "Add metadata" menu items have no testid - matched by role + name
const ADD_FROM_TEMPLATE_ITEM = "From template";
const TEMPLATE_PICKER_SEARCH = "metadata_template_search";
const TEMPLATE_PICKER_ITEM = '[data-testid^="metadata_template_item_"]';
const TEMPLATE_PICKER_CANCEL_BUTTON = "metadata_template_cancel_button";

// Metadata tab of the info panel. Open the tab first via
// infoPanel.openTab("Metadata").
class InfoPanelMetadata {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
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
}

export default InfoPanelMetadata;
