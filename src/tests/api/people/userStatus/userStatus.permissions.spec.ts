// Tests that check user access rights.

import { expect } from "@playwright/test";
import { test } from "@/src/fixtures/index";
import { UserStatus } from "@/src/services/people/userStatus.services";

test.describe("API user status methods", () => {
  // 79900 - FIX
  test("PUT /people/status/:status - DocSpace admin deactivates the DocSpace admin", async ({
    apiSdk,
    api,
  }) => {
    const docspaceAdmin = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const docspaceAdminBody = await docspaceAdmin.response.json();
    const docspaceAdminId = docspaceAdminBody.response.id;

    const userData = {
      userIds: [docspaceAdminId],
      resendAll: false,
    };

    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    const response = await apiSdk.userStatus.changeUserStatus(
      "docSpaceAdmin",
      UserStatus.Disabled,
      userData,
    );

    const bodyResponse = await response.json();
    expect(bodyResponse.statusCode).toBe(403);
    expect(bodyResponse.error.message).toContain("Access denied");
  });

  // 79900 - FIX
  test("PUT /people/status/:status - DocSpace admin deactivates Owner", async ({
    apiSdk,
    api,
  }) => {
    const owner = await apiSdk.profiles.returnHimselfInformation("owner");
    const ownerBody = await owner.json();
    const ownerId = ownerBody.response.id;
    console.log(ownerId);

    const userData = {
      userIds: [ownerId],
      resendAll: false,
    };

    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    const response = await apiSdk.userStatus.changeUserStatus(
      "docSpaceAdmin",
      UserStatus.Disabled,
      userData,
    );

    const bodyResponse = await response.json();
    expect(bodyResponse.statusCode).toBe(403);
    expect(bodyResponse.error.message).toContain("Access denied");
  });

  test("PUT /people/status/:status - Room admin deactivates the different type of users", async ({
    apiSdk,
    api,
  }) => {
    const user = await apiSdk.profiles.addMember("owner", "User");
    const body = await user.response.json();
    const userId = body.response.id;

    const docSpaceAdmin = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const docSpaceAdminBody = await docSpaceAdmin.response.json();
    const docSpaceAdminId = docSpaceAdminBody.response.id;

    const userData = {
      userIds: [userId, docSpaceAdminId],
      resendAll: false,
    };

    await apiSdk.profiles.addMember("owner", "RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    const response = await apiSdk.userStatus.changeUserStatus(
      "roomAdmin",
      UserStatus.Disabled,
      userData,
    );

    const bodyResponse = await response.json();
    expect(bodyResponse.statusCode).toBe(403);
    expect(bodyResponse.error.message).toBe("Access denied");
  });

  test("PUT /people/status/:status - Room admin activates the different type of users", async ({
    apiSdk,
    api,
  }) => {
    const user = await apiSdk.profiles.addMember("owner", "User");
    const body = await user.response.json();
    const userId = body.response.id;

    const docSpaceAdmin = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const docSpaceAdminBody = await docSpaceAdmin.response.json();
    const docSpaceAdminId = docSpaceAdminBody.response.id;

    const userData = {
      userIds: [userId, docSpaceAdminId],
      resendAll: false,
    };

    await apiSdk.userStatus.changeUserStatus(
      "owner",
      UserStatus.Disabled,
      userData,
    );
    await apiSdk.profiles.addMember("owner", "RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    const response = await apiSdk.userStatus.changeUserStatus(
      "roomAdmin",
      UserStatus.Active,
      userData,
    );
    const bodyResponse = await response.json();
    expect(bodyResponse.statusCode).toBe(403);
    expect(bodyResponse.error.message).toBe("Access denied");
  });

  test("PUT /people/status/:status - Room admin deactivates Room Admin", async ({
    apiSdk,
    api,
  }) => {
    const roomAdmin = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminBody = await roomAdmin.response.json();
    const roomAdminId = roomAdminBody.response.id;

    const userData = {
      userIds: [roomAdminId],
      resendAll: false,
    };

    await apiSdk.profiles.addMember("owner", "RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    const response = await apiSdk.userStatus.changeUserStatus(
      "roomAdmin",
      UserStatus.Disabled,
      userData,
    );

    const bodyResponse = await response.json();
    expect(bodyResponse.statusCode).toBe(403);
    expect(bodyResponse.error.message).toBe("Access denied");
  });

  test("PUT /people/status/:status - Room admin deactivates DocSpace Admin", async ({
    apiSdk,
    api,
  }) => {
    const docSpaceAdmin = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const docSpaceAdminBody = await docSpaceAdmin.response.json();
    const docSpaceAdminId = docSpaceAdminBody.response.id;

    const userData = {
      userIds: [docSpaceAdminId],
      resendAll: false,
    };

    await apiSdk.profiles.addMember("owner", "RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    const response = await apiSdk.userStatus.changeUserStatus(
      "roomAdmin",
      UserStatus.Disabled,
      userData,
    );

    const bodyResponse = await response.json();
    expect(bodyResponse.statusCode).toBe(403);
    expect(bodyResponse.error.message).toBe("Access denied");
  });

  test("PUT /people/status/:status - Room admin deactivates Owner", async ({
    apiSdk,
    api,
  }) => {
    const owner = await apiSdk.profiles.returnHimselfInformation("owner");
    const ownerBody = await owner.json();
    const ownerId = ownerBody.response.id;

    const userData = {
      userIds: [ownerId],
      resendAll: false,
    };

    await apiSdk.profiles.addMember("owner", "RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    const response = await apiSdk.userStatus.changeUserStatus(
      "roomAdmin",
      UserStatus.Disabled,
      userData,
    );

    const bodyResponse = await response.json();
    expect(bodyResponse.statusCode).toBe(403);
    expect(bodyResponse.error.message).toContain("Access denied");
  });

  test("PUT /people/status/:status - User deactivates Owner", async ({
    apiSdk,
    api,
  }) => {
    const owner = await apiSdk.profiles.returnHimselfInformation("owner");
    const ownerBody = await owner.json();
    const ownerId = ownerBody.response.id;

    const userData = {
      userIds: [ownerId],
      resendAll: false,
    };

    await apiSdk.profiles.addMember("owner", "User");
    await api.auth.authenticateUser();

    const response = await apiSdk.userStatus.changeUserStatus(
      "user",
      UserStatus.Disabled,
      userData,
    );

    const bodyResponse = await response.json();
    expect(bodyResponse.statusCode).toBe(403);
    expect(bodyResponse.error.message).toContain("Access denied");
  });

  test("PUT /people/status/:status - User deactivates DocSpace Admin", async ({
    apiSdk,
    api,
  }) => {
    const docSpaceAdmin = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const docSpaceAdminBody = await docSpaceAdmin.response.json();
    const docSpaceAdminId = docSpaceAdminBody.response.id;

    const userData = {
      userIds: [docSpaceAdminId],
      resendAll: false,
    };

    await apiSdk.profiles.addMember("owner", "User");
    await api.auth.authenticateUser();

    const response = await apiSdk.userStatus.changeUserStatus(
      "user",
      UserStatus.Disabled,
      userData,
    );

    const bodyResponse = await response.json();
    expect(bodyResponse.statusCode).toBe(403);
    expect(bodyResponse.error.message).toBe("Access denied");
  });

  test("PUT /people/status/:status - User deactivates Room admin", async ({
    apiSdk,
    api,
  }) => {
    const roomAdmin = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminBody = await roomAdmin.response.json();
    const roomAdminId = roomAdminBody.response.id;

    const userData = {
      userIds: [roomAdminId],
      resendAll: false,
    };

    await apiSdk.profiles.addMember("owner", "User");
    await api.auth.authenticateUser();

    const response = await apiSdk.userStatus.changeUserStatus(
      "user",
      UserStatus.Disabled,
      userData,
    );

    const bodyResponse = await response.json();
    expect(bodyResponse.statusCode).toBe(403);
    expect(bodyResponse.error.message).toBe("Access denied");
  });

  test("PUT /people/status/:status - User deactivates User", async ({
    apiSdk,
    api,
  }) => {
    const user = await apiSdk.profiles.addMember("owner", "User");
    const userBody = await user.response.json();
    const userId = userBody.response.id;

    const userData = {
      userIds: [userId],
      resendAll: false,
    };

    await apiSdk.profiles.addMember("owner", "User");
    await api.auth.authenticateUser();

    const response = await apiSdk.userStatus.changeUserStatus(
      "user",
      UserStatus.Disabled,
      userData,
    );

    const bodyResponse = await response.json();
    expect(bodyResponse.statusCode).toBe(403);
    expect(bodyResponse.error.message).toBe("Access denied");
  });

  test("PUT /people/status/:status - User activates the different type of users", async ({
    apiSdk,
    api,
  }) => {
    const roomAdmin = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminBody = await roomAdmin.response.json();
    const roomAdminId = roomAdminBody.response.id;

    const docSpaceAdmin = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const docSpaceAdminBody = await docSpaceAdmin.response.json();
    const docSpaceAdminId = docSpaceAdminBody.response.id;

    const userData = {
      userIds: [roomAdminId, docSpaceAdminId],
      resendAll: false,
    };

    await apiSdk.userStatus.changeUserStatus(
      "owner",
      UserStatus.Disabled,
      userData,
    );
    await apiSdk.profiles.addMember("owner", "User");
    await api.auth.authenticateUser();

    const response = await apiSdk.userStatus.changeUserStatus(
      "user",
      UserStatus.Active,
      userData,
    );
    const bodyResponse = await response.json();
    expect(bodyResponse.statusCode).toBe(403);
    expect(bodyResponse.error.message).toBe("Access denied");
  });
});
