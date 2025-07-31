import { expect, Locator, Page } from "@playwright/test";
import BasePage from "../../common/BasePage";
import { TCertificateType } from "@/src/utils/constants/settings";
import BaseDialog from "../../common/BaseDialog";
import { BaseContextMenu } from "../../common/BaseContextMenu";

export class Sso extends BasePage {
  LONG_INPUT_STRING =
    "long input string long input string long input string long input string long input string long input string long input string";

  dialog: BaseDialog;
  contextMenu: BaseContextMenu;

  constructor(page: Page) {
    super(page);
    this.dialog = new BaseDialog(page);
    this.contextMenu = new BaseContextMenu(page);
  }

  get userTypeButton() {
    return this.page.getByTestId("combobox").nth(4);
  }

  get ssoSwitch() {
    return this.page.locator("label.enable-sso");
  }

  get xmlUrlInput() {
    return this.page.locator("#uploadXmlUrl");
  }
  get xmlUploadButton() {
    return this.page.locator(".upload-button");
  }

  get xmlSelectFileButton() {
    return this.page.getByRole("button", { name: "Select file" });
  }

  get idpLoginInput() {
    return this.page.locator("#spLoginLabel");
  }

  get idpEntityInput() {
    return this.page.locator("#entityId");
  }

  get idpSsoUrlPostInput() {
    return this.page.locator("#ssoUrlPost");
  }

  get idpSsoUrlRedirectInput() {
    return this.page.locator("#ssoUrlRedirect");
  }

  get idpSloUrlPostInput() {
    return this.page.locator("#sloUrlPost");
  }

  get idpSloUrlRedirectInput() {
    return this.page.locator("#sloUrlRedirect");
  }

  get idpSsoPostRadioButton() {
    return this.page.locator("#sso-post");
  }
  get idpSsoRedirectRadioButton() {
    return this.page.locator("#sso-redirect");
  }
  get idpSloPostRadioButton() {
    return this.page.locator("#slo-post");
  }
  get idpSloRedirectRadioButton() {
    return this.page.locator("#slo-redirect");
  }

  get nameIdFormatButton() {
    // TODO: unique data-testid
    return this.page.locator(".combo-button").nth(0);
  }

  get idpAddCertificateButton() {
    return this.page.locator("#idp-add-certificate");
  }

  get idpHideAdvancedSettingsButton() {
    return this.page.locator("#idp-hide-button");
  }

  get idpPublicCertificateTextarea() {
    return this.page.locator("#idp-certificate");
  }

  get idpSignVerifyAlgorithmButton() {
    return this.page.getByTestId("combobox").nth(1);
  }

  get spSignVerifyAlgorithmButton() {
    return this.page.getByTestId("combobox").nth(2);
  }

  get spDecryptAlgorithmButton() {
    return this.page.getByTestId("combobox").nth(3);
  }

  get spAddCertificateButton() {
    return this.page.locator("#sp-add-certificate");
  }

  get spHideAdvancedSettingsButton() {
    return this.page.locator("#sp-hide-button");
  }

  get generateNewSpCertificateButton() {
    return this.page.locator(".generate");
  }

  get spCertificateTextarea() {
    return this.page.locator("#sp-certificate");
  }

  get spPrivateKeyTextarea() {
    return this.page.locator("#sp-privateKey");
  }

  get openTypeSpCertificateSelectorButton() {
    return this.page.locator(".modal-combo");
  }

  get certificateDescriptionText() {
    return this.page.locator(".description");
  }

  get spSignAuthRequestsCheckbox() {
    return this.page.locator("#sp-sign-auth-requests");
  }

  get spDecryptDecryptAssertionsCheckbox() {
    return this.page.locator("#sp-encrypt-assertionss");
  }

  get okButton() {
    return this.page.locator("#ok-button");
  }

  get deleteOption() {
    return this.page.locator("#delete");
  }

  get editOption() {
    return this.page.locator("#edit");
  }

  get spSertificateRow() {
    return this.page.locator(".row");
  }

  get idpVerifyAuthResponsesCheckbox() {
    return this.page.locator("#idp-verify-auth-responses-sign");
  }

  get firstNameInput() {
    return this.page.locator("#firstName");
  }

  get lastNameInput() {
    return this.page.locator("#lastName");
  }

