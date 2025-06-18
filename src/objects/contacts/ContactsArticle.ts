import { Page } from "@playwright/test";
import BaseArticle from "../common/BaseArticle";
import BaseContextMenu from "../common/BaseContextMenu";

class ContactsArticle extends BaseArticle {
  contextMenu: BaseContextMenu;

  constructor(page: Page) {
    const mainButton = page.locator("#accounts_invite-main-button");
    super(page, mainButton);
    this.contextMenu = new BaseContextMenu(page);
  }

  async openArticleMenu() {
    await this.clickArticleMainButton();
    await this.contextMenu.checkContextMenuExists();
  }

  async openInviteSubmenu() {
    await this.openArticleMenu();
    await this.contextMenu.hoverOption("Invite");
  }

  async closeArticleMenu() {
    await this.contextMenu.close();
  }
}

export default ContactsArticle;
