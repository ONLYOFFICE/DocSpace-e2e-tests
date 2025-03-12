import config from "../../config/config.js";

export class GuestsPage {
  constructor(page) {
    this.page = page;

    // Navigation
    this.contactsLink = "div[id='document_catalog-accounts']";
    this.guestsLink = "text=Guests";

    // Move to users
    this.changeTypeButton = "li[id='option_change-type']";
    this.userMenuItem = "li[id='menu_change-collaborator']";
    this.confirmChangeButton = "button[id='change-user-type-modal_submit']";

    // Delete guest
    this.contextMenuButton = "div[data-testid='context-menu-button']";
    this.disableMenuItem = "li[id='option_disable']";
    this.disableButton = "button[id='change-user-status-modal_submit']";
    this.deleteMenuItem = "li[id='option_delete-user']";
    this.deleteButton = "button[data-testid='button']";
  }

  async navigateToGuests() {
    await this.page.click(this.contactsLink);
    await this.page.click(this.guestsLink);
  }

  async moveGuestToUsers() {
    await this.page.locator(this.contextMenuButton).nth(0).click();
    await this.page.hover(this.changeTypeButton);
    await this.page.click(this.userMenuItem);
    await this.page.click(this.confirmChangeButton);
  }

  async deleteGuest() {
    await this.page.locator(this.contextMenuButton).nth(0).click();
    await this.page.click(this.disableMenuItem);
    await this.page.click(this.disableButton);
    await this.page.waitForTimeout(1000);
    await this.page.locator(this.contextMenuButton).nth(0).click();
    await this.page.click(this.deleteMenuItem);
    await this.page.click(this.deleteButton);
  }
}
