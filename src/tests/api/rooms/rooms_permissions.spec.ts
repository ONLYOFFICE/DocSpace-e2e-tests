import { expect } from "@playwright/test";
import { test } from "@/src/fixtures/index";

test.describe("POST /files/rooms - access control", () => {
  test("Owner can create a room", async ({ apiSdk }) => {
    const response = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest Room",
      roomType: "CustomRoom",
    });

    expect(response.status()).toBe(200);
  });

  test("DocSpaceAdmin can create a room", async ({ apiSdk, api }) => {
    await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();
    apiSdk.rooms.setAuthTokenDocSpaceAdmin(api.auth.authTokenDocSpaceAdmin);

    const response = await apiSdk.rooms.createRoom("docSpaceAdmin", {
      title: "Autotest Room",
      roomType: "CustomRoom",
    });

    expect(response.status()).toBe(200);
  });

  test("User cannot create a room", async ({ apiSdk, api }) => {
    await apiSdk.profiles.ownerAddMember("User");
    await api.auth.authenticateUser();
    apiSdk.rooms.setAuthTokenUser(api.auth.authTokenUser);

    const response = await apiSdk.rooms.createRoom("user", {
      title: "Autotest Room",
      roomType: "CustomRoom",
    });

    expect(response.status()).toBe(403);
  });
});
