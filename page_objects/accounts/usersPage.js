export class UsersPage {
  constructor(page) {
    this.page = page;

    // Navigation
    this.contactsLink = "div[id='document_catalog-accounts']";

    // Create user by email
    this.actionsButton = "div[id='accounts_invite-main-button']";
    this.inviteUserMenu = "li[id='actions_invite_user']";
    this.userMenuItem = "li[id='accounts-add_collaborator']";
    this.emailInput = "input[data-testid='text-input'][type='search']";
    this.emailInputAddToList = "div.email-list_avatar";
    this.sendInvitationButton = "button[data-testid='button']";

    // Create user by link
    this.toggleLinkButton =
      "[data-testid='toggle-button'] input[type='checkbox']";
    this.inviteEmailInput = "input#login[data-testid='email-input']";
    this.inviteContinueButton = "button[data-testid='button']";
    this.inviteFirstNameInput = "input#first-name[data-testid='text-input']";
    this.inviteLastNameInput = "input#last-name[data-testid='text-input']";
    this.invitePasswordInput = "input#password[data-testid='text-input']";
    this.inviteSignInButton =
      "#invite-form > div > div.auth-form-fields > div:nth-child(2) > button > div";

    // Delete user
    this.contextMenuButton = "div[data-testid='context-menu-button']";
    this.disableMenuItem = "li[id='option_disable']";
    this.disableButton = "button[id='change-user-status-modal_submit']";
    this.deleteMenuItem = "li[id='option_delete-user']";
    this.deleteButton = "button[data-testid='button']";
    this.dataReassignmentCloseButton = "button[data-testid='button']";
  }

  async navigateToUsers() {
    await this.page.click(this.contactsLink);
  }

  async inviteUserByEmail(userEmail) {
    await this.page.click(this.actionsButton);
    await this.page.hover(this.inviteUserMenu);
    await this.page.click(this.userMenuItem);
    await this.page.fill(this.emailInput, userEmail);
    await this.page.click(this.emailInputAddToList);
    await this.page.click(this.sendInvitationButton);
  }

  async inviteUserViaLink() {
    await this.page.click(this.actionsButton);
    await this.page.hover(this.inviteUserMenu);
    await this.page.click(this.userMenuItem);
    await this.page.click(this.toggleLinkButton, { force: true });
  }

  async fillInviteLinkInput(
    userEmail,
    userFirstName,
    userLastName,
    userPassword,
  ) {
    await this.page.fill(this.inviteEmailInput, userEmail);
    await this.page.click(this.inviteContinueButton);
    await this.page.fill(this.inviteFirstNameInput, userFirstName);
    await this.page.fill(this.inviteLastNameInput, userLastName);
    await this.page.fill(this.invitePasswordInput, userPassword);
    await this.page.$eval("button[data-testid='button']", (element) =>
      element.scrollIntoView(),
    );
    await this.page.waitForSelector(this.inviteSignInButton, {
      state: "visible",
    });
    await this.page.click(this.inviteSignInButton);
  }

  async fillInviteEmailInput(userFirstName, userLastName, userPassword) {
    await this.page.fill(this.inviteFirstNameInput, userFirstName);
    await this.page.fill(this.inviteLastNameInput, userLastName);
    await this.page.fill(this.invitePasswordInput, userPassword);
    await this.page.$eval("button[data-testid='button']", (element) =>
      element.scrollIntoView(),
    );
    await this.page.waitForSelector(this.inviteSignInButton, {
      state: "visible",
    });
    await this.page.click(this.inviteSignInButton);
  }

  async deleteUser() {
    await this.page.locator(this.contextMenuButton).nth(1).click();
    await this.page.click(this.disableMenuItem);
    await this.page.click(this.disableButton);
    await this.page.waitForTimeout(1000);
    await this.page.locator(this.contextMenuButton).nth(1).click();
    await this.page.click(this.deleteMenuItem);
    await this.page.click(this.deleteButton);
    await this.page.waitForTimeout(4000);
    await this.page.click(this.dataReassignmentCloseButton);
  }
}
