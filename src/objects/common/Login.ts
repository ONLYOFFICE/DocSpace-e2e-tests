import { Page, Locator, expect } from "@playwright/test";
import BasePage from "./BasePage";
import config, { getPortalUrl } from "../../../config";

export class Login extends BasePage {
  portalDomain: string;

  emailInput: Locator;
  passwordInput: Locator;
  loginButton: Locator;
  socialButton: Locator;
  socialPanelCloseButton: Locator;
  forgotPasswordLink: Locator;
  forgotPasswordEmailInput: Locator;
  forgotPasswordSendButton: Locator;

  constructor(page: Page, portalDomain: string) {
    super(page);
    this.portalDomain = portalDomain;
    this.emailInput = page.locator("#login_username");
    this.passwordInput = page.locator("#login_password");
    this.loginButton = page.locator("#login_submit");
    this.socialButton = page.getByTestId("social-button");
    this.socialPanelCloseButton = page
      .getByTestId("icon-button-svg")
      .locator("path");
    this.forgotPasswordLink = page.getByText("Forgot your password?");
    this.forgotPasswordEmailInput = page.locator(
      "#forgot-password-modal_email",
    );
    this.forgotPasswordSendButton = page.getByRole("button", { name: /Send/i });
  }

  async openSocialPanel(index = 3) {
    await this.socialButton.nth(index).click();
  }

  async closeSocialPanel() {
    await this.socialPanelCloseButton.click();
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
    await this.forgotPasswordSendButton.click();
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
