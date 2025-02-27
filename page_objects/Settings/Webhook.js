import MainPage from "../mainPage";

export class Webhook extends MainPage {
  constructor(page) {
    super(page);
    this.page = page;
    this.developerToolsLink = page.getByRole("link", {
      name: "Developer Tools",
    });
    this.webhooksTab = page.getByText("Webhooks");
    this.createWebhookButton = page.getByRole("button", {
      name: "Create webhook",
    });
    this.webhookNameInput = page.locator("#create-webhook-name-input");
    this.webhookPayloadUrlInput = page.locator(
      "#create-webhook-payload-url-input",
    );
    this.generateSecretKey = page
      .locator("form")
      .filter({ hasText: "This webhook will be assigned" })
      .getByTestId("link");
    this.createWebhookButton2 = page.getByRole("button", {
      name: "Create",
      exact: true,
    });
    this.webhookName = page.getByText("Autotest");
    this.checkbox = page.getByTestId("checkbox").locator("rect").first();
    this.webhookActionMenu = page
      .getByTestId("context-menu-button")
      .locator("path")
      .first();
    this.webhookDetails = page.getByRole("menuitem", {
      name: "Webhook details",
    });
    this.webhookRedelivered = page
      .locator("#sectionScroll")
      .getByRole("img")
      .nth(1);
    this.webhookDelete = page.getByRole("menuitem", { name: "Delete webhook" });
    this.deleteConfirmMessage = page.getByText("Delete Webhook forever? The");
    this.deleteForeverButton =
      this.deleteConfirmMessage.getByText("Delete forever");
    this.webhookGuideLink = page.getByRole("link", { name: "Webhooks Guide" });
  }

  async navigateToWebhooks() {
    await this.developerToolsLink.click();
    await this.webhooksTab.click();
  }

  async createWebhook(name, payloadUrl) {
    await this.createWebhookButton.click();
    await this.page.waitForTimeout(2000);
    await this.webhookNameInput.fill(name);
    await this.webhookPayloadUrlInput.fill(payloadUrl);
    await this.generateSecretKey.click();
    await this.createWebhookButton2.click();
  }

  async redeliverWebhook() {
    await this.webhookName.click();
    await this.checkbox.click();
    await this.webhookActionMenu.click();
    await this.webhookDetails.click();
    await this.page.waitForTimeout(1000);
    await this.webhookRedelivered.click();
  }

  async deleteWebhook() {
    await this.webhookActionMenu.click();
    await this.webhookDelete.click();
    await this.page.waitForTimeout(1000);
    await this.deleteForeverButton.click();
  }
}
