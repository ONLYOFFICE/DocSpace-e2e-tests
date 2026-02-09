import { expect } from "@playwright/test";
import { test } from "@/src/fixtures/index";
import { UserStatus } from "@/src/services/people/userStatus.services";

test.describe("API user status methods", () => {
  test("Owner deactivates the different type of user", async ({ apiSdk }) => {
    const user = await apiSdk.profiles.ownerAddMember("User");
    const body = await user.response.json();
    const userId = body.response.id;

    const roomAdmin = await apiSdk.profiles.ownerAddMember("RoomAdmin");
    const roomAdminBody = await roomAdmin.response.json();
    const roomAdminId = roomAdminBody.response.id;

    const docSpaceAdmin = await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    const docSpaceAdminBody = await docSpaceAdmin.response.json();
    const docSpaceAdminId = docSpaceAdminBody.response.id;

    const userData = {
      userIds: [userId, roomAdminId, docSpaceAdminId],
      resendAll: false,
    };

    const response = await apiSdk.userStatus.ownerChangeUserStatus(
      UserStatus.Disabled,
      userData,
    );
    const bodyResponse = await response.json();
    const userInfo = bodyResponse.response[0];
    expect(bodyResponse.statusCode).toBe(200);
    expect(userInfo.isCollaborator).toBe(true);
    expect(userInfo.status).toBe(2);
    expect(userInfo.id).toBe(userId);

    const roomAdminInfo = bodyResponse.response[1];
    expect(roomAdminInfo.id).toBe(roomAdminId);
    expect(roomAdminInfo.status).toBe(2);
    expect(roomAdminInfo.isRoomAdmin).toBe(true);

    const docSpaceAdminInfo = bodyResponse.response[2];
    expect(docSpaceAdminInfo.id).toBe(docSpaceAdminId);
    expect(docSpaceAdminInfo.status).toBe(2);
    expect(docSpaceAdminInfo.isAdmin).toBe(true);
  });

  test("Owner activates the user", async ({ apiSdk }) => {
    const user = await apiSdk.profiles.ownerAddMember("User");
    const body = await user.response.json();
    const userId = body.response.id;

    const roomAdmin = await apiSdk.profiles.ownerAddMember("RoomAdmin");
    const roomAdminBody = await roomAdmin.response.json();
    const roomAdminId = roomAdminBody.response.id;

    const docSpaceAdmin = await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    const docSpaceAdminBody = await docSpaceAdmin.response.json();
    const docSpaceAdminId = docSpaceAdminBody.response.id;

    const userData = {
      userIds: [userId, roomAdminId, docSpaceAdminId],
      resendAll: false,
    };
    await apiSdk.userStatus.ownerChangeUserStatus(
      UserStatus.Disabled,
      userData,
    );
    const activateResponse = await apiSdk.userStatus.ownerChangeUserStatus(
      UserStatus.Active,
      userData,
    );
    const bodyResponse = await activateResponse.json();
    const userInfo = bodyResponse.response[0];
    expect(bodyResponse.statusCode).toBe(200);
    expect(userInfo.isCollaborator).toBe(true);
    expect(userInfo.status).toBe(1);
    expect(userInfo.id).toBe(userId);

    const roomAdminInfo = bodyResponse.response[1];
    expect(roomAdminInfo.id).toBe(roomAdminId);
    expect(roomAdminInfo.status).toBe(1);
    expect(roomAdminInfo.isRoomAdmin).toBe(true);

    const docSpaceAdminInfo = bodyResponse.response[2];
    expect(docSpaceAdminInfo.id).toBe(docSpaceAdminId);
    expect(docSpaceAdminInfo.status).toBe(1);
    expect(docSpaceAdminInfo.isAdmin).toBe(true);
  });

  test("Owner deactivates the user without authorization", async ({
    apiSdk,
  }) => {
    const user = await apiSdk.profiles.ownerAddMember("User");
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

  // 79900 - NEW
  test.skip("DocSpace admin deactivates the DocSpace admin", async ({
    apiSdk,
    api,
  }) => {
    const docspaceAdmin = await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    const docspaceAdminBody = await docspaceAdmin.response.json();
    const docspaceAdminId = docspaceAdminBody.response.id;

    const userData = {
      userIds: [docspaceAdminId],
      resendAll: false,
    };

    await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    const response = await apiSdk.userStatus.docSpaceAdminChangeUserStatus(
      UserStatus.Disabled,
      userData,
    );

    const bodyResponse = await response.json();
    console.log(bodyResponse);
    expect(bodyResponse.statusCode).toBe(403);
    expect(bodyResponse.message.error).toContain("Access denied");
  });

  test("DocSpace admin deactivates the different type of user", async ({
    apiSdk,
    api,
  }) => {
    const user = await apiSdk.profiles.ownerAddMember("User");
    const body = await user.response.json();
    const userId = body.response.id;

    const roomAdmin = await apiSdk.profiles.ownerAddMember("RoomAdmin");
    const roomAdminBody = await roomAdmin.response.json();
    const roomAdminId = roomAdminBody.response.id;

    const userData = {
      userIds: [userId, roomAdminId],
      resendAll: false,
    };

    await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    const response = await apiSdk.userStatus.docSpaceAdminChangeUserStatus(
      UserStatus.Disabled,
      userData,
    );

    const bodyResponse = await response.json();
    expect(bodyResponse.statusCode).toBe(200);
    expect(bodyResponse.response[0].isCollaborator).toBe(true);
    expect(bodyResponse.response[0].status).toBe(2);
    expect(bodyResponse.response[0].id).toBe(userId);
    expect(bodyResponse.response[1].isRoomAdmin).toBe(true);
    expect(bodyResponse.response[1].status).toBe(2);
    expect(bodyResponse.response[1].id).toBe(roomAdminId);
  });

  test("DocSpace admin activates the different type of user", async ({
    apiSdk,
    api,
  }) => {
    const user = await apiSdk.profiles.ownerAddMember("User");
    const body = await user.response.json();
    const userId = body.response.id;

    const roomAdmin = await apiSdk.profiles.ownerAddMember("RoomAdmin");
    const roomAdminBody = await roomAdmin.response.json();
    const roomAdminId = roomAdminBody.response.id;

    const userData = {
      userIds: [userId, roomAdminId],
      resendAll: false,
    };

    await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();
    await apiSdk.userStatus.docSpaceAdminChangeUserStatus(
      UserStatus.Disabled,
      userData,
    );

    const response = await apiSdk.userStatus.docSpaceAdminChangeUserStatus(
      UserStatus.Active,
      userData,
    );

    const bodyResponse = await response.json();
    expect(bodyResponse.statusCode).toBe(200);
    expect(bodyResponse.response[0].isCollaborator).toBe(true);
    expect(bodyResponse.response[0].status).toBe(1);
    expect(bodyResponse.response[0].id).toBe(userId);
    expect(bodyResponse.response[1].isRoomAdmin).toBe(true);
    expect(bodyResponse.response[1].status).toBe(1);
    expect(bodyResponse.response[1].id).toBe(roomAdminId);
  });

  // 79900 - NEW
  test.skip("DocSpace admin deactivates Owner", async ({ apiSdk, api }) => {
    const owner = await apiSdk.profiles.ownerReturnHimselfInformation();
    const ownerBody = await owner.json();
    const ownerId = ownerBody.response.id;
    console.log(ownerId);

    const userData = {
      userIds: [ownerId],
      resendAll: false,
    };

    await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    const response = await apiSdk.userStatus.docSpaceAdminChangeUserStatus(
      UserStatus.Disabled,
      userData,
    );

    const bodyResponse = await response.json();
    console.log(bodyResponse);
    expect(bodyResponse.statusCode).toBe(403);
    expect(bodyResponse.error.message).toContain("Access denied");
  });

  test("Room admin deactivates user", async ({ apiSdk, api }) => {
    const user = await apiSdk.profiles.ownerAddMember("User");
    const body = await user.response.json();
    const userId = body.response.id;

    const userData = {
      userIds: [userId],
      resendAll: false,
    };

    await apiSdk.profiles.ownerAddMember("RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    const response = await apiSdk.userStatus.roomAdminChangeUserStatus(
      UserStatus.Disabled,
      userData,
    );

    const bodyResponse = await response.json();
    expect(bodyResponse.statusCode).toBe(403);
    expect(bodyResponse.error.message).toBe("Access denied");
  });

  test("Room admin deactivates Room Admin", async ({ apiSdk, api }) => {
    const roomAdmin = await apiSdk.profiles.ownerAddMember("RoomAdmin");
    const roomAdminBody = await roomAdmin.response.json();
    const roomAdminId = roomAdminBody.response.id;

    const userData = {
      userIds: [roomAdminId],
      resendAll: false,
    };

    await apiSdk.profiles.ownerAddMember("RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    const response = await apiSdk.userStatus.roomAdminChangeUserStatus(
      UserStatus.Disabled,
      userData,
    );

    const bodyResponse = await response.json();
    expect(bodyResponse.statusCode).toBe(403);
    expect(bodyResponse.error.message).toBe("Access denied");
  });

  test("Room admin deactivates DocSpace Admin", async ({ apiSdk, api }) => {
    const docSpaceAdmin = await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    const docSpaceAdminBody = await docSpaceAdmin.response.json();
    const docSpaceAdminId = docSpaceAdminBody.response.id;

    const userData = {
      userIds: [docSpaceAdminId],
      resendAll: false,
    };

    await apiSdk.profiles.ownerAddMember("RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    const response = await apiSdk.userStatus.roomAdminChangeUserStatus(
      UserStatus.Disabled,
      userData,
    );

    const bodyResponse = await response.json();
    expect(bodyResponse.statusCode).toBe(403);
    expect(bodyResponse.error.message).toBe("Access denied");
  });

  test("Room admin deactivates Owner", async ({ apiSdk, api }) => {
    const owner = await apiSdk.profiles.ownerReturnHimselfInformation();
    const ownerBody = await owner.json();
    const ownerId = ownerBody.response.id;

    const userData = {
      userIds: [ownerId],
      resendAll: false,
    };

    await apiSdk.profiles.ownerAddMember("RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    const response = await apiSdk.userStatus.roomAdminChangeUserStatus(
      UserStatus.Disabled,
      userData,
    );

    const bodyResponse = await response.json();
    expect(bodyResponse.statusCode).toBe(403);
    expect(bodyResponse.error.message).toContain("Access denied");
  });

  test("User deactivates Owner", async ({ apiSdk, api }) => {
    const owner = await apiSdk.profiles.ownerReturnHimselfInformation();
    const ownerBody = await owner.json();
    const ownerId = ownerBody.response.id;

    const userData = {
      userIds: [ownerId],
      resendAll: false,
    };

    await apiSdk.profiles.ownerAddMember("User");
    await api.auth.authenticateUser();

    const response = await apiSdk.userStatus.userChangeUserStatus(
      UserStatus.Disabled,
      userData,
    );

    const bodyResponse = await response.json();
    expect(bodyResponse.statusCode).toBe(403);
    expect(bodyResponse.error.message).toContain("Access denied");
  });

  test("User deactivates DocSpace Admin", async ({ apiSdk, api }) => {
    const docSpaceAdmin = await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    const docSpaceAdminBody = await docSpaceAdmin.response.json();
    const docSpaceAdminId = docSpaceAdminBody.response.id;

    const userData = {
      userIds: [docSpaceAdminId],
      resendAll: false,
    };

    await apiSdk.profiles.ownerAddMember("User");
    await api.auth.authenticateUser();

    const response = await apiSdk.userStatus.userChangeUserStatus(
      UserStatus.Disabled,
      userData,
    );

    const bodyResponse = await response.json();
    expect(bodyResponse.statusCode).toBe(403);
    expect(bodyResponse.error.message).toBe("Access denied");
  });

  test("User deactivates Room admin", async ({ apiSdk, api }) => {
    const roomAdmin = await apiSdk.profiles.ownerAddMember("RoomAdmin");
    const roomAdminBody = await roomAdmin.response.json();
    const roomAdminId = roomAdminBody.response.id;

    const userData = {
      userIds: [roomAdminId],
      resendAll: false,
    };

    await apiSdk.profiles.ownerAddMember("User");
    await api.auth.authenticateUser();

    const response = await apiSdk.userStatus.userChangeUserStatus(
      UserStatus.Disabled,
      userData,
    );

    const bodyResponse = await response.json();
    expect(bodyResponse.statusCode).toBe(403);
    expect(bodyResponse.error.message).toBe("Access denied");
  });

  test("User deactivates User", async ({ apiSdk, api }) => {
    const user = await apiSdk.profiles.ownerAddMember("User");
    const userBody = await user.response.json();
    const userId = userBody.response.id;

    const userData = {
      userIds: [userId],
      resendAll: false,
    };

    await apiSdk.profiles.ownerAddMember("User");
    await api.auth.authenticateUser();

    const response = await apiSdk.userStatus.userChangeUserStatus(
      UserStatus.Disabled,
      userData,
    );

    const bodyResponse = await response.json();
    expect(bodyResponse.statusCode).toBe(403);
    expect(bodyResponse.error.message).toBe("Access denied");
  });
});

//TODO: Write tests from different users to activate disabled users
