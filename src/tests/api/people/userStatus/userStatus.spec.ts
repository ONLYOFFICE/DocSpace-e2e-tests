import { expect } from "@playwright/test";
import { test } from "@/src/fixtures/index";
import { UserStatus } from "@/src/services/people/userStatus.services";

type UsersListItem = {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  isOwner?: boolean;
  isAdmin?: boolean;
  isRoomAdmin?: boolean;
  isCollaborator?: boolean;
  isVisitor?: boolean;
  status?: UserStatus;
};

test.describe("API user status methods", () => {
  test("PUT /people/status/:status - Owner deactivates the different type of users", async ({
    apiSdk,
  }) => {
    const guest = await apiSdk.profiles.addMember("owner", "Guest");
    const guestBody = await guest.response.json();
    const guestId = guestBody.response.id;

    const user = await apiSdk.profiles.addMember("owner", "User");
    const body = await user.response.json();
    const userId = body.response.id;

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
      userIds: [guestId, userId, roomAdminId, docSpaceAdminId],
      resendAll: false,
    };

    const response = await apiSdk.userStatus.changeUserStatus(
      "owner",
      UserStatus.Disabled,
      userData,
    );
    const bodyResponse = await response.json();
    const guestInfo = bodyResponse.response[0];
    expect(guestInfo.id).toBe(guestId);
    expect(guestInfo.status).toBe(2);
    expect(guestInfo.isVisitor).toBe(true);

    const userInfo = bodyResponse.response[1];
    expect(bodyResponse.statusCode).toBe(200);
    expect(userInfo.isCollaborator).toBe(true);
    expect(userInfo.status).toBe(2);
    expect(userInfo.id).toBe(userId);

    const roomAdminInfo = bodyResponse.response[2];
    expect(roomAdminInfo.id).toBe(roomAdminId);
    expect(roomAdminInfo.status).toBe(2);
    expect(roomAdminInfo.isRoomAdmin).toBe(true);

    const docSpaceAdminInfo = bodyResponse.response[3];
    expect(docSpaceAdminInfo.id).toBe(docSpaceAdminId);
    expect(docSpaceAdminInfo.status).toBe(2);
    expect(docSpaceAdminInfo.isAdmin).toBe(true);
  });

  test("PUT /people/status/:status - Owner activates the different type of users", async ({
    apiSdk,
  }) => {
    const guest = await apiSdk.profiles.addMember("owner", "Guest");
    const guestBody = await guest.response.json();
    const guestId = guestBody.response.id;

    const user = await apiSdk.profiles.addMember("owner", "User");
    const body = await user.response.json();
    const userId = body.response.id;

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
      userIds: [guestId, userId, roomAdminId, docSpaceAdminId],
      resendAll: false,
    };
    await apiSdk.userStatus.changeUserStatus(
      "owner",
      UserStatus.Disabled,
      userData,
    );
    const activateResponse = await apiSdk.userStatus.changeUserStatus(
      "owner",
      UserStatus.Active,
      userData,
    );
    const bodyResponse = await activateResponse.json();
    const guestInfo = bodyResponse.response[0];
    expect(guestInfo.id).toBe(guestId);
    expect(guestInfo.status).toBe(1);
    expect(guestInfo.isVisitor).toBe(true);

    const userInfo = bodyResponse.response[1];
    expect(bodyResponse.statusCode).toBe(200);
    expect(userInfo.isCollaborator).toBe(true);
    expect(userInfo.status).toBe(1);
    expect(userInfo.id).toBe(userId);

    const roomAdminInfo = bodyResponse.response[2];
    expect(roomAdminInfo.id).toBe(roomAdminId);
    expect(roomAdminInfo.status).toBe(1);
    expect(roomAdminInfo.isRoomAdmin).toBe(true);

    const docSpaceAdminInfo = bodyResponse.response[3];
    expect(docSpaceAdminInfo.id).toBe(docSpaceAdminId);
    expect(docSpaceAdminInfo.status).toBe(1);
    expect(docSpaceAdminInfo.isAdmin).toBe(true);
  });

  test("PUT /people/status/:status - DocSpace admin deactivates the different type of user", async ({
    apiSdk,
    api,
  }) => {
    const guest = await apiSdk.profiles.addMember("owner", "Guest");
    const guestBody = await guest.response.json();
    const guestId = guestBody.response.id;

    const user = await apiSdk.profiles.addMember("owner", "User");
    const body = await user.response.json();
    const userId = body.response.id;

    const roomAdmin = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminBody = await roomAdmin.response.json();
    const roomAdminId = roomAdminBody.response.id;

    const userData = {
      userIds: [guestId, userId, roomAdminId],
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
    expect(bodyResponse.statusCode).toBe(200);
    expect(bodyResponse.response[0].isVisitor).toBe(true);
    expect(bodyResponse.response[0].status).toBe(2);
    expect(bodyResponse.response[0].id).toBe(guestId);
    expect(bodyResponse.response[1].isCollaborator).toBe(true);
    expect(bodyResponse.response[1].status).toBe(2);
    expect(bodyResponse.response[1].id).toBe(userId);
    expect(bodyResponse.response[2].isRoomAdmin).toBe(true);
    expect(bodyResponse.response[2].status).toBe(2);
    expect(bodyResponse.response[2].id).toBe(roomAdminId);
  });

  test("PUT /people/status/:status - DocSpace admin activates the different type of user", async ({
    apiSdk,
    api,
  }) => {
    const user = await apiSdk.profiles.addMember("owner", "User");
    const body = await user.response.json();
    const userId = body.response.id;

    const roomAdmin = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminBody = await roomAdmin.response.json();
    const roomAdminId = roomAdminBody.response.id;

    const userData = {
      userIds: [userId, roomAdminId],
      resendAll: false,
    };

    await apiSdk.userStatus.changeUserStatus(
      "owner",
      UserStatus.Disabled,
      userData,
    );

    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    const response = await apiSdk.userStatus.changeUserStatus(
      "docSpaceAdmin",
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

  test("GET /people/status/:status - Owner returns a list of profiles filtered by the active user status", async ({
    apiSdk,
  }) => {
    const docSpaceAdmin = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const roomAdmin = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const user = await apiSdk.profiles.addMember("owner", "User");
    const guest = await apiSdk.profiles.addMember("owner", "Guest");

    const response = await apiSdk.userStatus.getPlofilesByStatus(
      "owner",
      UserStatus.Active,
    );
    const body = (await response.json()) as { response: UsersListItem[] };

    const docSpaceAdminData = body.response.find(
      (u: UsersListItem) => u.email === docSpaceAdmin.userData.email,
    );
    expect(docSpaceAdminData).toBeTruthy();
    if (!docSpaceAdminData) {
      throw new Error(
        `DocSpace admin user not found in users list by email: ${docSpaceAdmin.userData.email}`,
      );
    }
    expect(docSpaceAdminData.email).toBe(docSpaceAdmin.userData.email);
    expect(docSpaceAdminData.status).toBe(1);
    expect(docSpaceAdminData.isAdmin).toBe(true);

    const roomAdminData = body.response.find(
      (u: UsersListItem) => u.email === roomAdmin.userData.email,
    );
    expect(roomAdminData).toBeTruthy();
    if (!roomAdminData) {
      throw new Error(
        `Room admin user not found in users list by email: ${roomAdmin.userData.email}`,
      );
    }
    expect(roomAdminData.email).toBe(roomAdmin.userData.email);
    expect(roomAdminData.status).toBe(1);
    expect(roomAdminData.isRoomAdmin).toBe(true);

    const userData = body.response.find(
      (u: UsersListItem) => u.email === user.userData.email,
    );
    expect(userData).toBeTruthy();
    if (!userData) {
      throw new Error(
        `User not found in users list by email: ${user.userData.email}`,
      );
    }
    expect(userData.email).toBe(user.userData.email);
    expect(userData.status).toBe(1);
    expect(userData.isCollaborator).toBe(true);

    const guestData = body.response.find(
      (u: UsersListItem) => u.email === guest.userData.email,
    );
    expect(guestData).toBeTruthy();
    if (!guestData) {
      throw new Error(
        `Guest not found in users list by email: ${guest.userData.email}`,
      );
    }
    expect(guestData.email).toBe(guest.userData.email);
    expect(guestData.status).toBe(1);
    expect(guestData.isVisitor).toBe(true);
  });

  test("GET /people/status/:status - Owner returns a list of profiles filtered by the disabled user status", async ({
    apiSdk,
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

    const response = await apiSdk.userStatus.getPlofilesByStatus(
      "owner",
      UserStatus.Disabled,
    );
    const body = (await response.json()) as { response: UsersListItem[] };

    const docSpaceAdminData = body.response.find(
      (u: UsersListItem) => u.email === docSpaceAdminJson.response.email,
    );
    expect(docSpaceAdminData).toBeTruthy();
    if (!docSpaceAdminData) {
      throw new Error(
        `DocSpace admin user not found in users list by email: ${docSpaceAdminJson.response.email}`,
      );
    }
    expect(docSpaceAdminData.email).toBe(docSpaceAdminJson.response.email);
    expect(docSpaceAdminData.status).toBe(2);
    expect(docSpaceAdminData.isAdmin).toBe(true);

    const roomAdminData = body.response.find(
      (u: UsersListItem) => u.email === roomAdminJson.response.email,
    );
    expect(roomAdminData).toBeTruthy();
    if (!roomAdminData) {
      throw new Error(
        `Room admin user not found in users list by email: ${roomAdminJson.response.email}`,
      );
    }
    expect(roomAdminData.email).toBe(roomAdminJson.response.email);
    expect(roomAdminData.status).toBe(2);
    expect(roomAdminData.isRoomAdmin).toBe(true);

    const userData = body.response.find(
      (u: UsersListItem) => u.email === userJson.response.email,
    );
    expect(userData).toBeTruthy();
    if (!userData) {
      throw new Error(
        `User not found in users list by email: ${userJson.response.email}`,
      );
    }
    expect(userData.email).toBe(userJson.response.email);
    expect(userData.status).toBe(2);
    expect(userData.isCollaborator).toBe(true);

    const guestData = body.response.find(
      (u: UsersListItem) => u.email === guestJson.response.email,
    );
    expect(guestData).toBeTruthy();
    if (!guestData) {
      throw new Error(
        `Guest not found in users list by email: ${guestJson.response.email}`,
      );
    }
    expect(guestData.email).toBe(guestJson.response.email);
    expect(guestData.status).toBe(2);
    expect(guestData.isVisitor).toBe(true);
  });

  test("GET /people/status/:status - DocSpace admin returns a list of profiles filtered by the active user status", async ({
    apiSdk,
    api,
  }) => {
    const docSpaceAdmin = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const roomAdmin = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const user = await apiSdk.profiles.addMember("owner", "User");
    const guest = await apiSdk.profiles.addMember("owner", "Guest");

    await api.auth.authenticateDocSpaceAdmin();
    const response = await apiSdk.userStatus.getPlofilesByStatus(
      "docSpaceAdmin",
      UserStatus.Active,
    );
    const body = (await response.json()) as { response: UsersListItem[] };

    const docSpaceAdminData = body.response.find(
      (u: UsersListItem) => u.email === docSpaceAdmin.userData.email,
    );
    expect(docSpaceAdminData).toBeTruthy();
    if (!docSpaceAdminData) {
      throw new Error(
        `DocSpace admin user not found in users list by email: ${docSpaceAdmin.userData.email}`,
      );
    }
    expect(docSpaceAdminData.email).toBe(docSpaceAdmin.userData.email);
    expect(docSpaceAdminData.status).toBe(1);
    expect(docSpaceAdminData.isAdmin).toBe(true);

    const roomAdminData = body.response.find(
      (u: UsersListItem) => u.email === roomAdmin.userData.email,
    );
    expect(roomAdminData).toBeTruthy();
    if (!roomAdminData) {
      throw new Error(
        `Room admin user not found in users list by email: ${roomAdmin.userData.email}`,
      );
    }
    expect(roomAdminData.email).toBe(roomAdmin.userData.email);
    expect(roomAdminData.status).toBe(1);
    expect(roomAdminData.isRoomAdmin).toBe(true);

    const userData = body.response.find(
      (u: UsersListItem) => u.email === user.userData.email,
    );
    expect(userData).toBeTruthy();
    if (!userData) {
      throw new Error(
        `User not found in users list by email: ${user.userData.email}`,
      );
    }
    expect(userData.email).toBe(user.userData.email);
    expect(userData.status).toBe(1);
    expect(userData.isCollaborator).toBe(true);

    const guestData = body.response.find(
      (u: UsersListItem) => u.email === guest.userData.email,
    );
    expect(guestData).toBeTruthy();
    if (!guestData) {
      throw new Error(
        `Guest not found in users list by email: ${guest.userData.email}`,
      );
    }
    expect(guestData.email).toBe(guest.userData.email);
    expect(guestData.status).toBe(1);
    expect(guestData.isVisitor).toBe(true);
  });

  test("GET /people/status/:status - DocSpace admin returns a list of profiles filtered by the disabled user status", async ({
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

    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();
    const response = await apiSdk.userStatus.getPlofilesByStatus(
      "docSpaceAdmin",
      UserStatus.Disabled,
    );
    const body = (await response.json()) as { response: UsersListItem[] };

    const docSpaceAdminData = body.response.find(
      (u: UsersListItem) => u.email === docSpaceAdminJson.response.email,
    );
    expect(docSpaceAdminData).toBeTruthy();
    if (!docSpaceAdminData) {
      throw new Error(
        `DocSpace admin user not found in users list by email: ${docSpaceAdminJson.response.email}`,
      );
    }
    expect(docSpaceAdminData.email).toBe(docSpaceAdminJson.response.email);
    expect(docSpaceAdminData.status).toBe(2);
    expect(docSpaceAdminData.isAdmin).toBe(true);

    const roomAdminData = body.response.find(
      (u: UsersListItem) => u.email === roomAdminJson.response.email,
    );
    expect(roomAdminData).toBeTruthy();
    if (!roomAdminData) {
      throw new Error(
        `Room admin user not found in users list by email: ${roomAdminJson.response.email}`,
      );
    }
    expect(roomAdminData.email).toBe(roomAdminJson.response.email);
    expect(roomAdminData.status).toBe(2);
    expect(roomAdminData.isRoomAdmin).toBe(true);

    const userData = body.response.find(
      (u: UsersListItem) => u.email === userJson.response.email,
    );
    expect(userData).toBeTruthy();
    if (!userData) {
      throw new Error(
        `User not found in users list by email: ${userJson.response.email}`,
      );
    }
    expect(userData.email).toBe(userJson.response.email);
    expect(userData.status).toBe(2);
    expect(userData.isCollaborator).toBe(true);

    const guestData = body.response.find(
      (u: UsersListItem) => u.email === guestJson.response.email,
    );
    expect(guestData).toBeTruthy();
    if (!guestData) {
      throw new Error(
        `Guest not found in users list by email: ${guestJson.response.email}`,
      );
    }
    expect(guestData.email).toBe(guestJson.response.email);
    expect(guestData.status).toBe(2);
    expect(guestData.isVisitor).toBe(true);
  });

  test("GET /people/status/:status - Room admin returns a list of profiles filtered by the active user status", async ({
    apiSdk,
    api,
  }) => {
    const docSpaceAdmin = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const roomAdmin = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const user = await apiSdk.profiles.addMember("owner", "User");

    await api.auth.authenticateRoomAdmin();
    const response = await apiSdk.userStatus.getPlofilesByStatus(
      "roomAdmin",
      UserStatus.Active,
    );
    const body = (await response.json()) as { response: UsersListItem[] };

    const docSpaceAdminData = body.response.find(
      (u: UsersListItem) => u.email === docSpaceAdmin.userData.email,
    );
    expect(docSpaceAdminData).toBeTruthy();
    if (!docSpaceAdminData) {
      throw new Error(
        `DocSpace admin user not found in users list by email: ${docSpaceAdmin.userData.email}`,
      );
    }
    expect(docSpaceAdminData.email).toBe(docSpaceAdmin.userData.email);
    expect(docSpaceAdminData.status).toBe(1);
    expect(docSpaceAdminData.isAdmin).toBe(true);

    const roomAdminData = body.response.find(
      (u: UsersListItem) => u.email === roomAdmin.userData.email,
    );
    expect(roomAdminData).toBeTruthy();
    if (!roomAdminData) {
      throw new Error(
        `Room admin user not found in users list by email: ${roomAdmin.userData.email}`,
      );
    }
    expect(roomAdminData.email).toBe(roomAdmin.userData.email);
    expect(roomAdminData.status).toBe(1);
    expect(roomAdminData.isRoomAdmin).toBe(true);

    const userData = body.response.find(
      (u: UsersListItem) => u.email === user.userData.email,
    );
    expect(userData).toBeTruthy();
    if (!userData) {
      throw new Error(
        `User not found in users list by email: ${user.userData.email}`,
      );
    }
    expect(userData.email).toBe(user.userData.email);
    expect(userData.status).toBe(1);
    expect(userData.isCollaborator).toBe(true);
  });

  test("GET /people/status/:status - Room admin returns a list of profiles filtered by the disabled user status", async ({
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

    await apiSdk.profiles.addMember("owner", "RoomAdmin");
    await api.auth.authenticateRoomAdmin();
    const response = await apiSdk.userStatus.getPlofilesByStatus(
      "roomAdmin",
      UserStatus.Disabled,
    );
    const responseData = await response.json();
    expect(responseData.statusCode).toBe(200);
    expect(responseData.count).toBe(0);
    expect(responseData.total).toBe(0);
  });
});

//TODO: Write tests from different users to activate / disabled users
