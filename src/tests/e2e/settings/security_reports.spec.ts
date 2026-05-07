import { test } from "@/src/fixtures";
import Security from "@/src/objects/settings/security/Security";
import MyDocuments from "@/src/objects/files/MyDocuments";
import { PaymentApi } from "@/src/api/payment";

test.describe("Security: download reports", () => {
  let security: Security;
  let myDocuments: MyDocuments;
  let paymentApi: PaymentApi;

  test.beforeEach(async ({ page, api, login }) => {
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    await paymentApi.setupPayment();

    security = new Security(page);
    myDocuments = new MyDocuments(page, api.portalDomain);
    await login.loginToPortal();
    await security.open();
  });

  test("Login History: Download report saves file to My Documents", async () => {
    await test.step("Open Login History tab", async () => {
      await security.openTab("Login History");
    });

    await test.step("Click Download report button", async () => {
      await security.clickLoginHistoryDownloadReport();
    });

    await test.step("Verify report appears in My Documents", async () => {
      await myDocuments.open();
      await myDocuments.filesTable.expectItemVisible("Login History Report");
    });
  });

  test("Audit Trail: Download report saves file to My Documents", async () => {
    await test.step("Open Audit Trail tab", async () => {
      await security.openTab("Audit Trail");
    });

    await test.step("Click Download report button", async () => {
      await security.clickAuditTrailDownloadReport();
    });

    await test.step("Verify report appears in My Documents", async () => {
      await myDocuments.open();
      await myDocuments.filesTable.expectItemVisible("Audit Trail Report");
    });
  });
});
