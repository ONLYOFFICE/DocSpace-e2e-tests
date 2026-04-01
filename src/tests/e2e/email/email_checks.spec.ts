import config from "@/config";
import { expect } from "@playwright/test";
import { PaymentApi } from "@/src/api/payment";
import { test } from "@/src/fixtures";
import { Profile } from "@/src/objects/profile/Profile";
import Customization from "@/src/objects/settings/customization/Customization";
import { toastMessages } from "@/src/utils/constants/settings";
import { createMailChecker } from "@/src/utils/helpers/email/createMailChecker";
import { getOwnerConfirmLink } from "@/src/utils/helpers/email/getOwnerConfirmLink";

test.describe("Email Checks", () => {
  const defaultOwnerEmail = config.DOCSPACE_OWNER_EMAIL;

  test.beforeAll(() => {
    config.DOCSPACE_OWNER_EMAIL = defaultOwnerEmail.replace("@", "+alias1@");
  });

  test.afterAll(() => {
    config.DOCSPACE_OWNER_EMAIL = defaultOwnerEmail;
  });

  test.beforeEach(async () => {
    await createMailChecker().deleteAllMatchingEmails();
  });

  test.afterEach(async () => {
    await createMailChecker().deleteAllMatchingEmails();
  });

  test.describe("Customization", () => {
    let paymentApi: PaymentApi;
    let customization: Customization;

    test.beforeEach(async ({ page, api }) => {
      paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);

      await paymentApi.setupPayment();
      customization = new Customization(page);
    });

    test("Rename portal email notification", async ({ api, page, login }) => {
      const confirmLink = await getOwnerConfirmLink(api.portalDomain);
      await page.goto(confirmLink, { waitUntil: "load" });
      await login.loginToPortal();
      await customization.open();

      const { originalName, newName } = await customization.renamePortal();

      // Update teardown target so fixture cleanup can delete the renamed portal if the test fails.
      api.apisystem.setPortalDomain(`${newName}.onlyoffice.io`);
      api.apisystem.setPortalName(newName);
      await page.waitForURL(
        `https://${newName}.onlyoffice.io/rooms/shared/**`,
        {
          timeout: 30000,
        },
      );
      await page.waitForLoadState("domcontentloaded");

      const mailChecker = createMailChecker();
      const email = await mailChecker.checkEmailBySubject({
        subject: "Change of portal address",
        timeoutSeconds: 60,
      });

      expect(email).toBeTruthy();

      await customization.renamePortalBack(originalName);
      api.apisystem.setPortalDomain(`${originalName}.onlyoffice.io`);
      api.apisystem.setPortalName(originalName);
      await page.waitForURL(`https://${originalName}.onlyoffice.io/**`, {
        timeout: 30000,
        waitUntil: "load",
      });
    });

    test.skip("Brand name email notification", async ({ api, page, login }) => {
      const confirmLink = await getOwnerConfirmLink(api.portalDomain);
      const profile = new Profile(page);

      await page.goto(confirmLink, { waitUntil: "load" });
      await login.loginToPortal();
      await customization.open();

      await customization.openTab("Branding");
      await customization.textInputBrandName.first().fill("autoTest");
      await customization.brandNameSaveButton.click();
      await customization.removeToast(toastMessages.settingsUpdated);

      await profile.open();
      await profile.changePassword();

      const mailChecker = createMailChecker();
      const email = await mailChecker.checkEmailBySenderAndSubject({
        subject: "Confirm changing your password",
        sender: "autoTest",
      });

      expect(email).toBeTruthy();
    });
  });

  test("Owner email can be confirmed after portal registration", async ({
    page,
    api,
    login,
  }) => {
    const confirmLink = await getOwnerConfirmLink(api.portalDomain);
    const profile = new Profile(page);

    await page.goto(confirmLink, { waitUntil: "load" });
    await login.loginToPortal();
    await profile.open();
    await profile.expectEmailConfirmed();
  });
});
