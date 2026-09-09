import { expect } from "@playwright/test";
import config from "@/config";
import { test } from "@/src/fixtures";
import Dashboard from "@/src/objects/dashboard/Dashboard";
import { defaultHomepageUrls } from "@/src/utils/constants/profile";

const OWNER_NAME = "admin-zero admin-zero";

test.describe("Dashboard", () => {
  let dashboard: Dashboard;

  test.beforeEach(async ({ page, api, login }) => {
    dashboard = new Dashboard(page, api.portalDomain);
    await login.loginToPortal();
    await dashboard.open();
  });

  test("Displays the owner's profile details", async ({ api }) => {
    const workspaceName = api.portalDomain.split(".")[0];

    await test.step("Verify welcome heading is visible", async () => {
      await expect(dashboard.welcomeHeading).toBeVisible();
    });

    await test.step("Verify profile details match the portal owner", async () => {
      await dashboard.expectProfileDetails(
        workspaceName,
        OWNER_NAME,
        config.DOCSPACE_OWNER_EMAIL,
      );
    });
  });

  test("Discover Apps: Open navigates to Files", async ({ page }) => {
    await dashboard.openFilesButton.click();
    await page.waitForURL(/rooms\/personal/, { waitUntil: "load" });
  });

  test("Discover Apps: Create room opens the room type selector", async () => {
    await dashboard.createRoomButton.click();
    await dashboard.expectRoomTypeSelectorVisible();
  });

  test("Discover Apps: Create Form space opens room creation pre-set to a form space", async () => {
    await dashboard.createFormSpaceButton.click();
    await dashboard.expectCreateRoomFormVisible();
  });

  test("Discover Apps: Create AI agent prompts to activate AI when it is not configured", async () => {
    await dashboard.createAiAgentButton.click();
    await dashboard.expectActivateAiDialogVisible();
  });
});

test.describe("Dashboard (non-owner roles)", () => {
  test("Guest: Discover Apps show Open instead of create actions", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    const dashboard = new Dashboard(page, api.portalDomain);
    const { userData } = await apiSdk.profiles.addMember("owner", "Guest");

    await login.loginWithCredentials(userData.email, userData.password);
    await dashboard.open();

    await test.step("Verify all Discover Apps buttons say Open", async () => {
      await dashboard.expectDiscoverAppsShowOpen();
    });

    await test.step("Verify Rooms Open navigates to Rooms", async () => {
      await dashboard.createRoomButton.click();
      await page.waitForURL(defaultHomepageUrls.rooms, { waitUntil: "load" });
    });
  });

  test("User: Discover Apps show Open instead of create actions", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    const dashboard = new Dashboard(page, api.portalDomain);
    const { userData } = await apiSdk.profiles.addMember("owner", "User");

    await login.loginWithCredentials(userData.email, userData.password);
    await dashboard.open();

    await test.step("Verify all Discover Apps buttons say Open", async () => {
      await dashboard.expectDiscoverAppsShowOpen();
    });

    await test.step("Verify Forms Open navigates to Forms", async () => {
      await dashboard.createFormSpaceButton.click();
      await page.waitForURL(defaultHomepageUrls.forms, { waitUntil: "load" });
    });
  });
});
