// Tests that check user access rights.

import { expect } from "@playwright/test";
import { test } from "@/src/fixtures/index";
import { UserStatus } from "@/src/services/people/userStatus.services";

test.describe("API user status methods", () => {
  test("PUT /people/status/:status - Owner deactivates the user without authorization", async ({
    apiSdk,
  }) => {
    const user = await apiSdk.profiles.addMember("owner", "User");
    const body = await user.response.json();
    const userId = body.response.id;

    const userData = {
      userIds: [userId],
      resendAll: false,
    };

    const response =
      await apiSdk.userStatus.changeUserStatusWithoutAuthorization(
        UserStatus.Disabled,
        userData,
      );
    expect(response.status()).toBe(401);
  });

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
    const guest = await apiSdk.profiles.addMember("owner", "Guest");
    const guestBody = await guest.response.json();
    const guestId = guestBody.response.id;

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
      userIds: [guestId, userId, docSpaceAdminId],
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
    const guest = await apiSdk.profiles.addMember("owner", "Guest");
    const guestBody = await guest.response.json();
    const guestId = guestBody.response.id;

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
      userIds: [guestId, userId, docSpaceAdminId],
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

  test("PUT /people/status/:status - Guest deactivates Owner", async ({
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

    await apiSdk.profiles.addMember("owner", "Guest");
    await api.auth.authenticateGuest();

    const response = await apiSdk.userStatus.changeUserStatus(
      "guest",
      UserStatus.Disabled,
      userData,
    );

    const bodyResponse = await response.json();
    expect(bodyResponse.statusCode).toBe(403);
    expect(bodyResponse.error.message).toContain("Access denied");
  });

  test("PUT /people/status/:status - Guest deactivates DocSpace Admin", async ({
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

    await apiSdk.profiles.addMember("owner", "Guest");
    await api.auth.authenticateGuest();

    const response = await apiSdk.userStatus.changeUserStatus(
      "guest",
      UserStatus.Disabled,
      userData,
    );

    const bodyResponse = await response.json();
    expect(bodyResponse.statusCode).toBe(403);
    expect(bodyResponse.error.message).toBe("Access denied");
  });

  test("PUT /people/status/:status - Guest deactivates Room Admin", async ({
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

    await apiSdk.profiles.addMember("owner", "Guest");
    await api.auth.authenticateGuest();

    const response = await apiSdk.userStatus.changeUserStatus(
      "guest",
      UserStatus.Disabled,
      userData,
    );

    const bodyResponse = await response.json();
    expect(bodyResponse.statusCode).toBe(403);
    expect(bodyResponse.error.message).toBe("Access denied");
  });

  test("PUT /people/status/:status - Guest deactivates user", async ({
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

    await apiSdk.profiles.addMember("owner", "Guest");
    await api.auth.authenticateGuest();

    const response = await apiSdk.userStatus.changeUserStatus(
      "guest",
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
    const guest = await apiSdk.profiles.addMember("owner", "Guest");
    const guestBody = await guest.response.json();
    const guestId = guestBody.response.id;

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
      userIds: [guestId, roomAdminId, docSpaceAdminId],
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

  test("GET /people/status/:status - User returns a list of profiles filtered by the active user status", async ({
    apiSdk,
    api,
  }) => {
    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await apiSdk.profiles.addMember("owner", "RoomAdmin");
    await apiSdk.profiles.addMember("owner", "User");
    await apiSdk.profiles.addMember("owner", "Guest");

    await api.auth.authenticateUser();
    const response = await apiSdk.userStatus.getPlofilesByStatus(
      "user",
      UserStatus.Active,
    );
    const responseData = await response.json();
    expect(responseData.statusCode).toBe(403);
    expect(responseData.error.message).toBe("Access denied");
  });

  test("GET /people/status/:status - User returns a list of profiles filtered by the disabled user status", async ({
    apiSdk,
    api,
  }) => {
    const docSpaceAdmin = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const docSpaceAdminJson = await docSpaceAdmin.response.json();
    const docSpaceAdminId = docSpaceAdminJson.response.id;

    const roomAdmin = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminJson = await roomAdmin.response.json();
    const roomAdminId = roomAdminJson.response.id;

    const user = await apiSdk.profiles.addMember("owner", "User");
    const userJson = await user.response.json();
    const userId = userJson.response.id;

    const guest = await apiSdk.profiles.addMember("owner", "Guest");
    const guestJson = await guest.response.json();
    const guestId = guestJson.response.id;

    const data = {
      userIds: [docSpaceAdminId, roomAdminId, userId, guestId],
      resendAll: false,
    };

    await apiSdk.userStatus.changeUserStatus(
      "owner",
      UserStatus.Disabled,
      data,
    );

    await apiSdk.profiles.addMember("owner", "User");
    await api.auth.authenticateUser();
    const response = await apiSdk.userStatus.getPlofilesByStatus(
      "user",
      UserStatus.Disabled,
    );
    const responseData = await response.json();
    expect(responseData.statusCode).toBe(403);
    expect(responseData.error.message).toBe("Access denied");
  });

  test("PUT /people/status/:status - Guest activates the different type of users", async ({
    apiSdk,
    api,
  }) => {
    const user = await apiSdk.profiles.addMember("owner", "User");
    const userBody = await user.response.json();
    const userId = userBody.response.id;

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
      userIds: [userId, roomAdminId, docSpaceAdminId],
      resendAll: false,
    };

    await apiSdk.userStatus.changeUserStatus(
      "owner",
      UserStatus.Disabled,
      userData,
    );
    await apiSdk.profiles.addMember("owner", "Guest");
    await api.auth.authenticateGuest();

    const response = await apiSdk.userStatus.changeUserStatus(
      "guest",
      UserStatus.Active,
      userData,
    );
    const bodyResponse = await response.json();
    expect(bodyResponse.statusCode).toBe(403);
    expect(bodyResponse.error.message).toBe("Access denied");
  });

  test("GET /people/status/:status - Guest returns a list of profiles filtered by the disabled user status", async ({
    apiSdk,
    api,
  }) => {
    const docSpaceAdmin = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const docSpaceAdminJson = await docSpaceAdmin.response.json();
    const docSpaceAdminId = docSpaceAdminJson.response.id;

    const roomAdmin = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminJson = await roomAdmin.response.json();
    const roomAdminId = roomAdminJson.response.id;

    const user = await apiSdk.profiles.addMember("owner", "User");
    const userJson = await user.response.json();
    const userId = userJson.response.id;

    const guest = await apiSdk.profiles.addMember("owner", "Guest");
    const guestJson = await guest.response.json();
    const guestId = guestJson.response.id;

    const data = {
      userIds: [docSpaceAdminId, roomAdminId, userId, guestId],
      resendAll: false,
    };

    await apiSdk.userStatus.changeUserStatus(
      "owner",
      UserStatus.Disabled,
      data,
    );

    await apiSdk.profiles.addMember("owner", "Guest");
    await api.auth.authenticateGuest();
    const response = await apiSdk.userStatus.getPlofilesByStatus(
      "guest",
      UserStatus.Disabled,
    );
    const responseData = await response.json();
    expect(responseData.statusCode).toBe(403);
    expect(responseData.error.message).toBe("Access denied");
  });
});
