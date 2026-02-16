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
    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    const response = await apiSdk.rooms.createRoom("docSpaceAdmin", {
      title: "Autotest Room",
      roomType: "CustomRoom",
    });

    expect(response.status()).toBe(200);
  });

  test("User cannot create a room", async ({ apiSdk, api }) => {
    await apiSdk.profiles.addMember("owner", "User");
    await api.auth.authenticateUser();

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
    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

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
    await apiSdk.profiles.addMember("owner", "User");
    await api.auth.authenticateUser();

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
    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

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
    await apiSdk.profiles.addMember("owner", "User");
    await api.auth.authenticateUser();

    const response = await apiSdk.rooms.createTag("user", "Autotest Tag");
    const body = await response.json();

    expect(body.statusCode).toBe(403);
    expect(body.error.message).toContain("Access denied");
  });
});

test.describe("PUT /files/rooms/:id/share - access control", () => {
  test("Owner can set room access rights", async ({ apiSdk }) => {
    const { response: memberResponse } = await apiSdk.profiles.addMember(
      "owner",
      "User",
    );
    const memberBody = await memberResponse.json();
    const userId = memberBody.response.id;

    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest Share Room",
      roomType: "CustomRoom",
    });
    const roomId = (await roomResponse.json()).response.id;

    const response = await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
      invitations: [{ id: userId, access: "Editing" }],
      notify: false,
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.statusCode).toBe(200);
    expect(body.response.members).toBeDefined();
    expect(body.response.members.length).toBeGreaterThan(0);
  });

  test("DocSpaceAdmin can set access rights on own room", async ({
    apiSdk,
    api,
  }) => {
    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    const { response: memberResponse } = await apiSdk.profiles.addMember(
      "owner",
      "User",
    );
    const memberBody = await memberResponse.json();
    const userId = memberBody.response.id;

    const roomResponse = await apiSdk.rooms.createRoom("docSpaceAdmin", {
      title: "Autotest Share Room",
      roomType: "CustomRoom",
    });
    const roomId = (await roomResponse.json()).response.id;

    const response = await apiSdk.rooms.setRoomAccessRights(
      "docSpaceAdmin",
      roomId,
      {
        invitations: [{ id: userId, access: "Editing" }],
        notify: false,
      },
    );
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.statusCode).toBe(200);
    expect(body.response.members).toBeDefined();
  });

  test("DocSpaceAdmin cannot set access rights on other's room", async ({
    apiSdk,
    api,
  }) => {
    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    const { response: memberResponse } = await apiSdk.profiles.addMember(
      "owner",
      "User",
    );
    const memberBody = await memberResponse.json();
    const userId = memberBody.response.id;

    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest Share Room",
      roomType: "CustomRoom",
    });
    const roomId = (await roomResponse.json()).response.id;

    const response = await apiSdk.rooms.setRoomAccessRights(
      "docSpaceAdmin",
      roomId,
      {
        invitations: [{ id: userId, access: "Editing" }],
        notify: false,
      },
    );
    const body = await response.json();

    expect(body.statusCode).toBe(403);
  });

  test("User cannot set room access rights", async ({ apiSdk, api }) => {
    const { response: memberResponse } = await apiSdk.profiles.addMember(
      "owner",
      "User",
    );
    const memberBody = await memberResponse.json();
    const userId = memberBody.response.id;
    await api.auth.authenticateUser();

    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest Share Room",
      roomType: "CustomRoom",
    });
    const roomId = (await roomResponse.json()).response.id;

    const response = await apiSdk.rooms.setRoomAccessRights("user", roomId, {
      invitations: [{ id: userId, access: "Editing" }],
      notify: false,
    });
    const body = await response.json();

    expect(body.statusCode).toBe(403);
  });
});
