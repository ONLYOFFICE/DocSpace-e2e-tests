import { Page, Locator, expect } from "@playwright/test";
import BasePage from "./BasePage";
import config, { getPortalUrl } from "../../../config";

const EMAIL_FIELD_CONTAINER = "email_field";
const PASSWORD_FIELD_CONTAINER = '[data-testid="password_field_container"]';
const REQUIRED_FIELD_ERROR = "Required field";
const INCORRECT_EMAIL_ERROR = "Incorrect email";
const AUTH_FAILED_ERROR = "User authentication failed";
const SOCIAL_PANEL_CLOSE_BUTTON = "aside_header_close_icon_button";
const GOOGLE_SOCIAL_BUTTON = '[data-test-id="google-social-button"]';
const LINKEDIN_SOCIAL_BUTTON = '[data-test-id="linkedin-button-wrapper"]';
const ZOOM_SOCIAL_BUTTON = '[data-test-id="zoom-button-wrapper"]';
const TWITTER_SOCIAL_BUTTON = "more-login-provider-item-twitter";
const APPLE_SOCIAL_BUTTON = "more-login-provider-item-apple";
const WEIXIN_SOCIAL_BUTTON = "more-login-provider-item-weixin";
const REMEMBER_ME_CHECKBOX = "#login_remember";
const FORGOT_PASSWORD_SEND_BUTTON = "forgot_password_send_button";
const FORGOT_PASSWORD_EMAIL_FIELD = "email_input_field";
const FORGOT_PASSWORD_EMAIL_INPUT = "email-input";
const FORGOT_PASSWORD_MODAL_TITLE = "Password recovery";
const CAPTCHA_REQUIRED_ERROR = "Confirm that you are not a robot";
const SOCIAL_PROVIDERS = ["Google", "Zoom", "LinkedIn", "X", "Apple", "WeChat"];
const HCAPTCHA_IFRAME =
  'iframe[title="Widget containing checkbox for hCaptcha security challenge"]';
const HCAPTCHA_CHECKBOX = "#anchor-tc";
const PASSWORD_EYE_ICON = '[class*="password_eye"]';
const LOGO_LIGHT_ALT = "greeting-logo";

export class Login extends BasePage {
  portalDomain: string;

  emailInput: Locator;
  passwordInput: Locator;
  loginButton: Locator;
  emailFieldError: Locator;
  emailFormatError: Locator;
  passwordFieldError: Locator;
  authFailedError: Locator;
  rememberMeCheckbox: Locator;
  googleSocialButton: Locator;
  linkedInSocialButton: Locator;
  zoomSocialButton: Locator;
  twitterSocialButton: Locator;
  appleSocialButton: Locator;
  weixinSocialButton: Locator;
  captchaCheckbox: Locator;
  passwordEyeIcon: Locator;
  logoLight: Locator;
  socialButton: Locator;
  socialPanelCloseButton: Locator;
  forgotPasswordLink: Locator;
  forgotPasswordModalTitle: Locator;
  forgotPasswordEmailInput: Locator;
  forgotPasswordEmailError: Locator;
  forgotPasswordSendButton: Locator;
  captchaRequiredError: Locator;
  languageCombobox: Locator;

  constructor(page: Page, portalDomain: string) {
    super(page);
    this.portalDomain = portalDomain;
    this.emailInput = page.locator("#login_username");
    this.passwordInput = page.locator("#login_password");
    this.loginButton = page.locator("#login_submit");
    this.emailFieldError = page
      .getByTestId(EMAIL_FIELD_CONTAINER)
      .getByText(REQUIRED_FIELD_ERROR);
    this.emailFormatError = page
      .getByTestId(EMAIL_FIELD_CONTAINER)
      .getByText(INCORRECT_EMAIL_ERROR);
    this.passwordFieldError = page
      .locator(PASSWORD_FIELD_CONTAINER)
      .getByText(REQUIRED_FIELD_ERROR);
    this.authFailedError = page.getByText(AUTH_FAILED_ERROR);
    this.rememberMeCheckbox = page.locator(REMEMBER_ME_CHECKBOX);
    this.googleSocialButton = page.locator(GOOGLE_SOCIAL_BUTTON);
    this.linkedInSocialButton = page.locator(LINKEDIN_SOCIAL_BUTTON);
    this.zoomSocialButton = page.locator(ZOOM_SOCIAL_BUTTON);
    this.twitterSocialButton = page.getByTestId(TWITTER_SOCIAL_BUTTON);
    this.appleSocialButton = page.getByTestId(APPLE_SOCIAL_BUTTON);
    this.weixinSocialButton = page.getByTestId(WEIXIN_SOCIAL_BUTTON);
    this.captchaCheckbox = page
      .frameLocator(HCAPTCHA_IFRAME)
      .locator(HCAPTCHA_CHECKBOX);
    this.passwordEyeIcon = page
      .locator(PASSWORD_FIELD_CONTAINER)
      .locator(PASSWORD_EYE_ICON);
    this.logoLight = page.getByRole("img", { name: LOGO_LIGHT_ALT });
    this.socialButton = page.getByTestId("social-button");
    this.socialPanelCloseButton = page.getByTestId(SOCIAL_PANEL_CLOSE_BUTTON);
    this.forgotPasswordLink = page.getByText("Forgot your password?");
    this.forgotPasswordModalTitle = page.getByText(FORGOT_PASSWORD_MODAL_TITLE, {
      exact: true,
    });
    this.forgotPasswordEmailInput = page
      .getByTestId(FORGOT_PASSWORD_EMAIL_FIELD)
      .getByTestId(FORGOT_PASSWORD_EMAIL_INPUT);
    this.forgotPasswordEmailError = page
      .getByTestId(FORGOT_PASSWORD_EMAIL_FIELD)
      .getByText(REQUIRED_FIELD_ERROR);
    this.forgotPasswordSendButton = page.getByTestId(FORGOT_PASSWORD_SEND_BUTTON);
    this.captchaRequiredError = page.getByText(CAPTCHA_REQUIRED_ERROR);
    this.languageCombobox = page
      .getByTestId("scroll-body")
      .getByTestId("language-combobox");
  }

