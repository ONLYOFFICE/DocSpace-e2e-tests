import config from '../config/config';

export class PortalLoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = 'input[id="login_username"]';
    this.passwordInput = 'input[id="login_password"]';
    this.loginButton = 'button[id="login_submit"]';
  }

  async loginToPortal(portalDomain) {
    await this.page.goto(`https://${portalDomain}`);
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector(this.emailInput, { state: 'visible' });
    await this.page.waitForSelector(this.passwordInput, { state: 'visible' });
    await this.page.fill(this.emailInput, config.DOCSPACE_ADMIN_EMAIL);
    await this.page.fill(this.passwordInput, config.DOCSPACE_ADMIN_PASSWORD);
    await this.page.click(this.loginButton);
    await this.page.waitForSelector('button#rooms-shared_create-room-button', {
      timeout: 10000,
    });
  }
}
