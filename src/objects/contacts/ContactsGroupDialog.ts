import { expect, Page } from "@playwright/test";
import BaseDialog from "../common/BaseDialog";
import BaseSelector from "../common/BaseSelector";

class ContactsGroupDialog extends BaseDialog {
  private contactSelector: BaseSelector;

  constructor(page: Page) {
    super(page);
    this.contactSelector = new BaseSelector(page);
  }

  async checkDialogExist() {
    await this.checkDialogTitleExist("Create group");
  }

  async fillGroupName(groupName: string) {
    await this.dialog.getByRole("textbox", { name: "Name" }).fill(groupName);
  }

  async openAddMembersSelector() {
    await this.dialog.getByText("Add members", { exact: true }).click();
  }

  async openHeadOfGroupSelector() {
    await this.dialog.getByText("Select", { exact: true }).click();
    await expect(
      this.page.locator('[data-testid^="selector-item-"]').first(),
    ).toBeVisible();
  }

  async selectContact(contact: string, doubleClick = false) {
    await this.contactSelector.selectItemByTextGlobal(contact, doubleClick);
  }

  async checkAddedContactExist(contact: string) {
    await this.getContactItem(contact);
  }

  private async getContactItem(contact: string) {
    const contactItem = this.dialog
      .locator(`.info:has-text("${contact}")`)
      .locator("..");
    await expect(contactItem).toBeVisible();
    return contactItem;
  }

  async removeContact(email: string) {
    const contactItem = await this.getContactItem(email);
    const removeButton = contactItem.locator(".remove-icon");
    await removeButton.click();
    await expect(contactItem).not.toBeVisible();
  }

  // async getHeadOfGroupContact() {
  //   const headGroupContact = this.dialog.locator(".head-of-group + div");
  //   await expect(headGroupContact).toBeVisible();
  //   await expect(
  //     headGroupContact.getByTestId("selector-add-button"),
  //   ).not.toBeVisible();

  //   return headGroupContact;
  // }

  async submitSelectContacts() {
    const selectButton = this.page.getByRole("button", { name: /^Select/ });

    await expect(selectButton).toBeVisible();
    await selectButton.click();
  }

  async submitCreateGroup() {
    await this.dialog.getByText("Create", { exact: true }).click();
  }

  async submitEditGroup() {
    await this.dialog.getByText("Save", { exact: true }).click();
  }
}

export default ContactsGroupDialog;
