import { expect, Page } from "@playwright/test";

// AI settings > BYOK tab: the portal's own provider keys
class AiSettingsByok {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get addButton() {
    return this.page.getByTestId("byok-add-button");
  }

  private get form() {
    return this.page.getByTestId("byok-key-form");
  }

  private get keyField() {
    return this.page.getByTestId("byok-key-input");
  }

  private card(modelName: string) {
    return this.page
      .getByTestId("byok-key-card")
      .filter({ hasText: modelName });
  }

  private dropDownItem(text: string) {
    return this.page
      .getByTestId(/^drop_down_item_/)
      .filter({ hasText: text })
      .last();
  }

  async open(portalUrl: string) {
    await this.page.goto(`${portalUrl}/portal-settings/ai-settings/byok`);
    await expect(this.addButton).toBeVisible();
  }

  async openAddForm(provider: string) {
    await this.addButton.click();
    await expect(this.form).toBeVisible();
    await this.page.getByTestId("byok-provider-combobox").click();
    await this.dropDownItem(provider).click();
  }

  async openModelList() {
    await this.page.getByTestId("byok-model-combobox").click();
  }

  async checkModelOffered(modelName: string, offered: boolean) {
    const item = this.page
      .getByTestId(/^drop_down_item_/)
      .filter({ hasText: modelName });
    if (offered) await expect(item).toBeVisible();
    else await expect(item).toHaveCount(0);
  }

  async selectModel(modelName: string) {
    await this.openModelList();
    await this.dropDownItem(modelName).click();
  }

  async fillKey(key: string) {
    await this.form.getByTestId("text-input").fill(key);
  }

  async submit() {
    await this.page.getByTestId("byok-submit-button").click();
  }

  async cancel() {
    await this.page.getByTestId("byok-cancel-button").click();
    await expect(this.form).toBeHidden();
  }

  async addKey(provider: string, modelName: string, key: string) {
    await this.openAddForm(provider);
    await this.selectModel(modelName);
    await this.fillKey(key);
    await this.submit();
  }

  // The provider check answers under the key field
  async checkKeyError(text: string) {
    await expect(this.keyField).toHaveAttribute("data-error", "true");
    await expect(this.form).toContainText(text);
  }

  async checkCard(modelName: string, provider: string) {
    await expect(this.card(modelName)).toBeVisible();
    await expect(this.card(modelName)).toContainText(provider);
  }

  async checkNoCards() {
    await expect(this.page.getByTestId("byok-key-card")).toHaveCount(0);
  }

  // Deleting from the card menu needs no confirmation
  async deleteKey(modelName: string) {
    await this.card(modelName).getByTestId("byok-key-menu").click();
    await this.page.getByTestId("delete-key_item").click();
  }
}

export default AiSettingsByok;
