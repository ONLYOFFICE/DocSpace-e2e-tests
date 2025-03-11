import { test, expect } from "@playwright/test";
import { DeletionPortal } from "../../../page_objects/settings/DeletionPortal";
import { PortalSetupApi } from "../../../api_library/portal_setup";
import { PortalLoginPage } from "../../../page_objects/portal_login_page";
import MailChecker from "../../../utils/mailChecker";
import config from "../../../config/config.js";

test.describe("DocSpace deletion tests", () => {
  let apiContext;
  let portalSetup;
  let portalLoginPage;
  let deletionportal;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext();
    portalSetup = new PortalSetupApi(apiContext);
    const portalData = await portalSetup.setupPortal();
  });

  test.beforeEach(async ({ page }) => {
    deletionportal = new DeletionPortal(page);
    portalLoginPage = new PortalLoginPage(page);
    await portalLoginPage.loginToPortal(portalSetup.portalDomain);
  });

  test.afterAll(async () => {
    await portalSetup.deletePortal();
    await apiContext.dispose();
  });

  test("Delete portal", async ({ page }) => {
    test.setTimeout(90000);
    await deletionportal.navigateToSettings();
    await deletionportal.navigateToDeletionPortal.click();
    await page.waitForTimeout(1000);
    await deletionportal.deletionPortal();
    await expect(
      page
        .getByTestId("text")
        .filter({ hasText: "A link to confirm the operation has been sent to" })
        .first(),
    ).toContainText("A link to confirm the operation has been sent to", {
      timeout: 10000,
    });

    // Wait for email to arrive
    await new Promise((resolve) => setTimeout(resolve, 15000));

    // Create a MailChecker instance
    const mailChecker = new MailChecker({
      url: config.QA_MAIL_DOMAIN,
      user: config.QA_MAIL_LOGIN,
      pass: config.QA_MAIL_PASSWORD,
    });

    // Check for email with subject containing "Deletion of the" and "portal"
    const email = await mailChecker.checkEmailBySubject({
      subject: "Deletion of the",
      timeoutSeconds: 30,
      moveOut: false,
    });

    // Final verification
    expect(email).toBeTruthy();
  });

  test("Deactivate portal", async ({ page }) => {
    test.setTimeout(90000);
    await deletionportal.navigateToSettings();
    await deletionportal.navigateToDeletionPortal.click();
    await page.waitForTimeout(1000);
    await deletionportal.deactivationPortal();
    await expect(
      page
        .getByTestId("text")
        .filter({ hasText: "A link to confirm the operation has been sent to" })
        .first(),
    ).toContainText("A link to confirm the operation has been sent to", {
      timeout: 10000,
    });

    // Wait for email to arrive
    await new Promise((resolve) => setTimeout(resolve, 15000));

    // Create a MailChecker instance
    const mailChecker = new MailChecker({
      url: config.QA_MAIL_DOMAIN,
      user: config.QA_MAIL_LOGIN,
      pass: config.QA_MAIL_PASSWORD,
    });

    // Check for email with subject containing "Deactivation of the" and "portal"
    const email = await mailChecker.checkEmailBySubject({
      subject: "Deactivation of the",
      timeoutSeconds: 30,
      moveOut: false,
    });

    // Final verification
    expect(email).toBeTruthy();
  });
});
