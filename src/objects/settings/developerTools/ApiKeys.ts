import { expect, Locator, Page } from "@playwright/test";
import BaseDevTools from "./BaseDevTools";

class ApiKeys extends BaseDevTools {
  constructor(page: Page) {
    super(page);
  }

  get createButton(): Locator {
    return this.page.getByTestId("create_new_secret_key_button");
  }

  get guideLink(): Locator {
    return this.page.getByTestId("api_guide_link");
  }

  get nameInput(): Locator {
    return this.page.getByTestId("secret_key_name_input");
  }

  get lifetimeToggle(): Locator {
    return this.page.getByTestId("secret_key_lifetime_toggle_button");
  }

  get generateButton(): Locator {
    return this.page.getByTestId("secret_key_generate_button");
  }

  get secretKeyInput(): Locator {
    return this.page.getByTestId("secret_key_input");
  }

  get doneButton(): Locator {
    return this.page.getByTestId("secret_key_done_button");
  }

  get cancelButton(): Locator {
    return this.page.getByTestId("secret_key_cancel_button");
  }

  get contextMenuButton(): Locator {
    return this.page.getByTestId("context-menu-button");
  }

  // Permission tabs
  get allTab(): Locator {
    return this.page.getByTestId("all_subtab");
  }

  get restrictedTab(): Locator {
    return this.page.getByTestId("restricted_subtab");
  }

  get readOnlyTab(): Locator {
    return this.page.getByTestId("readonly_subtab");
  }

  // Permission checkboxes
  permissionCheckbox(scope: string): Locator {
    return this.page.getByTestId(`permission_${scope}_checkbox`);
  }

  async open() {
    await this.openDevTools();
    await this.navigateToSection("api-keys");
  }

  async createApiKey(name: string) {
    await this.createButton.click();
    await this.nameInput.fill(name);
    await this.generateButton.click();
    await expect(this.secretKeyInput).toBeVisible();
    await this.doneButton.click();
  }

  async checkApiKeyVisible(name: string) {
    // UI bug: same as OAuth — list may not update without reload
    await expect(async () => {
      const visible = await this.page.getByText(name).isVisible();
      if (!visible) {
        await this.page.reload({ waitUntil: "load" });
      }
      await expect(this.page.getByText(name)).toBeVisible();
    }).toPass({ timeout: 30000 });
  }

  get editSubmitButton(): Locator {
    return this.page.getByRole("button", { name: "Edit" });
  }

  async editApiKey(newName: string) {
    await this.contextMenuButton.first().click();
    await this.page.getByTestId("api-key_edit").click();
    await this.nameInput.clear();
    await this.nameInput.fill(newName);
    await this.editSubmitButton.click();
  }

  async editApiKeyPermissions(scopes: string[]) {
    await this.contextMenuButton.first().click();
    await this.page.getByTestId("api-key_edit").click();
    await this.restrictedTab.click();
    for (const scope of scopes) {
      await this.permissionCheckbox(scope).click();
    }
    await this.editSubmitButton.click();
  }

  async checkPermissionsLabel(expected: string) {
    await expect(
      this.page.locator(".api-keys_text", { hasText: expected }),
    ).toBeVisible();
  }

  async deleteApiKey() {
    await this.contextMenuButton.first().click();
    await this.page.getByTestId("api-key_delete").click();
    await this.page.getByRole("button", { name: "Delete" }).click();
  }
}

export default ApiKeys;
