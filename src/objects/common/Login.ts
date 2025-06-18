import { Page, Locator } from "@playwright/test";

import config from "../../../config";

export class Login {
  page: Page;

  portalDomain: string;

  emailInput: Locator;
  passwordInput: Locator;
  loginButton: Locator;

  constructor(page: Page, portalDomain: string) {
    this.page = page;
    this.portalDomain = portalDomain;
    this.emailInput = page.locator("#login_username");
    this.passwordInput = page.locator("#login_password");
    this.loginButton = page.locator("#login_submit");
  }

  async loginToPortal() {
    await this.page.goto(`https://${this.portalDomain}`, {
      waitUntil: "networkidle",
    });
    await this.emailInput.waitFor({ state: "visible" });
    await this.passwordInput.waitFor({ state: "visible" });

    await this.emailInput.fill(config.DOCSPACE_ADMIN_EMAIL);
    await this.passwordInput.fill(config.DOCSPACE_ADMIN_PASSWORD);

    await this.loginButton.click();

    await this.page.waitForURL(/.*rooms\/shared\/filter.*/, {
      waitUntil: "networkidle",
    });
  }
}

export default Login;