  get emailInput() {
    return this.page.locator("#email");
  }

  get hideAuthPageCheckbox() {
    return this.page.locator("#hide-auth-page");
  }

  get disableEmailVerificationCheckbox() {
    return this.page.locator("#disable-email-verification");
  }

  get saveSpSettingsButton() {
    return this.page.getByTestId("save-button");
  }

  get spMetaHideButton() {
    return this.page.locator("#sp-metadata-hide-button");
  }

  get downloadSpMetadataXMLButton() {
    return this.page.locator("#download-metadata-xml");
  }

  get defaultSettingsButton() {
    return this.page.locator(".restore-button");
  }

  async enableSso() {
    const checkbox = this.ssoSwitch.locator("input");
    const isChecked = await checkbox.isChecked();

    if (!isChecked) {
      await this.ssoSwitch.click();
      await expect(this.xmlUrlInput).not.toBeDisabled();
    }
  }

  async openGenerateSpCeritficateDialog() {
    await this.spAddCertificateButton.click();
  }

  async openGenerateIdpPublicCertificateDialog() {
    await this.idpAddCertificateButton.click();
  }

  async openTypeSpCertificateSelector() {
    await this.openTypeSpCertificateSelectorButton.click();
  }

  async openNameIdFormatSelector() {
    await this.nameIdFormatButton.click();
  }

  async hideSpAdvancedSettings() {
    await this.spHideAdvancedSettingsButton.click();
    await expect(this.spSignAuthRequestsCheckbox).not.toBeVisible();
  }

  async showSpAdvancedSettings() {
    await this.spHideAdvancedSettingsButton.click();
    await expect(this.spSignAuthRequestsCheckbox).toBeVisible();
  }

  async hideIdpAdvancedSettings() {
    await this.idpHideAdvancedSettingsButton.click();
    await expect(this.idpVerifyAuthResponsesCheckbox).not.toBeVisible();
  }

  async showIdpAdvancedSettings() {
    await this.idpHideAdvancedSettingsButton.click();
    await expect(this.idpVerifyAuthResponsesCheckbox).toBeVisible();
  }

  async showSpMetadata() {
    await this.spMetaHideButton.click();
    await expect(this.downloadSpMetadataXMLButton).toBeVisible();
  }

  async hideSpMetadata() {
    await this.spMetaHideButton.click();
    await expect(this.downloadSpMetadataXMLButton).not.toBeVisible();
  }

  async loadMetaData(url: string) {
    await this.xmlUrlInput.fill(url);
    await this.xmlUploadButton.click();
    await expect(this.idpEntityInput).toHaveValue(url);
  }

  async openIdpSignVerifyAlgorithmSelector() {
    await this.page.mouse.click(1, 1);
    await this.idpSignVerifyAlgorithmButton.click();
  }

  async openSpSignVerifyAlgorithmSelector() {
    await this.page.mouse.click(1, 1);
    await this.spSignVerifyAlgorithmButton.click();
  }

  async openSpDecryptAlgorithmSelector() {
    await this.page.mouse.click(1, 1);
    await this.spDecryptAlgorithmButton.click();
  }

  async generateSpCertificate(type: TCertificateType) {
    await this.page
      .getByRole("option", { name: type, exact: true })
      .click({ force: true });

    await this.generateNewSpCertificateButton.click();
    await expect(this.okButton.nth(1)).toBeDisabled();
    await expect(this.spCertificateTextarea).not.toBeDisabled();
    await this.okButton.nth(1).click();
  }

  async generateIdpPublicCertificate(certificateText: string) {
    await this.idpPublicCertificateTextarea.fill(certificateText);
    await this.okButton.nth(0).click();
  }

  async openCertificateContextMenu(row: Locator) {
    await row.locator(".context-btn").click();
  }

  async hideCertificateDescriptions() {
    const dates = await this.certificateDescriptionText.all();

    for (const date of dates) {
      await date.evaluate((el) => {
        el.style.display = "none";
      });
    }
  }

  async validateInput(input: Locator) {
    await expect(input).toBeVisible();
    await input.clear();
    await input.blur();
    await expect(this.page.getByText("Empty field")).toBeVisible();
    await input.fill(this.LONG_INPUT_STRING);
    await expect(input).toHaveValue(this.LONG_INPUT_STRING);
  }
}
