import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import { Profile } from "@/src/objects/profile/Profile";
import Login from "@/src/objects/common/Login";
import { getPortalUrl } from "@/config";

const PROFILE_LOGIN_URL = /\/profile\/login/;
const TFA_SETTINGS_URL = /portal-settings\/security\/access-portal/;

test.describe("Profile: campaigns banner access by role", () => {
  test.describe("Owner has banner", () => {
    let profile: Profile;

    test.beforeEach(async ({ page, api, login }) => {
      profile = new Profile(page);
      await login.loginToPortal();
      await page.goto(`${getPortalUrl(api.portalDomain)}/profile/login`, {
        waitUntil: "load",
      });
      await expect(page).toHaveURL(PROFILE_LOGIN_URL);
    });

    test("Owner sees 2FA campaigns banner and can navigate to TFA settings", async ({
      page,
    }) => {
      await test.step("Campaigns banner with 2FA text is visible", async () => {
        await profile.checkCampaignsBannerVisible();
      });

      await test.step("Clicking banner opens TFA settings", async () => {
        await profile.clickCampaignsBanner();
        await expect(page).toHaveURL(TFA_SETTINGS_URL);
      });
    });
  });

  test.describe("DocSpace admin has banner", () => {
    let profile: Profile;

    test.beforeEach(async ({ page, api, apiSdk }) => {
      profile = new Profile(page);
      const login = new Login(page, api.portalDomain);
      const { userData } = await apiSdk.profiles.addMember(
        "owner",
        "DocSpaceAdmin",
      );
      await login.loginWithCredentials(userData.email, userData.password);
      await page.goto(`${getPortalUrl(api.portalDomain)}/profile/login`, {
        waitUntil: "load",
      });
      await expect(page).toHaveURL(PROFILE_LOGIN_URL);
    });

    test("DocSpace admin sees 2FA campaigns banner and can navigate to TFA settings", async ({
      page,
    }) => {
      await test.step("Campaigns banner with 2FA text is visible", async () => {
        await profile.checkCampaignsBannerVisible();
      });

      await test.step("Clicking banner opens TFA settings", async () => {
        await profile.clickCampaignsBanner();
        await expect(page).toHaveURL(TFA_SETTINGS_URL);
      });
    });
  });

  test.describe("Room admin does not have banner", () => {
    let profile: Profile;

    test.beforeEach(async ({ page, api, apiSdk }) => {
      profile = new Profile(page);
      const login = new Login(page, api.portalDomain);
      const { userData } = await apiSdk.profiles.addMember(
        "owner",
        "RoomAdmin",
      );
      await login.loginWithCredentials(userData.email, userData.password);
      await page.goto(`${getPortalUrl(api.portalDomain)}/profile/login`, {
        waitUntil: "load",
      });
      await expect(page).toHaveURL(PROFILE_LOGIN_URL);
    });

    test("Room admin does not see 2FA campaigns banner", async () => {
      await profile.checkCampaignsBannerNotVisible();
    });
  });

  test.describe("User does not have banner", () => {
    let profile: Profile;

    test.beforeEach(async ({ page, api, apiSdk }) => {
      profile = new Profile(page);
      const login = new Login(page, api.portalDomain);
      const { userData } = await apiSdk.profiles.addMember("owner", "User");
      await login.loginWithCredentials(userData.email, userData.password);
      await page.goto(`${getPortalUrl(api.portalDomain)}/profile/login`, {
        waitUntil: "load",
      });
      await expect(page).toHaveURL(PROFILE_LOGIN_URL);
    });

    test("User does not see 2FA campaigns banner", async () => {
      await profile.checkCampaignsBannerNotVisible();
    });
  });

  test.describe("Guest does not have banner", () => {
    let profile: Profile;

    test.beforeEach(async ({ page, api, apiSdk }) => {
      profile = new Profile(page);
      const login = new Login(page, api.portalDomain);
      const { userData } = await apiSdk.profiles.addMember("owner", "Guest");
      await login.loginWithCredentials(userData.email, userData.password);
      await page.goto(`${getPortalUrl(api.portalDomain)}/profile/login`, {
        waitUntil: "load",
      });
      await expect(page).toHaveURL(PROFILE_LOGIN_URL);
    });

    test("Guest does not see 2FA campaigns banner", async () => {
      await profile.checkCampaignsBannerNotVisible();
    });
  });
});