  async openLoginPage() {
    await this.page.goto(`${getPortalUrl(this.portalDomain)}/login`, {
      waitUntil: "load",
    });
    await expect(this.emailInput).toBeVisible();
  }

  async checkLanguageComboboxVisible() {
    await expect(this.languageCombobox).toBeVisible();
  }

  async checkLanguageComboboxText(text: string) {
    await expect(this.languageCombobox).toContainText(text);
  }

  async clickLanguageCombobox() {
    await expect(this.languageCombobox).toBeVisible();
    await this.languageCombobox.click();
  }

  async checkLanguageDropdownVisible() {
    const listbox = this.page.getByRole("listbox");
    await expect(listbox).toBeVisible();
    await expect(listbox).toHaveCSS("height", "300px");
    await expect(listbox).toHaveCSS("--manual-width", "280px");
  }

  async selectLanguage(code: string) {
    await this.page
      .getByRole("listbox")
      .getByTestId(`drop_down_item_${code}`)
      .click();
  }

  async openSocialPanel(index = 3) {
    await this.socialButton.nth(index).click();
  }

  async closeSocialPanel() {
    await this.socialPanelCloseButton.click();
  }

  async checkSocialPanelProviders() {
    for (const provider of SOCIAL_PROVIDERS) {
      await expect(this.page.getByText(provider)).toBeVisible();
    }
  }

  async loginToPortal() {
    await this.page.goto(`${getPortalUrl(this.portalDomain)}`, {
      waitUntil: "load",
    });

    await expect(async () => {
      await this.emailInput.fill(config.DOCSPACE_OWNER_EMAIL);
      await this.passwordInput.fill(config.DOCSPACE_OWNER_PASSWORD);

      await Promise.all([
        this.page.waitForRequest(
          (request) => {
            return (
              request.url().includes("api/2.0/authentication") &&
              request.method() === "POST"
            );
          },
          { timeout: 4000 },
        ),
        this.loginButton.click(),
      ]);
    }).toPass();

    await this.page.waitForURL(/.*rooms\/shared\/filter.*/, {
      waitUntil: "load",
    });
    await this.page.waitForTimeout(3000);
  }

  async loginWithCredentials(email: string, password: string) {
    await this.page.goto(`${getPortalUrl(this.portalDomain)}`, {
      waitUntil: "load",
    });

    await expect(async () => {
      await this.emailInput.fill(email);
      await this.passwordInput.fill(password);

      await Promise.all([
        this.page.waitForRequest(
          (request) => {
            return (
              request.url().includes("api/2.0/authentication") &&
              request.method() === "POST"
            );
          },
          { timeout: 4000 },
        ),
        this.loginButton.click(),
      ]);
    }).toPass();

    await this.page.waitForURL(/.*rooms\/shared\/filter.*/, {
      waitUntil: "load",
    });
    await this.page.waitForTimeout(3000);
  }

  async resetPassword(email: string) {
    await this.forgotPasswordLink.click();
    await this.forgotPasswordEmailInput.waitFor({ state: "visible" });
    await this.forgotPasswordEmailInput.fill(email);
    if (await this.isCaptchaVisible()) {
      await this.captchaCheckbox.click();
    }
    await this.forgotPasswordSendButton.click();
  }
  async isCaptchaVisible(timeout = 3000): Promise<boolean> {
    try {
      await this.captchaCheckbox.waitFor({ state: "visible", timeout });
      return true;
    } catch {
      return false;
    }
  }

  async loginButtonVisible() {
    await expect(this.loginButton).toBeVisible();
  }

  async logout() {
    const optionsButton = this.page.getByTestId("profile_user_icon_button");
    await optionsButton.waitFor({ state: "visible", timeout: 10000 });
    await optionsButton.click();
    await this.page.getByTestId("user-menu-logout").click();
    await this.emailInput.waitFor({ state: "visible", timeout: 15000 });
  }
}

export default Login;
