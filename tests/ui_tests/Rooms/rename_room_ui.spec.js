import { test, expect } from '@playwright/test';
import { PortalSetupApi } from '../../../api_library/portal_setup';
import { RoomsApi } from '../../../api_library/files/rooms_api';
import { RoomsListPage } from '../../../page_objects/room_list_page';
import { PortalLoginPage } from '../../../page_objects/portal_login_page';

test.describe('Room Renaming Tests', () => {
  let apiContext;
  let portalSetup;
  let roomsApi;
  let roomsListPage;
  let portalLoginPage;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext();
    portalSetup = new PortalSetupApi(apiContext);
    const portalData = await portalSetup.setupPortal();
    roomsApi = new RoomsApi(apiContext, portalData.tenant.domain, () =>
      portalSetup.getAuthHeaders()
    );
  });

  test.beforeEach(async ({ page }) => {
    roomsListPage = new RoomsListPage(page);
    portalLoginPage = new PortalLoginPage(page);
    await portalLoginPage.loginToPortal(portalSetup.portalDomain);
  });

  test.afterAll(async () => {
    await portalSetup.deletePortal(true, true);
    await apiContext.dispose();
  });

  test('Rename Form Filling Room', async ({ page }) => {
    const originalTitle = 'Test Room - Form Filling';
    const newTitle = 'Renamed Room - Form Filling';
    await roomsApi.createRoom(originalTitle, 'form_filling');
    await roomsListPage.openRoomsList();
    await roomsListPage.renameRoom(originalTitle, newTitle);
    const renamedRoomLocator = page.locator(`text=${newTitle}`);
    await expect(renamedRoomLocator).toBeVisible();
  });

  test('Rename Collaboration Room', async ({ page }) => {
    const originalTitle = 'Test Room - Collaboration';
    const newTitle = 'Renamed Room - Collaboration';
    await roomsApi.createRoom(originalTitle, 'collaboration');
    await roomsListPage.openRoomsList();
    await roomsListPage.renameRoom(originalTitle, newTitle);
    const renamedRoomLocator = page.locator(`text=${newTitle}`);
    await expect(renamedRoomLocator).toBeVisible();
  });

  test('Rename Custom Room', async ({ page }) => {
    const originalTitle = 'Test Room - Custom';
    const newTitle = 'Renamed Room - Custom';
    await roomsApi.createRoom(originalTitle, 'custom');
    await roomsListPage.openRoomsList();
    await roomsListPage.renameRoom(originalTitle, newTitle);
    const renamedRoomLocator = page.locator(`text=${newTitle}`);
    await expect(renamedRoomLocator).toBeVisible();
  });

  test('Rename Public Room', async ({ page }) => {
    const originalTitle = 'Test Room - Public';
    const newTitle = 'Renamed Room - Public';
    await roomsApi.createRoom(originalTitle, 'public');
    await roomsListPage.openRoomsList();
    await roomsListPage.renameRoom(originalTitle, newTitle);
    const renamedRoomLocator = page.locator(`text=${newTitle}`);
    await expect(renamedRoomLocator).toBeVisible();
  });

  test('Rename Virtual Data Room', async ({ page }) => {
    const originalTitle = 'Test Room - Virtual Data';
    const newTitle = 'Renamed Room - Virtual Data';
    await roomsApi.createRoom(originalTitle, 'virtual_data');
    await roomsListPage.openRoomsList();
    await roomsListPage.renameRoom(originalTitle, newTitle);
    const renamedRoomLocator = page.locator(`text=${newTitle}`);
    await expect(renamedRoomLocator).toBeVisible();
  });
});
