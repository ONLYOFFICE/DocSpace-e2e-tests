import { test, expect } from "@playwright/test";
import { PortalSetupApi } from "../../api_library/portal_setup";
import MailChecker from "../../utils/mailChecker.js";
import config from "../../config/config.js";

test.describe("Portal Registration Email Test", () => {
  let apiContext;
  let portalSetup;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext();
    portalSetup = new PortalSetupApi(apiContext);
    await portalSetup.setupPortal();
  });

  test.afterAll(async () => {
    await portalSetup.authenticate();
    await portalSetup.deletePortal();
    await apiContext.dispose();
  });

  test("should receive welcome email with correct portal name", async () => {
    /**
     * This test verifies that after portal registration, an email with the expected subject
     * is received. Additionally, it checks that the email body
     * contains the correct portal URL that was generated during the setup process.
     */
    const portalName = portalSetup.portalName;
    await new Promise((resolve) => setTimeout(resolve, 9000));

    const mailChecker = new MailChecker({
      url: config.QA_MAIL_DOMAIN,
      user: config.QA_MAIL_LOGIN,
      pass: config.QA_MAIL_PASSWORD,
      checkedFolder: "checked",
    });

    const email = await mailChecker.findEmailbySubjectWithPortalLink({
      subject: "Welcome to ONLYOFFICE DocSpace!",
      portalName,
      timeoutSeconds: 300,
      moveOut: true,
    });

    expect(email).not.toBeNull();
  });
});
