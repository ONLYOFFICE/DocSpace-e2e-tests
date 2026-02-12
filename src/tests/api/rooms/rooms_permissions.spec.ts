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

// TODO: Investigate expected behavior for room deletion permissions
// DELETE /files/rooms/:id works asynchronously:
// 1. Controller has NO permission checks
// 2. HTTP always returns 200 (operation queued)
// 3. Permission check happens later in FileDeleteOperation.cs
// 4. If access denied, error appears in GET /fileops result.error field
test.describe.skip("DELETE /files/rooms/:id - access control", () => {
  test("Owner can delete a room", async ({ apiSdk }) => {
    const createResponse = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest Room to Delete",
      roomType: "CustomRoom",
    });
    const roomId = (await createResponse.json()).response.id;

    const result = await apiSdk.rooms.deleteRoom("owner", roomId);

    expect(result.response.status()).toBe(200);
    expect(result.finished).toBe(true);
    expect(result.error).toBe("");
  });

  test.skip("DocSpaceAdmin can delete a room", async ({ apiSdk, api }) => {
    await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();
    apiSdk.rooms.setAuthTokenDocSpaceAdmin(api.auth.authTokenDocSpaceAdmin);

    const createResponse = await apiSdk.rooms.createRoom("docSpaceAdmin", {
      title: "Autotest Room to Delete",
      roomType: "CustomRoom",
    });
    const roomId = (await createResponse.json()).response.id;

    const result = await apiSdk.rooms.deleteRoom("docSpaceAdmin", roomId);

    expect(result.response.status()).toBe(200);
    expect(result.finished).toBe(true);
    expect(result.error).toBe("");
  });

  test.skip("User cannot delete a room", async ({ apiSdk, api }) => {
    await apiSdk.profiles.ownerAddMember("User");
    await api.auth.authenticateUser();
    apiSdk.rooms.setAuthTokenUser(api.auth.authTokenUser);

    const createResponse = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest Room to Delete",
      roomType: "CustomRoom",
    });
    const roomId = (await createResponse.json()).response.id;

    const result = await apiSdk.rooms.deleteRoom("user", roomId);
    expect(result.response.status()).toBe(200);
    expect(result.finished).toBe(true);
    expect(result.error).toContain(
      "You don't have enough permission to delete the folder",
    );
  });
});

test.describe("POST /files/tags - access control", () => {
  test("Owner can create a tag", async ({ apiSdk }) => {
    const response = await apiSdk.rooms.createTag("owner", "Autotest Tag");
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.statusCode).toBe(200);
    expect(body.response).toBe("Autotest Tag");
    expect(body.count).toBe(1);
  });

  test("DocSpaceAdmin can create a tag", async ({ apiSdk, api }) => {
    await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();
    apiSdk.rooms.setAuthTokenDocSpaceAdmin(api.auth.authTokenDocSpaceAdmin);

    const response = await apiSdk.rooms.createTag(
      "docSpaceAdmin",
      "Autotest Tag",
    );
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.statusCode).toBe(200);
    expect(body.response).toBe("Autotest Tag");
    expect(body.count).toBe(1);
  });

  test("User cannot create a tag", async ({ apiSdk, api }) => {
    await apiSdk.profiles.ownerAddMember("User");
    await api.auth.authenticateUser();
    apiSdk.rooms.setAuthTokenUser(api.auth.authTokenUser);

    const response = await apiSdk.rooms.createTag("user", "Autotest Tag");
    const body = await response.json();

    expect(body.statusCode).toBe(403);
    expect(body.error.message).toContain("Access denied");
  });
});
