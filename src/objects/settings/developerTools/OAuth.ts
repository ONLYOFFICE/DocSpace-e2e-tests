import { expect, Page } from "@playwright/test";
import BasePage from "@/src/objects/common/BasePage";
import { navItems } from "@/src/utils/constants/settings";
import BaseTable, { TBaseTableLocators } from "../../common/BaseTable";

class OAuth extends BasePage {
  table: BaseTable;
  constructor(page: Page) {
    super(page);
    this.table = new BaseTable(this.page, this.tableLocators);
  }
  
  get tableLocators(): TBaseTableLocators {
    return {
      tableRows: this.page.locator(".table-container_row"),
    };
  }

  get tabOAuth() {
    return this.page.locator('[data-testid="OAuth 2.0"]');
  }

  get oauthGuideLink() {
    return this.page.locator('[data-testid="link"]').getByText("OAuth 2.0 Guide");
  }

  get newApplicationButton() {
    return this.page.locator('[data-testid="register_new_app_button"]');
  }

  get oauthNameInput() {
    return this.page.locator('input[data-testid="app_name_input_group_input"]');
  }

  get oauthWebsiteUrlInput() {
    return this.page.locator('input[data-testid="app_website_url_input_group_input"]');
  }

  get oauthDescriptionInput() {
    return this.page.locator('textarea[data-testid="description_textarea_group"]');
  }

  get oauthRedirectUriInput() {
    return this.page.locator('input[data-testid="redirect_uris_input"]');
  }

  get oauthApproveRedirectUriInput() {
    return this.page.locator('[data-testid="redirect_uris_add_button"]');
  }

  get oauthAllowedOriginsInput() {
    return this.page.locator('input[data-testid="allowed_origins_input"]');
  }

  get oauthApproveAllowedOriginsInput() {
    return this.page.locator('[data-testid="allowed_origins_add_button"]');
  }

  get oauthIconInput() {
    return this.page.locator('input[type="file"]');
  }

  get oauthPKCE() {
    return this.page.locator('[data-testid="allow_pkce_checkbox"]');
  }

  get profileWritrCheckBox() {
    return this.page.locator('[data-testid="profiles_write_checkbox"]');
  }

  get contactsWriteCheckBox() {
    return this.page.locator('[data-testid="accounts_write_checkbox"]');
  }

  get filesAndFoldersWriteCheckBox() {
    return this.page.locator('[data-testid="rooms_write_checkbox"]');
  }

  get roomsWriteCheckBox() {
    return this.page.locator('[data-testid="files_write_checkbox"]');
  }

  get openIdCheckBox() {
    return this.page.locator('[data-testid="openid_read_checkbox"]');
  }

  get oauthPolicyUrlInput() {
    return this.page.locator('input[data-testid="policy_url_input_group_input"]');
  }

  get oauthTermsOfServiceUrlInput() {
    return this.page.locator('input[data-testid="terms_url_input_group_input"]');
  }

  get oauthSaveButton() {
    return this.page.locator('[data-testid="oauth_save_button"]');
  }

  get applicationModifiedDate() {
    return this.page.locator('[data-testid="app_modified_date_cell"]');
  }

  get InfoPanelDate() {
    return this.page.locator('[data-testid="client_info_modified"]');
  }

  get oauthActionMenu() {
    return this.page.locator('[data-testid="context-menu-button"]');
  }

  get oauthEditApplication() {
    return this.page.locator('[data-testid="oauth_edit_option"]');
  }

  get oauthDisableApplication() {
    return this.page.locator('[data-testid="oauth_disable_option"]');
  }

  get oauthEnableApplication() {
    return this.page.locator('[data-testid="enable"]');
  }

  get oauthOKButton() {
    return this.page.locator('[data-testid="disable_app_ok_button"]');
  }

  get oauthOpenInfoPanel() {
    return this.page.locator('[data-testid="oauth_info_option"]');
  }

  get oauthInfoPanelActionMenu() {
    return this.page.locator('[data-testid="client_info_context_menu_button"]');
  }

  get websiteUrlInfoPanel() {
    return this.page.locator('[data-testid="client_info_website_link"]');
  }

  get privacyPolicyUrlInfoPanel() {
    return this.page.locator('[data-testid="client_info_policy_link"]');
  }

  get termsOfServiceUrlInfoPanel() {
    return this.page.locator('[data-testid="client_info_terms_link"]');
  }

  get openScopes() {
    return this.page.locator('[data-testid="tag"]');
  }

  get backdrop() {
    return this.page.locator('[data-testid="backdrop"]');
  }

  get closeInfoPanel() {
    return this.page.getByTestId('aside-header').getByRole('img');
  }

  get generateToken() {
    return this.page.locator('[data-testid="oauth_generate_token_option"]');
  }

  get generateTokenButton() {
    return this.page.locator('[data-testid="generate_token_button"]');
  }

  get hideEmail() {
    return this.page.locator('[data-testid="generate_token_email_link"]');
  }

  get hideTokenInput() {
    return this.page.locator('[data-testid="generate_token_input"]');
  }

