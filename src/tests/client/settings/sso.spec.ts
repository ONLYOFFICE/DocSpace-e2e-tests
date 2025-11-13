import { Integration } from "@/src/objects/settings/integration/Integration";
import { PaymentApi } from "@/src/api/payment";
import { test } from "@/src/fixtures";
import {
  certificateType,
  integrationTabs,
  toastMessages,
} from "@/src/utils/constants/settings";
import { waitForGetSsoV2Response } from "@/src/objects/settings/integration/api";
import { Sso } from "@/src/objects/settings/integration/Sso";
import Screenshot from "@/src/objects/common/Screenshot";
import { expect } from "@playwright/test";

test.describe("Integration tests - SSO", () => {
  let paymentApi: PaymentApi;
  let sso: Sso;
  let integration: Integration;
  let screenshot: Screenshot;

  test.beforeEach(async ({ page, api, login }) => {
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);

    const portalInfo = await paymentApi.getPortalInfo(api.portalDomain);
    await paymentApi.makePortalPayment(portalInfo.tenantId, 10);
    await paymentApi.refreshPaymentInfo(api.portalDomain);

    screenshot = new Screenshot(page, {
      screenshotDir: "sso",
      fullPage: true,
    });
    sso = new Sso(page);
    integration = new Integration(page);

    await login.loginToPortal();
    await integration.open();
    const promise = waitForGetSsoV2Response(page);
    await integration.openTab(integrationTabs.sso);
    await promise;
  });
  test.skip("Sso", async ({ page }) => {
    await test.step("Enable", async () => {
      await screenshot.expectHaveScreenshot("sso_render");
      await sso.enableSso();
      await screenshot.expectHaveScreenshot("sso_enabled");
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
      await screenshot.expectHaveScreenshot("sp_certificates_add_dialog");
      await sso.openTypeSpCertificateSelector();
      await screenshot.expectHaveScreenshot("sp_certificates_type_dropdown");
      await sso.generateSpCertificate(certificateType.encryption);
      await expect(sso.certificateDescriptionText).toHaveCount(2);
      await sso.hideCertificateDescriptions();
      await screenshot.expectHaveScreenshot(
        "sp_certificates_generated_signing_and_encryption",
      );

      await sso.hideSpAdvancedSettings();
      await sso.showSpAdvancedSettings();

      await sso.openSpSignVerifyAlgorithmSelector();
      await screenshot.expectHaveScreenshot(
        "sp_certificates_sign_verify_algorithm_dropdown",
      );
      await page.mouse.click(1, 1);

      await sso.openSpDecryptAlgorithmSelector();
      await screenshot.expectHaveScreenshot(
        "sp_certificates_decrypt_algorithm_dropdown",
      );
      await page.mouse.click(1, 1);
    });

    await test.step("Idp Public Certificates", async () => {
      await sso.openCertificateContextMenu(sso.spSertificateRow.nth(0));
      await sso.editOption.click();
      const publicCertificate = await sso.spCertificateTextarea.textContent();
      await page.mouse.click(1, 1); // close dialog

      await sso.openGenerateIdpPublicCertificateDialog();
      await screenshot.expectHaveScreenshot("idp_public_certificate_dialog");

      await sso.generateIdpPublicCertificate(publicCertificate!);
      await expect(sso.certificateDescriptionText).toHaveCount(3);
      await sso.hideCertificateDescriptions();
      await screenshot.expectHaveScreenshot(
        "idp_public_certificates_generated_signing",
      );

      await sso.hideIdpAdvancedSettings();
      await sso.showIdpAdvancedSettings();

      await sso.openIdpSignVerifyAlgorithmSelector();
      await screenshot.expectHaveScreenshot(
        "idp_public_certificates_verify_algorithm_dropdown",
      );
      await page.mouse.click(1, 1);
    });

    await test.step("Attribute mapping", async () => {
      await sso.validateInput(sso.firstNameInput);
      await sso.validateInput(sso.lastNameInput);
      await sso.validateInput(sso.emailInput);
    });

    await test.step("Users type", async () => {
      await sso.userTypeButton.click();
      await screenshot?.expectHaveScreenshot("sso_users_type_dropdown");
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
      await screenshot.expectHaveScreenshot("sso_name_id_format_dropdown");
      await page.mouse.click(1, 1);

      await sso.hideAuthPageCheckbox.click();
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

      await sso.hideSpMetadata();
    });

    await test.step("Reset settings", async () => {
      await sso.defaultSettingsButton.click();
      expect(sso.xmlUrlInput).not.toBeVisible();
    });
  });
});
