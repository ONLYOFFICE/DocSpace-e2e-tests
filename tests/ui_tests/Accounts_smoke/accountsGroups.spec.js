import { test, expect } from "@playwright/test";
import { PortalSetupApi } from "../../../api_library/portal_setup";
import { PortalLoginPage } from "../../../page_objects/portal_login_page";
import { GroupsPage } from "../../../page_objects/accounts/groupsPage";

test.describe("Groups Smoke Tests", () => {
  let apiContext;
  let portalSetup;
  let portalLoginPage;
  let groupsPage;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext();
    portalSetup = new PortalSetupApi(apiContext);
    await portalSetup.setupPortalUser();
  });

  test.beforeEach(async ({ page }) => {
    portalLoginPage = new PortalLoginPage(page);
    groupsPage = new GroupsPage(page);
    await portalLoginPage.loginToPortal(portalSetup.portalDomain);
    await groupsPage.navigateToGroups();
  });

  test.afterAll(async () => {
    await portalSetup.deletePortal(true, true);
    await apiContext.dispose();
  });

  test("create group", async ({ page }) => {
    const groupName = "test-group-1";
    await groupsPage.createGroup(groupName);
    const groupNameLocator = page.locator(`text=${groupName}`);
    await expect(groupNameLocator).toBeVisible();
  });

  test("edit group name", async ({ page }) => {
    const initialGroupName = "test-group-1";
    const updatedGroupName = "updated-group-1";
    await groupsPage.editGroup(updatedGroupName);
    const updatedGroupNameLocator = page.locator(`text=${updatedGroupName}`);
    const groupNameLocator = page.locator(`text=${initialGroupName}`);
    await expect(updatedGroupNameLocator).toBeVisible();
    await expect(groupNameLocator).not.toBeVisible();
  });

  test("delete group", async ({ page }) => {
    const groupName = "updated-group-1";
    await groupsPage.deleteGroup(groupName);
    const groupNameLocator = page.locator(`text=${groupName}`);
    await expect(groupNameLocator).not.toBeVisible();
  });
  test("create group with empty screen", async ({ page }) => {
    const groupName = "test-group-2";
    await groupsPage.createGroupEmptyScreen(groupName);
    const groupNameLocator = page.locator(`text=${groupName}`);
    await expect(groupNameLocator).toBeVisible();
    await groupsPage.deleteGroup(groupName);
    await expect(groupNameLocator).not.toBeVisible();
  });
});
