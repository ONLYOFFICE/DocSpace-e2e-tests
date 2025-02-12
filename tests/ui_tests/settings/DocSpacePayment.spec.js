import { test, expect } from '@playwright/test';
import { Payment } from "../../../page_objects/Settings/Payment";
import { PortalSetupApi } from "../../../api_library/portal_setup";
import { PortalLoginPage } from "../../../page_objects/portal_login_page";

    test.describe('Payment Tests', () => {  
        let apiContext;
        let portalSetup;
        let portalLoginPage;
        let payment;

    test.beforeAll(async ({ playwright }) => {
        apiContext = await playwright.request.newContext();
        portalSetup = new PortalSetupApi(apiContext);
        const portalData = await portalSetup.setupPortal();
      });

    test.beforeEach(async ({ page }) => {
        payment = new Payment(page);
        portalLoginPage = new PortalLoginPage(page);
        await portalLoginPage.loginToPortal(portalSetup.portalDomain);
      });

    test.afterAll(async () => {
        await portalSetup.deletePortal();
        await apiContext.dispose();
      });

    test('Payment', async ({ page, context }) => { //Работает только с американского IP
        test.setTimeout(240000);
        const payment = new Payment(page, context);
        await payment.navigateToPayments();
        await payment.upgradePlan();
        await payment.fillPaymentData();
        await payment.returnToPortal();
        await expect(page.locator('text=You are using Business plan')).toBeVisible({ timeout: 10000 });
    });

    test('Change Tarif Plan', async ({ page }) => {  //Работает только при оплате с американского IP
        const payment = new Payment(page);
        await payment.navigateToPayments();
        await payment.downgradePlan();
        await expect(page.locator('text=Business plan updated')).toHaveText('Business plan updated', { timeout: 10000 });
        await payment.removeToast.click();
        await payment.updatePlan();
        await expect(page.locator('text=Business plan updated')).toHaveText('Business plan updated', { timeout: 10000 });
    });
});

