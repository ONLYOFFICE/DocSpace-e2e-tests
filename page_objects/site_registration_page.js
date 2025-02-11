export class RegistrationPage {
  constructor(page) {
    this.page = page;
    this.signUpForm = page.locator("//div[contains(@class, 'signuppageform')]");
    this.firstName = page.locator("#txtSignUpFirstName");
    this.lastName = page.locator("#txtSignUpLastName");
    this.email = page.locator("#txtEmail");
    this.phone = page.locator("#txtPhone");
    this.portalName = page.locator("#txtSignUpPortalName");
    this.password = page.locator("#txtSignUpPassword");
    this.submitButton = page.locator("//input[contains(@class, 'sbmtSignUp')]");
    this.cookieButton = page.locator("//a[@class='cookie_mess_button']");
  }

  async fillOutForm(params) {
    await this.firstName.fill(params.customUserList[0].firstName);
    await this.lastName.fill(params.customUserList[0].lastName);
    await this.email.fill(params.customUserList[0].mail);
    await this.portalName.fill(params.portalName);
    await this.password.fill(params.customUserList[0].password);
  }

  async clickSignupSubmit() {
    await this.submitButton.waitFor();
    await this.submitButton.click();
  }

  async completeRegistrationForm(params) {
    await this.fillOutForm(params);
    await this.clickSignupSubmit();
  }

  async cookieWarningShown() {
    return await this.cookieButton.isVisible();
  }

  async agreeWithCookieIfShown() {
    if (await this.cookieWarningShown()) {
      await this.cookieButton.click();
    }
  }
}
