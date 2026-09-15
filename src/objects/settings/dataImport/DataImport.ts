import BasePage from "@/src/objects/common/BasePage";
import { navItems } from "@/src/utils/constants/settings";
import { expect, Page } from "@playwright/test";

export const importProvider = {
  workspace: "Workspace",
  nextcloud: "Nextcloud",
  google: "GoogleWorkspace",
} as const;

export type TImportProvider =
  (typeof importProvider)[keyof typeof importProvider];

export type TImportWizard = {
  provider: TImportProvider;
  heading: string;
  firstStep: string;
  acceptedExtensions: string;
};

export const importWizards: TImportWizard[] = [
  {
    provider: importProvider.workspace,
    heading: "Import from ONLYOFFICE Workspace",
    firstStep: "1/6. Select file",
    acceptedExtensions: ".gz,.tar,.tar.gz",
  },
  {
    provider: importProvider.nextcloud,
    heading: "Import from Nextcloud",
    firstStep: "1/7. Select file",
    acceptedExtensions: ".zip",
  },
  {
    provider: importProvider.google,
    heading: "Import from Google Workspace",
    // Google imports a set of Takeout archives, hence the plural.
    firstStep: "1/6. Select files",
    acceptedExtensions: ".zip",
  },
];

// A hand-built minimal Takeout export: one root `Takeout` folder, exactly one
// `.html` in it (the parser reads the email from h1.header_title), Profile.json
// and one Drive file. Profile.json keys must be PascalCase — the migrator
// deserializes it case-sensitively and then dereferences `Name` without a null
// check, so camelCase kills the whole parse.
export const googleTakeoutFixture = {
  path: "data/data-import/google-takeout.zip",
  userName: "Takeout User",
  userEmail: "takeout.user@example.com",
  selectedUsers: "Selected: 1/1 users",
} as const;

export const googleImportSteps = {
  selectFile: "1/6. Select files",
  selectUsers: "2/6. Select users",
  selectUserTypes: "3/6. Select user types",
  dataImport: "4/6. Data import",
  // 5/6 is the progress screen and passes on its own.
  complete: "6/6. Data import complete",
} as const;

class DataImport extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open() {
    await this.navigateToSettings();
    await this.navigateToArticle(navItems.dataImport);
    await expect(this.providerCard(importProvider.workspace)).toBeVisible();
  }

  providerCard(provider: TImportProvider) {
    return this.page.getByTestId(`workspace_item_${provider}`);
  }

  private providerImportLink(provider: TImportProvider) {
    return this.page.getByTestId(`workspace_item_${provider}_import_link`);
  }

  // Steps 2 and 3 render their table twice, so this testid is not unique there.
  get nextStepButton() {
    return this.page.getByTestId("next_step_button").first();
  }

  get backToProvidersButton() {
    return this.page.getByTestId("back_to_providers_button");
  }

  // The visible drop zone wraps the real (hidden) file input.
  private get backupFileInput() {
    return this.page
      .getByTestId("upload_backup_file_input")
      .locator("input[type=file]");
  }

  async expectProvidersVisible() {
    for (const provider of Object.values(importProvider)) {
      await expect(this.providerCard(provider)).toBeVisible();
    }
  }

  async startImport(provider: TImportProvider) {
    await this.providerImportLink(provider).click();
    await expect(this.backToProvidersButton).toBeVisible();
  }

  async expectWizardOpened(heading: string, step: string) {
    await expect(
      this.page.getByRole("heading", { name: heading, exact: true }),
    ).toBeVisible();
    await expect(this.page.getByText(step, { exact: true })).toBeVisible();
  }

  async expectAcceptedExtensions(extensions: string) {
    await expect(this.backupFileInput).toHaveAttribute("accept", extensions);
  }

  async expectNextStepDisabled() {
    await expect(this.nextStepButton).toBeDisabled();
  }

  async chooseBackupFile(filePath: string) {
    await this.backupFileInput.setInputFiles(filePath);
  }

  async expectWizardMatches(wizard: TImportWizard) {
    await this.startImport(wizard.provider);
    await this.expectWizardOpened(wizard.heading, wizard.firstStep);
    await this.expectAcceptedExtensions(wizard.acceptedExtensions);
    await this.expectNextStepDisabled();
    await this.goBackToProviders();
  }

  private get usersTable() {
    return this.page.getByTestId("table-container");
  }

  // Picking a file only stages it; the upload and server-side parse start with
  // the step button.
  async uploadBackupFile(filePath: string) {
    await this.chooseBackupFile(filePath);
    await expect(this.nextStepButton).toBeEnabled({ timeout: 30000 });
    await this.nextStepButton.click();
  }

  async goToNextStep() {
    await expect(this.nextStepButton).toBeEnabled({ timeout: 60000 });
    await this.nextStepButton.click();
  }

  // Takes the defaults on every step.
  async completeImport() {
    await this.goToNextStep();
    await this.expectStep(googleImportSteps.selectUserTypes);
    await this.goToNextStep();
    await this.expectStep(googleImportSteps.dataImport);
    await this.goToNextStep();
    await this.expectStep(googleImportSteps.complete);
  }

  async expectStep(step: string) {
    await expect(this.page.getByText(step, { exact: true })).toBeVisible({
      timeout: 120000,
    });
  }

  async expectParsedUser(name: string, email: string) {
    await expect(
      this.usersTable.getByText(name, { exact: true }),
    ).toBeVisible();
    await expect(
      this.usersTable.getByText(email, { exact: true }),
    ).toBeVisible();
  }

  async expectSelectedUsers(count: string) {
    await expect(this.page.getByText(count, { exact: true })).toBeVisible();
  }

  async goBackToProviders() {
    await this.backToProvidersButton.click();
    await expect(this.providerCard(importProvider.workspace)).toBeVisible();
  }
}

export default DataImport;
