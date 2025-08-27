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
    return this.page.getByTestId('oauth_tab');
  }

  get oauthGuideLink() {
    return this.page.getByTestId('oauth_guide_link');
  }

  get newApplicationButton() {
    return this.page.getByTestId('register_new_app_button');
  }

  get oauthNameInput() {
    return this.page.getByTestId('app_name_input_group_input');
  }

  get oauthWebsiteUrlInput() {
    return this.page.getByTestId('app_website_url_input_group_input');
  }

  get oauthDescriptionInput() {
    return this.page.getByTestId('description_textarea_group');
  }

  get oauthRedirectUriInput() {
    return this.page.getByTestId('redirect_uris_input');
  }

  get oauthApproveRedirectUriInput() {
    return this.page.getByTestId('redirect_uris_add_button');
  }

  get oauthAllowedOriginsInput() {
    return this.page.getByTestId('allowed_origins_input');
  }

  get oauthApproveAllowedOriginsInput() {
    return this.page.getByTestId('allowed_origins_add_button');
  }

  get oauthIconInput() {
    return this.page.locator('input[type="file"]');
  }

  get oauthPKCE() {
    return this.page.getByTestId('allow_pkce_checkbox');
  }

  get profileWritrCheckBox() {
    return this.page.getByTestId('profiles_write_checkbox');
  }

  get contactsWriteCheckBox() {
    return this.page.getByTestId('accounts_write_checkbox');
  }

  get filesAndFoldersWriteCheckBox() {
    return this.page.getByTestId('rooms_write_checkbox');
  }

  get roomsWriteCheckBox() {
    return this.page.getByTestId('files_write_checkbox');
  }

  get openIdCheckBox() {
    return this.page.getByTestId('openid_read_checkbox');
  }

  get oauthPolicyUrlInput() {
    return this.page.getByTestId('policy_url_input_group_input');
  }

  get oauthTermsOfServiceUrlInput() {
    return this.page.getByTestId('terms_url_input_group_input');
  }

  get oauthSaveButton() {
    return this.page.getByTestId('oauth_save_button');
  }

  get applicationModifiedDate() {
    return this.page.getByTestId('app_modified_date_cell');
  }

  get InfoPanelDate() {
    return this.page.getByTestId('client_info_modified');
  }

  get oauthActionMenu() {
    return this.page.getByTestId('context-menu-button');
  }

  get oauthEditApplication() {
    return this.page.getByTestId('oauth_edit_option');
  }

  get oauthDisableApplication() {
    return this.page.getByTestId('oauth_disable_option');
  }

  get oauthEnableApplication() {
    return this.page.getByTestId('enable');
  }

  get oauthOKButton() {
    return this.page.getByTestId('disable_app_ok_button');
  }

  get oauthOpenInfoPanel() {
    return this.page.getByTestId('oauth_info_option');
  }

  get oauthInfoPanelActionMenu() {
    return this.page.getByTestId('client_info_context_menu_button');
  }

  get websiteUrlInfoPanel() {
    return this.page.getByTestId('client_info_website_link');
  }

  get privacyPolicyUrlInfoPanel() {
    return this.page.getByTestId('client_info_policy_link');
  }

  get termsOfServiceUrlInfoPanel() {
    return this.page.getByTestId('client_info_terms_link');
  }

  get openScopes() {
    return this.page.getByTestId('tag_container');
  }

  get backdrop() {
    return this.page.getByTestId('backdrop');
  }

  get closeInfoPanel() {
    return this.page.getByTestId('aside_header_close_icon_button').getByRole('img');
  }

  get generateToken() {
    return this.page.getByTestId('oauth_generate_token_option');
  }

  get generateTokenButton() {
    return this.page.getByTestId('generate_token_button');
  }

  get hideEmail() {
    return this.page.getByTestId('generate_token_email_link');
  }

  get hideTokenInput() {
    return this.page.getByTestId('generate_token_input');
  }

  get hideTokenDate() {
    return this.page.getByTestId('generate_token_dates');
  }

  get copyTokenButton() {
    return this.page.getByTestId('copy_generate_token_button');
  }

  get revokeToken() {
    return this.page.getByTestId('oauth_revoke_token_option');
  }

  get tokenInput() {
    return this.page.getByTestId('revoke_token_input');
  }

  get revokeTokenButton() {
    return this.page.getByTestId('revoke_token_button');
  }

  get deleteApplication() {
    return this.page.getByTestId('oauth_delete_option');
  }

  get deleteApplicationOKButton() {
    return this.page.getByTestId('delete_app_ok_button');
  }

  get generatedToken() {
    return this.page.getByTestId('generate_token_input');
  }

    async open() {
    await this.navigateToSettings();
    await this.article.navigate(navItems.developerTools);
    await this.tabOAuth.click();
  }

  async checkUseOAuth() {
    await expect(this.page.getByTestId('register_new_app_button')).toBeVisible();
    }

  async checkOauthUrls() {
    await expect(this.page.locator('#sectionScroll')).toContainText('OAuth URLs');
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