export class RegistrationPage {
  constructor(page) {
    this.page = page;
    this.signUpForm = page.locator("//div[contains(@class, 'signuppageform')]");
    this.firstName = page.locator("#txtSignUpFirstName");
    this.lastName = page.locator("#txtSignUpLastName");
    this.email = page.locator("#txtEmail");
    this.portalName = page.locator("#txtSignUpPortalName");
    this.password = page.locator("#txtSignUpPassword");
    this.submitButton = page.locator("//input[contains(@class, 'sbmtSignUp')]");
    this.cookieButton = page.locator("//a[@class='cookie_mess_button']");
  }

  async waitToLoad() {
    await this.signUpForm.waitFor();
  }

  async completeRegistrationForm({
    firstName,
    lastName,
    email,
    portalName,
    password,
  }) {
    await this.firstName.fill(firstName);
    await this.lastName.fill(lastName);
    await this.email.fill(email);
    await this.portalName.fill(portalName);
    await this.password.fill(password);
    await this.submitButton.click();
  }

  async agreeWithCookieIfShown() {
    if (await this.cookieButton.isVisible()) {
      await this.cookieButton.click();
    }
  }
}
