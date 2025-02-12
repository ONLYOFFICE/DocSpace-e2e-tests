import MainPage from "../MainPage";

export class OAuth extends MainPage {
    constructor(page) {
        super(page);
        this.page = page;
        this.navigateToDevTools = page.getByRole('link', { name: 'Developer Tools' });
        this.navigateOAuth = page.getByText('OAuth');
        this.createOAuthButton = page.getByTestId('button');
        this.oauthNameInput = page.getByPlaceholder('Enter name');
        this.oauthWebsiteUrlInput = page.locator('input[name="website_url"]');
        this.oauthDescriptionInput = page.getByPlaceholder('Enter description');
        this.oauthRedirectUriInput = page.locator('input[name="redirect_uris"]');
        this.oauthApproveRedirectUriInput = page.getByText('https://google.comAdd');
        this.oauthAllowedOriginsInput = page.locator('input[name="allowed_origins"]');
        this.oauthApproveAllowedOriginsInput = page.getByText('https://google.comAdd');
        this.oauthIconInput = page.locator('input[type="file"]');
        this.oauthPKCE = page.locator('label').filter({ hasText: 'Allow public client (PKCE)' }).locator('rect');
        this.oauthAccessScopesArea = page.getByText('Access scopes * ReadWriteProfileaccounts.self:read — View basic information');
        this.profileWritrCheckBox = page.locator('.checkbox > rect').nth(2);
        this.contactsWriteCheckBox = page.locator('.checkbox > rect').nth(4);
        this.filesAndFoldersWriteCheckBox = page.locator('.checkbox > rect').nth(6);
        this.roomsWriteCheckBox = page.locator('.checkbox > rect').nth(8);
        this.openIdCheckBox = page.locator('.checkbox > rect').nth(9);
        this.oauthPolicyUrlInput = page.locator('input[name="policy_url"]');
        this.oauthTermsOfServiceUrlInput = page.locator('input[name="terms_url"]');
        this.oauthSaveButton = page.getByRole('button', { name: 'Save' });
        this.oauthActionMenu = page.getByTestId('context-menu-button').getByRole('img');
        this.oauthEditApplication = page.getByRole('menuitem', { name: 'Edit' });
        this.oauthNewNameInput = page.getByPlaceholder('Enter name');
        this.oauthNewDescriptionInput = page.getByPlaceholder('Enter description');
        this.oauthGenerateToken = page.getByRole('menuitem', { name: 'Generate token' });
        this.oauthGenerateTokenButton = page.getByRole('button', { name: 'Generate' });
        this.oauthRemoveToast = page.getByText('Developer token successfully copied to clipboard');
        this.oauthRevokeToken = page.getByRole('button', { name: 'Revoke' });
        this.oauthDisableApplication = page.getByRole('menuitem', { name: 'Disable' });
        this.oauthOKButton = page.getByRole('button', { name: 'Ok' });
        this.oauthRemoveToast2 = page.getByText('Application disabled successfully');
        this.oauthEnableApplication = page.getByRole('menuitem', { name: 'Enable' });
        this.oauthDeleteApplication = page.getByRole('menuitem', { name: 'Delete' });
        this.oauthGuideLink = page.getByRole('link', { name: 'OAuth 2.0 Guide' });

        
    }

    async navigateToOAuth() {
        await this.navigateToDevTools.click();
        await this.navigateOAuth.click();
    }

    async createOAuthApplication() {
        await this.createOAuthButton.click();
        await this.oauthNameInput.fill("Autotest");
        await this.oauthWebsiteUrlInput.fill("https://google.com");
        await this.oauthDescriptionInput.fill("Autotest");
        await this.oauthRedirectUriInput.fill("https://google.com");
        await this.oauthApproveRedirectUriInput.click();
        await this.oauthAllowedOriginsInput.fill("https://google.com");
        await this.oauthApproveAllowedOriginsInput.click();
        await this.oauthIconInput.setInputFiles('data/avatars/OAuthApp.jpg');
        await this.oauthPKCE.click();
        await this.oauthAccessScopesArea.click();
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
        await this.oauthActionMenu.click();
        await this.oauthEditApplication.click();
        await this.oauthNewNameInput.fill("AutotestRename");
        await this.oauthNewDescriptionInput.fill("Autotest Description");
        await this.oauthSaveButton.click();
    }

    async generateOAuthToken() {
        await this.oauthActionMenu.click();
        await this.oauthGenerateToken.click();
        await this.oauthGenerateTokenButton.click();
    }

    async deactivationOAuthApplication() {
        await this.oauthActionMenu.click();
        await this.oauthDisableApplication.click();
        await this.oauthOKButton.click();
    }

    async activationOAuthApplication() {
        await this.oauthActionMenu.click();
        await this.oauthEnableApplication.click();
     }

    async deleteOAuthApplication() {
        await this.oauthActionMenu.click();
        await this.oauthDeleteApplication.click();
        await this.oauthOKButton.click();
    }
};
