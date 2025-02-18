export class GroupsPage {
  constructor(page) {
    this.page = page;

    // Navigation
    this.contactsLink = "div[id='document_catalog-accounts']";
    this.groupsLink = 'text=Groups';

    // Group Creation
    this.actionsButton = "div[id='accounts_invite-main-button']";
    this.createGroupMenu = "li[id='create_group']";
    this.createGroupEmptyScreenButton = "div[id='create-group-option']";
    this.textInputGroupName = "input[id='create-group-name']";
    this.addManagerMembersButton = "[data-testid='selector-add-button']";
    this.selectButton = "button[data-testid='button']";
    this.chooseManager = "[data-testid='text']:has-text('admin-zero admin-zero')";
    this.chooseMembers = "[data-testid='text']:has-text('user-one user-one')";
    this.createButton =
      "div[id='create-group-modal_submit'], button[id='create-group-modal_submit'], #create-group-modal_submit";

    // Group Edit
    this.contextMenuButtonSelector = "div[data-testid='context-menu-button']";
    this.editGroupMenuSelector = "li[id='edit-group']";
    this.saveButton =
      "div[id='edit-group-modal_submit'], button[id='edit-group-modal_submit'], #edit-group-modal_submit";

    // Group Delete
    this.deleteMenuItemSelector = "li[id='delete-group']";
    this.deleteButton =
      "div[id='group-modal_delete'], button[id='group-modal_delete'], #group-modal_delete";
    this.deleteSuccessMessageSelector = 'Group was deleted successfully';
  }

  async navigateToGroups() {
    await this.page.click(this.contactsLink);
    await this.page.click(this.groupsLink);
  }

  async createGroup(groupName) {
    await this.page.click(this.actionsButton);
    await this.page.click(this.createGroupMenu);
    await this.page.fill(this.textInputGroupName, groupName);

    // Select manager
    await this.page.locator(this.addManagerMembersButton).first().click();
    await this.page.click(this.chooseManager);
    await this.page.locator(this.selectButton).nth(2).click();

    // Select members
    await this.page.locator(this.addManagerMembersButton).first().click();
    await this.page.click(this.chooseMembers);
    await this.page.locator(this.selectButton).nth(2).click();

    // Create group
    await this.page.click(this.createButton);
  }

  async createGroupEmptyScreen(groupName) {
    await this.page.click(this.createGroupEmptyScreenButton);
    await this.page.fill(this.textInputGroupName, groupName);

    // Select manager
    await this.page.locator(this.addManagerMembersButton).first().click();
    await this.page.click(this.chooseManager);
    await this.page.locator(this.selectButton).nth(2).click();

    // Select members
    await this.page.locator(this.addManagerMembersButton).first().click();
    await this.page.click(this.chooseMembers);
    await this.page.locator(this.selectButton).nth(2).click();

    // Create group
    await this.page.click(this.createButton);
  }

  async editGroup(updatedGroupName) {
    await this.page.click(this.contextMenuButtonSelector);
    await this.page.click(this.editGroupMenuSelector);
    await this.page.waitForSelector(this.textInputGroupName, { state: 'visible' });
    await this.page.fill(this.textInputGroupName, updatedGroupName);
    await this.page.click(this.saveButton);
  }

  async deleteGroup() {
    await this.page.click(this.contextMenuButtonSelector);
    await this.page.click(this.deleteMenuItemSelector);
    await this.page.click(this.deleteButton);
    await this.page.waitForTimeout(1000); // Wait for deletion to happen
  }
}
