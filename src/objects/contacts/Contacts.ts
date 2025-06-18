import { expect, Page } from "@playwright/test";

import BaseTable from "../common/BaseTable";
import BaseDialog from "../common/BaseDialog";
import BaseFilter from "../common/BaseFilter";
import ContactsArticle from "./ContactsArticle";
import ContactsNavigation from "./ContactsNavigation";
import { contactsActionsMenu } from "@/src/utils/constants/contacts";
import BaseContextMenu from "../common/BaseContextMenu";
import ContactsInfoPanel from "./ContactsInfoPanel";
import ContactsInviteDialog from "./ContactsInviteDialog";

class Contacts {
  private page: Page;
  private portalDomain: string;

  table: BaseTable;

  dialog: BaseDialog;
  filter: BaseFilter;
  article: ContactsArticle;
  navigation: ContactsNavigation;
  infoPanel: ContactsInfoPanel;
  inviteDialog: ContactsInviteDialog;
  private contextMenu: BaseContextMenu;

  constructor(page: Page, portalDomain: string) {
    this.page = page;
    this.portalDomain = portalDomain;

    this.table = new BaseTable(page.locator("#table-container"));
    this.dialog = new BaseDialog(page);
    this.filter = new BaseFilter(page);
    this.infoPanel = new ContactsInfoPanel(page);
    this.article = new ContactsArticle(page);
    this.navigation = new ContactsNavigation(page);
    this.contextMenu = new BaseContextMenu(page);
    this.inviteDialog = new ContactsInviteDialog(page);
  }

  async open() {
    await this.page.goto(`https://${this.portalDomain}/accounts/people`, {
      waitUntil: "load",
    });
    await expect(this.page).toHaveURL(/.*accounts\/people.*/);
  }

  async openTab(tab: "Members" | "Groups" | "Guests") {
    await this.page.locator("span").filter({ hasText: tab }).click();
    await this.page.waitForResponse(
      (response) =>
        response.url().includes("/settings") &&
        response.status() === 200 &&
        response.request().method() === "GET",
    );
  }

  async openSubmenu(source: "header" | "table" | "article") {
    switch (source) {
      case "header":
        await this.navigation.openHeaderSubmenu(
          contactsActionsMenu.invite.label,
        );
        break;
      case "table":
        {
          await this.table.openFooterContextMenu();
          await this.contextMenu.hoverOption(contactsActionsMenu.invite.label);
        }
        break;
      case "article":
        await this.article.openInviteSubmenu();
        break;
    }
  }

  async closeMenu() {
    await this.contextMenu.close();
  }

  async checkEmptyGroupsExist() {
    await expect(this.page.getByText("No groups here")).toBeVisible();
  }

  async checkEmptyGuestsExist() {
    await expect(this.page.getByText("No added guests yet")).toBeVisible();
  }
}

export default Contacts;
