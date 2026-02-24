import { Integration } from "@/src/objects/settings/integration/Integration";
import { PaymentApi } from "@/src/api/payment";
import { test } from "@/src/fixtures";
import {
  certificateType,
  integrationTabs,
  toastMessages,
} from "@/src/utils/constants/settings";
import {
  waitForDeleteSsoV2Response,
  waitForGetSsoV2Response,
} from "@/src/objects/settings/integration/api";
import { Sso } from "@/src/objects/settings/integration/Sso";
import { expect } from "@playwright/test";

test.describe("Integration tests - SSO", () => {
  let paymentApi: PaymentApi;
  let sso: Sso;
  let integration: Integration;

  test.beforeEach(async ({ page, api, login }) => {
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);

    await paymentApi.setupPayment();
    await page.waitForTimeout(2000); // give billing changes time to propagate before hitting SSO endpoints

    sso = new Sso(page);
    integration = new Integration(page);

    await login.loginToPortal();
    await integration.open();
    const promise = waitForGetSsoV2Response(page);
    await integration.openTab(integrationTabs.sso);
    await promise;
  });
  test("Sso", async ({ page }) => {
    await test.step("Enable", async () => {
      await sso.enableSso();
    });

    await test.step("Sp certificates", async () => {
      await sso.openGenerateSpCeritficateDialog();
      await sso.openTypeSpCertificateSelector();
      await sso.generateSpCertificate(certificateType.signAndEcrypt);
      await expect(sso.certificateDescriptionText).toHaveCount(1);

      await sso.openGenerateSpCeritficateDialog();
      await sso.openTypeSpCertificateSelector();
      await sso.generateSpCertificate(certificateType.signing);
      await sso.removeToast(toastMessages.certificateExists);
      await page.mouse.click(1, 1); // close dialog

      await sso.openCertificateContextMenu(sso.spSertificateRow.nth(0));
      await sso.deleteOption.click();
      await expect(sso.certificateDescriptionText).toHaveCount(0);

      await sso.openGenerateSpCeritficateDialog();
      await sso.openTypeSpCertificateSelector();
      await sso.generateSpCertificate(certificateType.signing);
      await expect(sso.certificateDescriptionText).toHaveCount(1);
      await sso.hideCertificateDescriptions();

      await sso.openGenerateSpCeritficateDialog();
      await sso.openTypeSpCertificateSelector();
      await sso.generateSpCertificate(certificateType.encryption);
      await expect(sso.certificateDescriptionText).toHaveCount(2);
      await sso.hideCertificateDescriptions();

      await sso.hideSpAdvancedSettings();
      await sso.showSpAdvancedSettings();

      await sso.openSpSignVerifyAlgorithmSelector();
      await page.mouse.click(1, 1);

      await sso.openSpDecryptAlgorithmSelector();
      await page.mouse.click(1, 1);
    });

    await test.step("Idp Public Certificates", async () => {
      await sso.openCertificateContextMenu(sso.spSertificateRow.nth(0));
      await sso.editOption.click();
      const publicCertificate = await sso.spCertificateTextarea.textContent();
      await page.mouse.click(1, 1); // close dialog

      await sso.openGenerateIdpPublicCertificateDialog();

      await sso.generateIdpPublicCertificate(publicCertificate!);
      await expect(sso.certificateDescriptionText).toHaveCount(3);
      await sso.hideIdpAdvancedSettings();
      await sso.showIdpAdvancedSettings();

      await sso.openIdpSignVerifyAlgorithmSelector();
      await page.mouse.click(1, 1);
    });

    await test.step("Attribute mapping", async () => {
      await sso.validateInput(sso.firstNameInput);
      await sso.validateInput(sso.lastNameInput);
      await sso.validateInput(sso.emailInput);
    });

    await test.step("Users type", async () => {
      await sso.userTypeButton.click();
      await integration.userTypeDocSpaceadmin.click();
      await sso.userTypeButton.click();
      await integration.userTypeRoomAdmin.click();
      await sso.userTypeButton.click();
      await integration.userTypeUser.click();
    });

    await test.step("Sp settings", async () => {
      await sso.validateInput(sso.idpLoginInput);
      await sso.validateInput(sso.idpEntityInput);

      await sso.idpSsoRedirectRadioButton.click();
      await sso.validateInput(sso.idpSsoUrlRedirectInput);
      await sso.idpSsoPostRadioButton.click();
      await sso.validateInput(sso.idpSsoUrlPostInput);

      await sso.idpSloRedirectRadioButton.click();
      // ISSUE: "Error message does not appear under the input"
      // await sso.validateInput(sso.idpSloUrlRedirectInput);
      await sso.idpSloPostRadioButton.click();
      await sso.validateInput(sso.idpSloUrlPostInput);

      await sso.openNameIdFormatSelector();
      await page.mouse.click(1, 1);
      await sso.disableEmailVerificationCheckbox.click();

      await sso.saveSpSettingsButton.click();
      await sso.removeToast(toastMessages.invalidBinding);
    });

    await test.step("Download/Load metadata", async () => {
      await sso.showSpMetadata();

      const pagePromise = page.waitForEvent("popup");
      await sso.downloadSpMetadataXMLButton.click();
      const metaDataPage = await pagePromise;
      await metaDataPage.waitForURL("https://*.onlyoffice.io/sso/metadata");
      const metaDataUrl = metaDataPage.url();
      await metaDataPage.close();
      await sso.loadMetaData(metaDataUrl);
    });

    await test.step("Reset settings", async () => {
      const deleteResponsePromise = waitForDeleteSsoV2Response(page);
      await sso.defaultSettingsButton.click();
      const deleteResponse = await deleteResponsePromise;
      expect(deleteResponse.status(), "Failed to reset SSO settings").toBe(200);
      expect(sso.xmlUrlInput).not.toBeVisible();
    });
  });
});
