import { expect, Locator, Page } from "@playwright/test";
import BaseDevTools from "./BaseDevTools";

class Webhooks extends BaseDevTools {
  constructor(page: Page) {
    super(page);
  }

  get createButton(): Locator {
    return this.page.getByTestId("create_webhook_button");
  }

  private get createDialog(): Locator {
    return this.page.getByRole("dialog").filter({ hasText: "Create webhook" });
  }

  private get settingsDialog(): Locator {
    return this.page
      .getByRole("dialog")
      .filter({ hasText: "Webhook settings" });
  }

  get createNameInput(): Locator {
    return this.createDialog.getByTestId("webhook_name_input");
  }

  get createPayloadUrlInput(): Locator {
    return this.createDialog.getByTestId("payload_url_input");
  }

  get editNameInput(): Locator {
    return this.settingsDialog.getByTestId("webhook_name_input");
  }

  get createSubmitButton(): Locator {
    return this.createDialog.getByTestId("webhook_submit_button");
  }

  get saveButton(): Locator {
    return this.settingsDialog.getByTestId("webhook_submit_button");
  }

  get cancelButton(): Locator {
    return this.page.getByTestId("webhook_cancel_button");
  }

  async closeCreateDialog() {
    await this.createDialog.getByTestId("webhook_cancel_button").click();
  }

  get contextMenuButton(): Locator {
    return this.page.getByTestId("webhook_table_contextmenu");
  }

  get settingsOption(): Locator {
    return this.page.getByTestId("webhook_settings_item");
  }

  get deleteOption(): Locator {
    return this.page.getByTestId("webhook_delete_item");
  }

  get deleteConfirmButton(): Locator {
    return this.page.getByTestId("delete_webhook_button");
  }

  get deleteCancelButton(): Locator {
    return this.page.getByTestId("delete_webhook_cancel_button");
  }

  get guideLink(): Locator {
    return this.page.getByTestId("webhooks_guide_link");
  }

  get generateSecretKeyLink(): Locator {
    return this.createDialog.getByTestId("generate_link");
  }

  get secretKeyInput(): Locator {
    return this.createDialog.getByTestId("text-input");
  }

  get enableSslRadio(): Locator {
    return this.page.getByTestId("enable_ssl_radio_button");
  }

  get disableSslRadio(): Locator {
    return this.page.getByTestId("disable_ssl_radio_button");
  }

  get sendEverythingRadio(): Locator {
    return this.page.getByTestId("enable_all_radio_button");
  }

  get individualEventsRadio(): Locator {
    return this.page.getByTestId("select_from_list_radio_button");
  }

  get targetIdInput(): Locator {
    return this.page.getByTestId("target-id-input");
  }

  async open() {
    await this.openDevTools();
    await this.navigateToSection("webhooks");
  }

  async createWebhook(name: string, url: string) {
    await this.createButton.click();
    await this.createNameInput.fill(name);
    await this.createPayloadUrlInput.fill(url);
    await this.generateSecretKeyLink.click();

    const [response] = await Promise.all([
      this.page
        .waitForResponse(
          (resp) =>
            resp.url().includes("/api/2.0/settings/webhooks") &&
            resp.request().method() === "POST",
          { timeout: 10000 },
        )
        .catch(() => {
          console.log("[Webhooks] no POST response received");
          return null;
        }),
      this.createSubmitButton.click(),
    ]);

    if (response) {
      console.log(
        `[Webhooks] create response: ${response.status()} ${response.url()}`,
      );
    }
  }

  async checkWebhookVisible(name: string) {
    await expect(this.page.getByText(name)).toBeVisible();
  }

  private async openContextMenu(webhookName: string) {
    await this.page.getByText(webhookName).click({ button: "right" });
  }

  async editWebhook(currentName: string, newName: string) {
    await this.openContextMenu(currentName);
    await this.settingsOption.click();
    await this.editNameInput.clear();
    await this.editNameInput.fill(newName);
    await this.saveButton.click();
  }

  async deleteWebhook(name: string) {
    await this.openContextMenu(name);
    await this.deleteOption.click();
    await this.deleteConfirmButton.click();
  }

  async toggleWebhook(name: string) {
    await this.page.getByTestId(`toggle_button_${name}`).click();
  }
}

export default Webhooks;
