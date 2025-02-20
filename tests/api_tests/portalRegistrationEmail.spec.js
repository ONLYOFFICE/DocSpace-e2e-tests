import { test, expect } from "@playwright/test";
import { PortalSetupApi } from "../../api_library/portal_setup";
import MailChecker from "../../utils/mailChecker.js";
import config from "../../config/config.js";

test.describe("Portal Registration Email Test", () => {
  let apiContext;
  //   let portalSetup;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext();
    // portalSetup = new PortalSetupApi(apiContext);
  });

  test.afterAll(async () => {
    // await portalSetup.deletePortal();
    await apiContext.dispose();
  });

  test("should receive welcome email after portal registration", async () => {
    // await portalSetup.setupPortal();

    const mailChecker = new MailChecker({
      url: config.QA_MAIL_DOMAIN,
      user: config.QA_MAIL_LOGIN,
      pass: config.QA_MAIL_PASSWORD,
      checkedFolder: "checked",
    });

    const email = await mailChecker.checkEmailBySubject({
      subject: "Welcome to ONLYOFFICE DocSpace!",
      timeoutSeconds: 300,
      moveOut: true,
    });

    expect(email).not.toBeNull();
  });
});
