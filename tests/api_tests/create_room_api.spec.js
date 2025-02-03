import { test, expect } from "@playwright/test";
import { PortalSetupApi } from "../../api_library/portal_setup";
import { RoomsApi } from "../../api_library/files/rooms_api";

test.describe("Room Creation API", () => {
  let apiContext;
  let portalSetup;
  let roomsApi;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext();
    portalSetup = new PortalSetupApi(apiContext);
    const portalData = await portalSetup.setupPortal();
    roomsApi = new RoomsApi(apiContext, portalData.tenant.domain, () =>
      portalSetup.getAuthHeaders(),
    );
  });

  test.afterAll(async () => {
    await portalSetup.deletePortal();
    await apiContext.dispose();
  });

  test("Create form-filling room", async () => {
    const roomTitle = "Test Room - Form Filling";
    const { room, statusCode } = await roomsApi.createRoom(
      roomTitle,
      "form_filling",
    );
    expect(statusCode).toBe(200);
    expect(room.title).toBe(roomTitle);
  });

  test("Create collaboration room", async () => {
    const roomTitle = "Test Room - Collaboration";
    const { room, statusCode } = await roomsApi.createRoom(
      roomTitle,
      "collaboration",
    );
    expect(statusCode).toBe(200);
    expect(room.title).toBe(roomTitle);
  });

  test("Create custom room", async () => {
    const roomTitle = "Test Room - Custom";
    const { room, statusCode } = await roomsApi.createRoom(roomTitle, "custom");
    expect(statusCode).toBe(200);
    expect(room.title).toBe(roomTitle);
  });

  test("Create public room", async () => {
    const roomTitle = "Test Room - Public";
    const { room, statusCode } = await roomsApi.createRoom(roomTitle, "public");
    expect(statusCode).toBe(200);
    expect(room.title).toBe(roomTitle);
  });

  test("Create virtual data room", async () => {
    const roomTitle = "Test Room - Virtual Data";
    const { room, statusCode } = await roomsApi.createRoom(
      roomTitle,
      "virtual_data",
    );
    expect(statusCode).toBe(200);
    expect(room.title).toBe(roomTitle);
  });
});
