import { Page, Locator } from "@playwright/test";

import config from "../../../config";
import Network from "./Network";

export class Login {
  page: Page;

  portalDomain: string;

  emailInput: Locator;
  passwordInput: Locator;
  loginButton: Locator;
  network: Network;

  constructor(page: Page, portalDomain: string) {
    this.page = page;
    this.portalDomain = portalDomain;
    this.emailInput = page.locator("#login_username");
    this.passwordInput = page.locator("#login_password");
    this.loginButton = page.locator("#login_submit");
    this.network = Network.getInstance(page);
  }

  async loginToPortal() {
    await this.page.goto(`https://${this.portalDomain}`, {
      waitUntil: "load",
    });
    await this.network.waitForNetworkIdle();
    await this.emailInput.waitFor({ state: "visible" });
    await this.passwordInput.waitFor({ state: "visible" });

    await this.emailInput.fill(config.DOCSPACE_ADMIN_EMAIL);
    await this.passwordInput.fill(config.DOCSPACE_ADMIN_PASSWORD);

    await this.loginButton.click();
    await this.page.waitForURL(/.*rooms\/shared\/filter.*/);
    await this.network.waitForNetworkIdle();
  }
}

export default Login;