  get hideTokenDate() {
    return this.page.locator('[data-testid="generate_token_dates"]');
  }

  get copyTokenButton() {
    return this.page.locator('[data-testid="copy_generate_token_button"]');
  }

  get revokeToken() {
    return this.page.locator('[data-testid="oauth_revoke_token_option"]');
  }

  get tokenInput() {
    return this.page.locator('[data-testid="revoke_token_input"]');
  }

  get revokeTokenButton() {
    return this.page.locator('[data-testid="revoke_token_button"]');
  }

  get deleteApplication() {
    return this.page.locator('[data-testid="oauth_delete_option"]');
  }

  get deleteApplicationOKButton() {
    return this.page.locator('[data-testid="delete_app_ok_button"]');
  }

  get generatedToken() {
    return this.page.locator('[data-testid="generate_token_input"]');
  }

  async open() {
    await this.navigateToSettings();
    await this.article.navigate(navItems.developerTools);
    await this.tabOAuth.click();
  }

  async checkUseOAuth() {
    await expect(this.page.getByTestId('text').getByText("Use OAuth 2.0 to access the ONLYOFFICE DocSpace API")).toBeVisible();
    }

  async checkOauthUrls() {
    await expect(this.page.getByTestId('text').getByText("OAuth URLs")).toBeVisible();
    }
    
  async hideDate() {
    await this.applicationModifiedDate.evaluate((el) => (el.style.display = "none"));
    }

  async createApplication() {
    await this.oauthNameInput.fill("Autotest");
    await this.oauthWebsiteUrlInput.fill("https://google.com");
    await this.oauthDescriptionInput.fill("Autotest");
    await this.oauthRedirectUriInput.fill("https://google.com");
    await this.oauthApproveRedirectUriInput.click();
    await this.oauthAllowedOriginsInput.fill("https://google.com");
    await this.oauthApproveAllowedOriginsInput.click();
    await this.oauthIconInput.setInputFiles('data/avatars/OAuthApp.jpg');
    await this.oauthPKCE.click();
    await this.profileWritrCheckBox.click();
    await this.contactsWriteCheckBox.click();
    await this.filesAndFoldersWriteCheckBox.click();
    await this.roomsWriteCheckBox.click();
    await this.openIdCheckBox.click();
    await this.oauthPolicyUrlInput.fill("https://google.com");
    await this.oauthTermsOfServiceUrlInput.fill("https://google.com");
    await this.oauthSaveButton.click();
  }

  async editOAuthApplication() {
    await this.oauthEditApplication.click();
    await this.oauthNameInput.fill("AutotestRename");
    await this.oauthSaveButton.click();
}

  async checkApplicationName() {
    await expect(this.page.getByTestId('text').getByText("Autotest")).toBeVisible();
  }

  async checkNewApplicationName() {
    await expect(this.page.getByTestId('text').getByText("AutotestRename")).toBeVisible();
  }

  async disableApplication() {
    await this.oauthActionMenu.click();
    await this.oauthDisableApplication.click();
    await this.oauthOKButton.click();
  }

  async enableApplication() {
    await this.oauthActionMenu.click();
    await this.oauthEnableApplication.click();
  }

  async openInfoPanel() {
    await this.oauthActionMenu.click();
    await this.oauthOpenInfoPanel.click();
  }

  async hideDateInfoPanel() {
    await this.InfoPanelDate.evaluate((el) => (el.style.display = "none"));
  }

  async openInfoPanelActionMenu() {
    await this.oauthInfoPanelActionMenu.click();
  }

  async checkWebsiteUrlInfoPanel() {
    await this.websiteUrlInfoPanel.click();
  }

  async checkPrivacyPolicyUrlInfoPanel() {
    await this.privacyPolicyUrlInfoPanel.click();
  }

  async checkTermsOfServiceUrlInfoPanel() {
    await this.termsOfServiceUrlInfoPanel.click();
  }

  async generateOauthToken() {
    await this.oauthActionMenu.click();
    await this.generateToken.click();
    await this.generateTokenButton.click();
  }

  async hideTokenInfo() {
    await this.hideEmail.evaluate((el) => (el.style.display = "none"));
    await this.hideTokenInput.evaluate((el) => (el.style.display = "none"));
    await this.hideTokenDate.evaluate((el) => (el.style.display = "none"));
  }

  async openRevokeOAuthTokenWindow() {
    await this.oauthActionMenu.click();
    await this.revokeToken.click();
  }

  public storedToken = '';

  async saveGeneratedToken() {
    const tokenInput = this.generatedToken;
    await expect(tokenInput).toHaveCount(1);
    const token = (await tokenInput.inputValue()).trim();
    expect(token).not.toBe('');
    this.storedToken = token;
  }

  async revokeOAuthToken() {
    await this.tokenInput.fill(this.storedToken);
    await this.revokeTokenButton.click();
  }

  async deleteOAuthApplication() {
    await this.oauthActionMenu.click();
    await this.deleteApplication.click();
  }

}

export default OAuth;