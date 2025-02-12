import MainPage from "../MainPage";

export class Customization extends MainPage {
    constructor(page) {
        super(page);
        this.page = page;
        this.languageSelector = page.locator('#fieldContainerLanguage').getByRole('img');
        this.timezoneSelector = page.locator('#fieldContainerTimezone').getByRole('img');
        this.settingsTitle = page.getByText('Language and Time Zone SettingsChange Language and Time Zone Settings to adjust');
        this.saveButton = page.getByRole('button', { name: 'Save' }).first();
        this.titleInput = page.getByPlaceholder('Enter title');
        this.settingsTitleWelcomePage = page.getByText('Welcome Page SettingsAdjust');
        this.saveButtonWelcomePage = page.locator('#buttonsWelcomePage').getByRole('button', { name: 'Save' });
        this.restoreButton = page.getByRole('button', { name: 'Restore' });
        this.textInput = page.getByTestId('text-input');
        this.fieldContainerButton = page.getByTestId('field-container').getByTestId('button');
        this.sectionWrapper = page.locator('.section-wrapper-content');
        this.restoreButton = page.getByRole('button', { name: 'Restore' });
        this.themeContainer = page.locator('.theme-container').first();
        this.darkThemeOption = page.locator('div').filter({ hasText: /^Dark theme$/ }).first();
        this.saveButtonAppearance = page.locator('#sectionScroll').getByRole('button', { name: 'Save' });
        this.themeAdd = page.locator('.theme-add');
        this.accentColorInput = page.locator('#accent');
        this.buttonsColorInput = page.locator('#buttons');
        this.deleteThemeButton = page.getByRole('button', { name: 'Delete theme' });
        this.confirmDeleteButton = page.getByRole('button', { name: 'Delete', exact: true });
        this.docspaceLanguageGuideLink = page.getByTestId('link').first();  
        this.docspaceTitleGuideLink = page.getByTestId('link').nth(1);
        this.docspaceAlternativeUrlGuideLink = page.getByTestId('link').nth(2);
        this.docspaceRenamingGuideLink = page.getByTestId('link').nth(3);
        this.RemoveToast = page.getByText('Settings have been successfully updated');
        this.RemoveToast2 = page.getByText('Welcome Page settings have been successfully saved');
        this.navigateToAppearance = page.getByText('Appearance');
        this.approveNewColorSheme = page.getByRole('button', { name: 'Save' }).nth(1);
    }

    async changeLanguage(language) {
        await this.languageSelector.click();
        await this.page.waitForSelector(`text=${language}`);
        await this.page.locator(`text=${language}`).first().click();
    }
    
    async changeTimezone(timezone) {
        await this.timezoneSelector.click();
        await this.page.waitForSelector(`text=${timezone}`);
        await this.page.locator(`text=${timezone}`).first().click();
    }

    async setTitle(title) {
        await this.titleInput.fill(title);
    }

    async setBrandingText(text) {
        await this.textInput.fill(text);
    }
 
    async selectTheme(themeId) {
        await this.page.locator(`[id="\\3${themeId}"] div`).nth(1).first().click({ force: true });
    }

    async createCustomTheme(accentColor, buttonsColor) {
        await this.themeAdd.click();
        await this.accentColorInput.click();
        await this.page.getByRole('textbox').fill(accentColor);
        await this.page.getByRole('button', { name: 'Apply' }).click();
        await this.buttonsColorInput.click();
        await this.page.getByRole('textbox').fill(buttonsColor);
        await this.page.getByRole('button', { name: 'Apply' }).click();
        await this.approveNewColorSheme.click();
    }

    async deleteCustomTheme() {
        await this.deleteThemeButton.click();
        await this.confirmDeleteButton.click();
    }

   
}

export default Customization;