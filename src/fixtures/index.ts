import { test as base, Page } from "@playwright/test";
import API from "@/src/api";
import { ApiSDK } from "../services/index";
import Login from "@/src/objects/common/Login";
import { Payments } from "@/src/objects/settings/payments/Payments";
import Services from "@/src/objects/settings/services/services";

type TestFixtures = {
  api: API;
  apiSdk: ApiSDK;
  page: Page;
  login: Login;
  payments: Payments;
  services: Services;
  ownerAuth: void;
  createDocSpaceAdmin: void;
  docSpaceAdminAuth: void;
};

// Extend the base Playwright test with our fixtures
export const test = base.extend<TestFixtures>({
  api: async ({ playwright }, use) => {
    const ownerContext = await playwright.request.newContext();
    const userContext = await playwright.request.newContext();
    const api = new API(ownerContext, userContext);

    await api.setup();
    console.log(`Portal domain: ${api.portalDomain}`);

    await use(api);

    await api.auth.authenticateOwner();
    await api.cleanup();

    await ownerContext.dispose();
    await userContext.dispose();
  },

  page: async ({ browser }, use) => {
    const page = await browser.newPage();

    // List of URL patterns to block
    const blockedPatterns = ["google-analytics", "/logo.ashx?logotype=3"];

    // Register a new route handler
    await page.route("**/*", async (route) => {
      const url = route.request().url();

      // Check if URL matches any of the blocked patterns
      for (const pattern of blockedPatterns) {
        if (url.includes(pattern)) {
          await route.abort();
          return;
        }
      }

      const origin = new URL(page.url()).origin;

      // If the page is not yet loaded, allow the request
      if (!origin || origin === "null") {
        await route.continue();
        return;
      }

      await route.continue();
    });

    await page.addInitScript(() => {
      globalThis.localStorage?.setItem("integrationUITests", "true");
    });

    await use(page);
    await page.close();
  },

  login: async ({ page, api }, use) => {
    const login = new Login(page, api.portalDomain);
    await use(login);
  },

  payments: async ({ page }, use) => {
    const payments = new Payments(page);
    await use(payments);
  },

  services: async ({ page }, use) => {
    const services = new Services(page);
    await use(services);
  },

  apiSdk: async ({ api, request }, use) => {
    const sdk = new ApiSDK(
      request,
      api.auth.authTokenOwner,
      api.auth.authTokenDocSpaceAdmin,
      api.portalDomain,
    );
    api.auth.setProfilesApi(sdk.profiles);
    await use(sdk);
  },
});
