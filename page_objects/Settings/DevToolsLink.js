import MainPage from "../mainPage";

export class DevToolsLink extends MainPage {
    constructor(page) {
        super(page);
        this.page = page;
        this.navigateToDevTools = page.getByRole('link', { name: 'Developer Tools' });
        this.learnMoreAreaButton = page.getByTestId('empty-screen-container');
        this.learnMoreButton = page.getByTestId('button');
        this.navigateJavaScriptSDK = page.getByText('Javascript SDK');
        this.zoomLink = page.getByTitle('Zoom').locator('path');
        this.wordPressLink = page.locator('path:nth-child(6)').first();
        this.drupalLink = page.locator('path:nth-child(7)');
        this.apiLibraryLink = page.getByText('API library.');
        this.allConnectorsLink = page.getByText('See all connectors');
        this.navigateToPlaginSDK = page.getByText('Plugin SDK');
        this.readInstructionsButton = page.getByRole('button', { name: 'Read instructions' });
        this.markdownArea = page.getByText('markdownVer. 1.0.1DocSpace');
        this.markdownLink = this.markdownArea.getByText('Go to repository');
        this.drawIoArea = page.getByText('draw.ioVer. 1.0.2A tool for');
        this.drawIoLink = this.drawIoArea.getByText('Go to repository');
        this.speechToTextArea = page.getByText('speech-to-textVer. 1.0.2Speech to Text Conversion is a speech recognition');
        this.speechToTextLink = this.speechToTextArea.getByText('Go to repository');
        this.pdfConverterArea = page.getByText('pdf-converterVer. 1.0.2A');
        this.pdfConverterLink = this.pdfConverterArea.getByText('Go to repository');
    }
    
    async clickLearnMoreButton() {
        await this.learnMoreAreaButton.click();
        await this.learnMoreButton.click();
    }
}