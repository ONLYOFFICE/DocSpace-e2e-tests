import { expect } from "@playwright/test";
import { test } from "@/src/fixtures/index";
import { faker } from "@faker-js/faker";
import config from "@/config";
import { UserStatus } from "@/src/services/people/userStatus.services";

type UsersListItem = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  isOwner?: boolean;
  isAdmin?: boolean;
  isRoomAdmin?: boolean;
  isCollaborator?: boolean;
};

test.describe("API profile methods", () => {
  // 80020 - NEW
  test("Owner create User", async ({ apiSdk }) => {
    const { response } = await apiSdk.profiles.addMember("owner", "User");
    const body = await response.json();
    expect(body.statusCode).toBe(200);
    expect(body.response.isCollaborator).toBe(true);
    expect(body.response.isOwner).toBe(false);
    expect(body.response.isVisitor).toBe(false);
    expect(body.response.isAdmin).toBe(false);
    expect(body.response.isRoomAdmin).toBe(false);
    expect(body.response.isLDAP).toBe(false);
    expect(body.response.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  test("Owner create Room Admin", async ({ apiSdk }) => {
    const { response } = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const body = await response.json();
    expect(body.statusCode).toBe(200);
    expect(body.response.isCollaborator).toBe(false);
    expect(body.response.isOwner).toBe(false);
    expect(body.response.isVisitor).toBe(false);
    expect(body.response.isAdmin).toBe(false);
    expect(body.response.isRoomAdmin).toBe(true);
    expect(body.response.isLDAP).toBe(false);
    expect(body.response.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  test("Owner create DocSpace Admin", async ({ apiSdk }) => {
    const { response } = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const body = await response.json();
    expect(body.statusCode).toBe(200);
    expect(body.response.isCollaborator).toBe(false);
    expect(body.response.isOwner).toBe(false);
    expect(body.response.isVisitor).toBe(false);
    expect(body.response.isAdmin).toBe(true);
    expect(body.response.isRoomAdmin).toBe(false);
    expect(body.response.isLDAP).toBe(false);
    expect(body.response.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  test("DocSpace admin creates Room admin", async ({ apiSdk, api }) => {
    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    const { response } = await apiSdk.profiles.addMember(
      "docSpaceAdmin",
      "RoomAdmin",
    );
    const body = await response.json();
    expect(body.statusCode).toBe(200);
    expect(body.response.isCollaborator).toBe(false);
    expect(body.response.isOwner).toBe(false);
    expect(body.response.isVisitor).toBe(false);
    expect(body.response.isAdmin).toBe(false);
    expect(body.response.isRoomAdmin).toBe(true);
    expect(body.response.isLDAP).toBe(false);
    expect(body.response.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  test("DocSpace admin creates user", async ({ apiSdk, api }) => {
    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    const { response } = await apiSdk.profiles.addMember(
      "docSpaceAdmin",
      "User",
    );
    const body = await response.json();
    expect(body.statusCode).toBe(200);
    expect(body.response.isCollaborator).toBe(true);
    expect(body.response.isOwner).toBe(false);
    expect(body.response.isVisitor).toBe(false);
    expect(body.response.isAdmin).toBe(false);
    expect(body.response.isRoomAdmin).toBe(false);
    expect(body.response.isLDAP).toBe(false);
    expect(body.response.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  test("Room admin creates User", async ({ apiSdk, api }) => {
    await apiSdk.profiles.addMember("owner", "RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    const { response } = await apiSdk.profiles.addMember("roomAdmin", "User");
    const body = await response.json();
    expect(body.statusCode).toBe(200);
    expect(body.response.isCollaborator).toBe(true);
    expect(body.response.isOwner).toBe(false);
    expect(body.response.isVisitor).toBe(false);
    expect(body.response.isAdmin).toBe(false);
    expect(body.response.isRoomAdmin).toBe(false);
    expect(body.response.isLDAP).toBe(false);
    expect(body.response.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  test("Owner returns all users list", async ({ apiSdk }) => {
    const { userData: docSpaceAdminUserData } = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const { userData: roomAdminUserData } = await apiSdk.profiles.addMember(
      "owner",
      "RoomAdmin",
    );
    const { userData: userUserData } = await apiSdk.profiles.addMember(
      "owner",
      "User",
    );
    const response = await apiSdk.profiles.returnAllUsersList("owner");
    const body = (await response.json()) as { response: UsersListItem[] };

    const owner = body.response.find(
      (u: UsersListItem) => u.email === config.DOCSPACE_OWNER_EMAIL,
    );
    expect(response.status()).toBe(200);
    expect(owner).toBeTruthy();
    if (!owner) {
      throw new Error(
        `Owner user not found in users list by email: ${config.DOCSPACE_OWNER_EMAIL}`,
      );
    }
    expect(owner.firstName).toBe("admin-zero");
    expect(owner.lastName).toBe("admin-zero");
    expect(owner.email).toBe(config.DOCSPACE_OWNER_EMAIL);
    expect(owner.isOwner).toBe(true);
    expect(owner.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );

    const docspaceAdmin = body.response.find(
      (u: UsersListItem) => u.email === docSpaceAdminUserData.email,
    );
    expect(docspaceAdmin).toBeTruthy();
    if (!docspaceAdmin) {
      throw new Error(
        `DocSpace admin user not found in users list by email: ${docSpaceAdminUserData.email}`,
      );
    }
    expect(docspaceAdmin.firstName).toBe(docSpaceAdminUserData.firstName);
    expect(docspaceAdmin.lastName).toBe(docSpaceAdminUserData.lastName);
    expect(docspaceAdmin.email).toBe(docSpaceAdminUserData.email);
    expect(docspaceAdmin.isAdmin).toBe(true);
    expect(docspaceAdmin.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );

    const roomAdmin = body.response.find(
      (u: UsersListItem) => u.email === roomAdminUserData.email,
    );
    expect(roomAdmin).toBeTruthy();
    if (!roomAdmin) {
      throw new Error(
        `Room admin user not found in users list by email: ${roomAdminUserData.email}`,
      );
    }
    expect(roomAdmin.firstName).toBe(roomAdminUserData.firstName);
    expect(roomAdmin.lastName).toBe(roomAdminUserData.lastName);
    expect(roomAdmin.email).toBe(roomAdminUserData.email);
    expect(roomAdmin.isRoomAdmin).toBe(true);
    expect(roomAdmin.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );

    const user = body.response.find(
      (u: UsersListItem) => u.email === userUserData.email,
    );
    expect(user).toBeTruthy();
    if (!user) {
      throw new Error(
        `User not found in users list by email: ${userUserData.email}`,
      );
    }
    expect(user.firstName).toBe(userUserData.firstName);
    expect(user.lastName).toBe(userUserData.lastName);
    expect(user.email).toBe(userUserData.email);
    expect(user.isCollaborator).toBe(true);
    expect(user.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  test("DocSpace admin returns all users list", async ({ apiSdk, api }) => {
    const { userData: docSpaceAdminUserData } = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const { userData: roomAdminUserData } = await apiSdk.profiles.addMember(
      "owner",
      "RoomAdmin",
    );
    const { userData: userUserData } = await apiSdk.profiles.addMember(
      "owner",
      "User",
    );
    await api.auth.authenticateDocSpaceAdmin();

    const response = await apiSdk.profiles.returnAllUsersList("docSpaceAdmin");
    const body = (await response.json()) as { response: UsersListItem[] };

    const owner = body.response.find(
      (u: UsersListItem) => u.email === config.DOCSPACE_OWNER_EMAIL,
    );
    expect(response.status()).toBe(200);
    expect(owner).toBeTruthy();
    if (!owner) {
      throw new Error(
        `Owner user not found in users list by email: ${config.DOCSPACE_OWNER_EMAIL}`,
      );
    }
    expect(owner.firstName).toBe("admin-zero");
    expect(owner.lastName).toBe("admin-zero");
    expect(owner.email).toBe(config.DOCSPACE_OWNER_EMAIL);
    expect(owner.isOwner).toBe(true);
    expect(owner.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );

    const docspaceAdmin = body.response.find(
      (u: UsersListItem) => u.email === docSpaceAdminUserData.email,
    );
    expect(docspaceAdmin).toBeTruthy();
    if (!docspaceAdmin) {
      throw new Error(
        `DocSpace admin user not found in users list by email: ${docSpaceAdminUserData.email}`,
      );
    }
    expect(docspaceAdmin.firstName).toBe(docSpaceAdminUserData.firstName);
    expect(docspaceAdmin.lastName).toBe(docSpaceAdminUserData.lastName);
    expect(docspaceAdmin.email).toBe(docSpaceAdminUserData.email);
    expect(docspaceAdmin.isAdmin).toBe(true);
    expect(docspaceAdmin.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );

    const roomAdmin = body.response.find(
      (u: UsersListItem) => u.email === roomAdminUserData.email,
    );
    expect(roomAdmin).toBeTruthy();
    if (!roomAdmin) {
      throw new Error(
        `Room admin user not found in users list by email: ${roomAdminUserData.email}`,
      );
    }
    expect(roomAdmin.firstName).toBe(roomAdminUserData.firstName);
    expect(roomAdmin.lastName).toBe(roomAdminUserData.lastName);
    expect(roomAdmin.email).toBe(roomAdminUserData.email);
    expect(roomAdmin.isRoomAdmin).toBe(true);
    expect(roomAdmin.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );

    const user = body.response.find(
      (u: UsersListItem) => u.email === userUserData.email,
    );
    expect(user).toBeTruthy();
    if (!user) {
      throw new Error(
        `User not found in users list by email: ${userUserData.email}`,
      );
    }
    expect(user.firstName).toBe(userUserData.firstName);
    expect(user.lastName).toBe(userUserData.lastName);
    expect(user.email).toBe(userUserData.email);
    expect(user.isCollaborator).toBe(true);
    expect(user.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  test("Room admin returns all users list", async ({ apiSdk, api }) => {
    const { userData: docSpaceAdminUserData } = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const { userData: roomAdminUserData } = await apiSdk.profiles.addMember(
      "owner",
      "RoomAdmin",
    );
    const { userData: userUserData } = await apiSdk.profiles.addMember(
      "owner",
      "User",
    );
    await api.auth.authenticateRoomAdmin();

    const response = await apiSdk.profiles.returnAllUsersList("roomAdmin");
    const body = (await response.json()) as { response: UsersListItem[] };

    const owner = body.response.find(
      (u: UsersListItem) => u.email === config.DOCSPACE_OWNER_EMAIL,
    );
    expect(response.status()).toBe(200);
    expect(owner).toBeTruthy();
    if (!owner) {
      throw new Error(
        `Owner user not found in users list by email: ${config.DOCSPACE_OWNER_EMAIL}`,
      );
    }
    expect(owner.firstName).toBe("admin-zero");
    expect(owner.lastName).toBe("admin-zero");
    expect(owner.email).toBe(config.DOCSPACE_OWNER_EMAIL);
    expect(owner.isOwner).toBe(true);
    expect(owner.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );

    const docspaceAdmin = body.response.find(
      (u: UsersListItem) => u.email === docSpaceAdminUserData.email,
    );
    expect(docspaceAdmin).toBeTruthy();
    if (!docspaceAdmin) {
      throw new Error(
        `DocSpace admin user not found in users list by email: ${docSpaceAdminUserData.email}`,
      );
    }
    expect(docspaceAdmin.firstName).toBe(docSpaceAdminUserData.firstName);
    expect(docspaceAdmin.lastName).toBe(docSpaceAdminUserData.lastName);
    expect(docspaceAdmin.email).toBe(docSpaceAdminUserData.email);
    expect(docspaceAdmin.isAdmin).toBe(true);
    expect(docspaceAdmin.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );

    const roomAdmin = body.response.find(
      (u: UsersListItem) => u.email === roomAdminUserData.email,
    );
    expect(roomAdmin).toBeTruthy();
    if (!roomAdmin) {
      throw new Error(
        `Room admin user not found in users list by email: ${roomAdminUserData.email}`,
      );
    }
    expect(roomAdmin.firstName).toBe(roomAdminUserData.firstName);
    expect(roomAdmin.lastName).toBe(roomAdminUserData.lastName);
    expect(roomAdmin.email).toBe(roomAdminUserData.email);
    expect(roomAdmin.isRoomAdmin).toBe(true);
    expect(roomAdmin.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );

    const user = body.response.find(
      (u: UsersListItem) => u.email === userUserData.email,
    );
    expect(user).toBeTruthy();
    if (!user) {
      throw new Error(
        `User not found in users list by email: ${userUserData.email}`,
      );
    }
    expect(user.firstName).toBe(userUserData.firstName);
    expect(user.lastName).toBe(userUserData.lastName);
    expect(user.email).toBe(userUserData.email);
    expect(user.isCollaborator).toBe(true);
    expect(user.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  test("Owner invites docspace admin", async ({ apiSdk }) => {
    const userData = {
      type: "DocSpaceAdmin",
      email: faker.internet.email(),
    };

    const response = await apiSdk.profiles.inviteUser("owner", userData);
    const body = await response.json();
    const invitedUser = body.response[0];
    expect(body.statusCode).toBe(200);
    expect(invitedUser.displayName).toBe(userData.email);
    expect(invitedUser.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(body.count).toBe(1);
    expect(invitedUser.hasAvatar).toBe(false);
    expect(invitedUser.isAnonim).toBe(false);
  });

  test("Owner invites room admin", async ({ apiSdk }) => {
    const userData = {
      type: "RoomAdmin",
      email: faker.internet.email(),
    };

    const response = await apiSdk.profiles.inviteUser("owner", userData);
    const body = await response.json();
    const invitedUser = body.response[0];
    expect(body.statusCode).toBe(200);
    expect(invitedUser.displayName).toBe(userData.email);
    expect(invitedUser.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(body.count).toBe(1);
    expect(invitedUser.hasAvatar).toBe(false);
    expect(invitedUser.isAnonim).toBe(false);
  });

  test("Owner invites user", async ({ apiSdk }) => {
    const email = faker.internet.email();
    const response = await apiSdk.profiles.inviteUser("owner", {
      type: "User",
      email,
    });
    const body = await response.json();
    const invitedUser = body.response[0];
    expect(body.statusCode).toBe(200);
    expect(invitedUser.displayName).toBe(email);
    expect(invitedUser.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(body.count).toBe(1);
    expect(invitedUser.hasAvatar).toBe(false);
    expect(invitedUser.isAnonim).toBe(false);
  });

  test("DocSpace admin invites room admin", async ({ apiSdk, api }) => {
    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();
    const email = faker.internet.email();

    const response = await apiSdk.profiles.inviteUser("docSpaceAdmin", {
      type: "RoomAdmin",
      email,
    });
    const body = await response.json();
    const invitedUser = body.response.find(
      (user: UsersListItem) => user.displayName === email,
    );
    expect(body.statusCode).toBe(200);
    expect(invitedUser).toBeDefined();
    expect(invitedUser.displayName).toBe(email);
    expect(invitedUser.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(body.count).toBe(2);
    expect(invitedUser.hasAvatar).toBe(false);
    expect(invitedUser.isAnonim).toBe(false);
  });

  test("DocSpace admin invites user", async ({ apiSdk, api }) => {
    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();
    const email = faker.internet.email();

    const response = await apiSdk.profiles.inviteUser("docSpaceAdmin", {
      type: "User",
      email,
    });
    const body = await response.json();
    const invitedUser = body.response.find(
      (user: UsersListItem) => user.displayName === email,
    );
    expect(body.statusCode).toBe(200);
    expect(invitedUser).toBeDefined();
    expect(invitedUser.displayName).toBe(email);
    expect(invitedUser.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(body.count).toBe(2);
    expect(invitedUser.hasAvatar).toBe(false);
    expect(invitedUser.isAnonim).toBe(false);
  });

  test("Room admin invites user", async ({ apiSdk, api }) => {
    await apiSdk.profiles.addMember("owner", "RoomAdmin");
    await api.auth.authenticateRoomAdmin();
    const email = faker.internet.email();

    const response = await apiSdk.profiles.inviteUser("roomAdmin", {
      type: "User",
      email,
    });
    const body = await response.json();
    expect(body.statusCode).toBe(200);
    const invitedUser = body.response.find(
      (u: UsersListItem) => u.displayName === email,
    );
    expect(invitedUser.displayName).toBe(email);
    expect(invitedUser.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(body.count).toBe(2);
    expect(invitedUser.hasAvatar).toBe(false);
    expect(invitedUser.isAnonim).toBe(false);
  });

  test("Owner resend activation emails ", async ({ apiSdk }) => {
    const email = faker.internet.email();
    const response = await apiSdk.profiles.inviteUser("owner", {
      type: "DocSpaceAdmin",
      email,
    });
    const body = await response.json();
    const invitedUser = body.response.find(
      (u: UsersListItem) => u.displayName === email,
    )!;

    const responseResent = await apiSdk.profiles.resendActavationEmails(
      "owner",
      {
        userIds: [invitedUser.id],
        resendAll: false,
      },
    );
    const bodyResent = await responseResent.json();
    const resendUser = bodyResent.response[0];
    expect(bodyResent.statusCode).toBe(200);
    expect(resendUser.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(resendUser.email).toBe(email);
    expect(resendUser.hasAvatar).toBe(false);
    expect(resendUser.isAnonim).toBe(false);
    expect(resendUser.status).toBe(4);
    expect(resendUser.activationStatus).toBe(2);
  });

  test("DocSpace admin resend activation emails ", async ({ apiSdk, api }) => {
    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    const email = faker.internet.email();
    const response = await apiSdk.profiles.inviteUser("docSpaceAdmin", {
      type: "RoomAdmin",
      email,
    });
    const body = await response.json();
    const invitedUser = body.response.find(
      (u: UsersListItem) => u.displayName === email,
    )!;

    const responseResent = await apiSdk.profiles.resendActavationEmails(
      "docSpaceAdmin",
      {
        userIds: [invitedUser.id],
        resendAll: false,
      },
    );
    const bodyResent = await responseResent.json();
    const resendUser = bodyResent.response[0];
    expect(bodyResent.statusCode).toBe(200);
    expect(resendUser.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(resendUser.email).toBe(email);
    expect(resendUser.hasAvatar).toBe(false);
    expect(resendUser.isAnonim).toBe(false);
    expect(resendUser.status).toBe(4);
    expect(resendUser.activationStatus).toBe(2);
  });

  test("Room admin resend activation emails ", async ({ apiSdk, api }) => {
    await apiSdk.profiles.addMember("owner", "RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    const email = faker.internet.email();
    const response = await apiSdk.profiles.inviteUser("roomAdmin", {
      type: "User",
      email,
    });
    const body = await response.json();
    const invitedUser = body.response.find(
      (u: UsersListItem) => u.displayName === email,
    )!;

    const responseResent = await apiSdk.profiles.resendActavationEmails(
      "roomAdmin",
      {
        userIds: [invitedUser.id],
        resendAll: false,
      },
    );
    const bodyResent = await responseResent.json();
    const resendUser = bodyResent.response[0];
    expect(bodyResent.statusCode).toBe(200);
    expect(resendUser.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(resendUser.email).toBe(email);
    expect(resendUser.hasAvatar).toBe(false);
    expect(resendUser.isAnonim).toBe(false);
    expect(resendUser.status).toBe(4);
    expect(resendUser.activationStatus).toBe(2);
  });

  test("Owner deletes a deactivated user", async ({ apiSdk }) => {
    const user = await apiSdk.profiles.addMember("owner", "User");
    const response = await user.response.json();
    const userId = response.response.id;

    const userDataChangeStatus = {
      userIds: [userId],
      resendAll: false,
    };

    const userDataDeleteUser = {
      userIds: [userId],
    };

    await apiSdk.userStatus.changeUserStatus(
      "owner",
      UserStatus.Disabled,
      userDataChangeStatus,
    );
    const responseDelete = await apiSdk.profiles.deleteUser(
      "owner",
      userDataDeleteUser,
    );
    const bodyDelete = await responseDelete.json();
    expect(bodyDelete.statusCode).toBe(200);
    expect(bodyDelete.links[0].action).toBe("DELETE");
    expect(bodyDelete.response.id).toBe(userId);
  });

  test("Owner deletes a deactivated docspace admin", async ({ apiSdk }) => {
    const user = await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    const response = await user.response.json();
    const userId = response.response.id;

    const userDataChangeStatus = {
      userIds: [userId],
      resendAll: false,
    };

    const userDataDeleteUser = {
      userIds: [userId],
    };

    await apiSdk.userStatus.changeUserStatus(
      "owner",
      UserStatus.Disabled,
      userDataChangeStatus,
    );
    const responseDelete = await apiSdk.profiles.deleteUser(
      "owner",
      userDataDeleteUser,
    );
    const bodyDelete = await responseDelete.json();
    expect(bodyDelete.statusCode).toBe(200);
    expect(bodyDelete.links[0].action).toBe("DELETE");
    expect(bodyDelete.response.id).toBe(userId);
  });

  test("Owner deletes a deactivated room admin", async ({ apiSdk }) => {
    const user = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const response = await user.response.json();
    const userId = response.response.id;

    const userDataChangeStatus = {
      userIds: [userId],
      resendAll: false,
    };

    const userDataDeleteUser = {
      userIds: [userId],
    };

    await apiSdk.userStatus.changeUserStatus(
      "owner",
      UserStatus.Disabled,
      userDataChangeStatus,
    );
    const responseDelete = await apiSdk.profiles.deleteUser(
      "owner",
      userDataDeleteUser,
    );
    const bodyDelete = await responseDelete.json();
    expect(bodyDelete.statusCode).toBe(200);
    expect(bodyDelete.links[0].action).toBe("DELETE");
    expect(bodyDelete.response.id).toBe(userId);
  });

  test("DocSpace admin deletes a deactivated room admin", async ({
    apiSdk,
    api,
  }) => {
    // Create first DocSpace admin that will be deleted
    const userToDelete = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const responseToDelete = await userToDelete.response.json();
    const userIdToDelete = responseToDelete.response.id;

    // Disable the first DocSpace admin
    const userDataChangeStatus = {
      userIds: [userIdToDelete],
      resendAll: false,
    };
    await apiSdk.userStatus.changeUserStatus(
      "owner",
      UserStatus.Disabled,
      userDataChangeStatus,
    );

    // Create second DocSpace admin that will perform the deletion
    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    // Delete the disabled DocSpace admin
    const userDataDeleteUser = {
      userIds: [userIdToDelete],
    };

    const responseDelete = await apiSdk.profiles.deleteUser(
      "docSpaceAdmin",
      userDataDeleteUser,
    );
    const bodyDelete = await responseDelete.json();
    expect(bodyDelete.statusCode).toBe(200);
    expect(bodyDelete.links[0].action).toBe("DELETE");
    expect(bodyDelete.response.id).toBe(userIdToDelete);
  });

  test("DocSpace admin deletes a deactivated user", async ({ apiSdk, api }) => {
    // Create first DocSpace admin that will be deleted
    const userToDelete = await apiSdk.profiles.addMember("owner", "User");
    const responseToDelete = await userToDelete.response.json();
    const userIdToDelete = responseToDelete.response.id;

    // Disable the first DocSpace admin
    const userDataChangeStatus = {
      userIds: [userIdToDelete],
      resendAll: false,
    };
    await apiSdk.userStatus.changeUserStatus(
      "owner",
      UserStatus.Disabled,
      userDataChangeStatus,
    );

    // Create second DocSpace admin that will perform the deletion
    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    // Delete the disabled DocSpace admin
    const userDataDeleteUser = {
      userIds: [userIdToDelete],
    };

    const responseDelete = await apiSdk.profiles.deleteUser(
      "docSpaceAdmin",
      userDataDeleteUser,
    );
    const bodyDelete = await responseDelete.json();
    expect(bodyDelete.statusCode).toBe(200);
    expect(bodyDelete.links[0].action).toBe("DELETE");
    expect(bodyDelete.response.id).toBe(userIdToDelete);
  });

  test("Owner returns detailed information of a user", async ({ apiSdk }) => {
    const user = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const response = await user.response.json();
    const userId = response.response.id;

    const responseReturnInfo =
      await apiSdk.profiles.returnUserDetailedInformation("owner", userId);
    const bodyReturnInfo = await responseReturnInfo.json();
    expect(bodyReturnInfo.statusCode).toBe(200);
    expect(bodyReturnInfo.response.id).toBe(userId);
    expect(bodyReturnInfo.response.email).toBe(response.response.email);
  });

  test("DocSpace admin returns detailed information of a user", async ({
    apiSdk,
    api,
  }) => {
    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();
    const returnAllUsersList =
      await apiSdk.profiles.returnAllUsersList("docSpaceAdmin");
    const body = (await returnAllUsersList.json()) as {
      response: UsersListItem[];
    };
    const owner = body.response.find(
      (u: UsersListItem) => u.email === config.DOCSPACE_OWNER_EMAIL,
    );
    if (!owner) {
      throw new Error(
        `Owner not found with email: ${config.DOCSPACE_OWNER_EMAIL}`,
      );
    }
    const userId = owner.id;
    const responseReturnInfo =
      await apiSdk.profiles.returnUserDetailedInformation(
        "docSpaceAdmin",
        userId,
      );
    const bodyReturnInfo = await responseReturnInfo.json();
    expect(bodyReturnInfo.statusCode).toBe(200);
    expect(bodyReturnInfo.response.id).toBe(userId);
    expect(bodyReturnInfo.response.email).toBe(owner.email);
    expect(bodyReturnInfo.response.firstName).toBe(owner.firstName);
    expect(bodyReturnInfo.response.lastName).toBe(owner.lastName);
  });

  test("Room admin returns detailed information of a user", async ({
    apiSdk,
    api,
  }) => {
    await apiSdk.profiles.addMember("owner", "RoomAdmin");
    await api.auth.authenticateRoomAdmin();
    const returnAllUsersList =
      await apiSdk.profiles.returnAllUsersList("roomAdmin");
    const body = (await returnAllUsersList.json()) as {
      response: UsersListItem[];
    };
    const owner = body.response.find(
      (u: UsersListItem) => u.email === config.DOCSPACE_OWNER_EMAIL,
    );
    if (!owner) {
      throw new Error(
        `Owner not found with email: ${config.DOCSPACE_OWNER_EMAIL}`,
      );
    }
    const userId = owner.id;
    const responseReturnInfo =
      await apiSdk.profiles.returnUserDetailedInformation("roomAdmin", userId);
    const bodyReturnInfo = await responseReturnInfo.json();
    expect(bodyReturnInfo.statusCode).toBe(200);
    expect(bodyReturnInfo.response.id).toBe(userId);
    expect(bodyReturnInfo.response.email).toBe(owner.email);
    expect(bodyReturnInfo.response.firstName).toBe(owner.firstName);
    expect(bodyReturnInfo.response.lastName).toBe(owner.lastName);
  });

  test("Updating owner profile data", async ({ apiSdk }) => {
    const returnAllUsersList =
      await apiSdk.profiles.returnAllUsersList("owner");
    const response = await returnAllUsersList.json();
    const userId = response.response[0].id;
    const userData = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const responseUpdateInfo = await apiSdk.profiles.updatesData(
      "owner",
      userId,
      userData,
    );
    const bodyUpdateInfo = await responseUpdateInfo.json();
    expect(bodyUpdateInfo.statusCode).toBe(200);
    expect(bodyUpdateInfo.response.id).toBe(userId);
    expect(bodyUpdateInfo.response.firstName).toBe(userData.firstName);
    expect(bodyUpdateInfo.response.lastName).toBe(userData.lastName);
    expect(bodyUpdateInfo.response.displayName).toBe(
      userData.firstName + " " + userData.lastName,
    );
  });

  test("Updating DocSpace admin profile data", async ({ apiSdk, api }) => {
    const user = await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    const response = await user.response.json();
    const userId = response.response.id;
    await api.auth.authenticateDocSpaceAdmin();

    const userData = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const responseUpdateInfo = await apiSdk.profiles.updatesData(
      "docSpaceAdmin",
      userId,
      userData,
    );
    const bodyUpdateInfo = await responseUpdateInfo.json();
    expect(bodyUpdateInfo.statusCode).toBe(200);
    expect(bodyUpdateInfo.response.id).toBe(userId);
    expect(bodyUpdateInfo.response.firstName).toBe(userData.firstName);
    expect(bodyUpdateInfo.response.lastName).toBe(userData.lastName);
    expect(bodyUpdateInfo.response.displayName).toBe(
      userData.firstName + " " + userData.lastName,
    );
    expect(bodyUpdateInfo.response.isAdmin).toBe(true);
  });

  test("Updating room admin profile data", async ({ apiSdk, api }) => {
    const user = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const response = await user.response.json();
    const userId = response.response.id;
    await api.auth.authenticateRoomAdmin();

    const userData = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const responseUpdateInfo = await apiSdk.profiles.updatesData(
      "roomAdmin",
      userId,
      userData,
    );
    const bodyUpdateInfo = await responseUpdateInfo.json();
    expect(bodyUpdateInfo.statusCode).toBe(200);
    expect(bodyUpdateInfo.response.id).toBe(userId);
    expect(bodyUpdateInfo.response.firstName).toBe(userData.firstName);
    expect(bodyUpdateInfo.response.lastName).toBe(userData.lastName);
    expect(bodyUpdateInfo.response.displayName).toBe(
      userData.firstName + " " + userData.lastName,
    );
    expect(bodyUpdateInfo.response.isRoomAdmin).toBe(true);
  });

  // 79994 - NEW
  test("Updating user profile data", async ({ apiSdk, api }) => {
    const user = await apiSdk.profiles.addMember("owner", "User");
    const response = await user.response.json();
    const userId = response.response.id;
    await api.auth.authenticateUser();

    const userData = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const responseUpdateInfo = await apiSdk.profiles.updatesData(
      "user",
      userId,
      userData,
    );
    const bodyUpdateInfo = await responseUpdateInfo.json();
    expect(bodyUpdateInfo.statusCode).toBe(200);
    expect(bodyUpdateInfo.response.id).toBe(userId);
    expect(bodyUpdateInfo.response.firstName).toBe(userData.firstName);
    expect(bodyUpdateInfo.response.lastName).toBe(userData.lastName);
    expect(bodyUpdateInfo.response.displayName).toBe(
      userData.firstName + " " + userData.lastName,
    );
    expect(bodyUpdateInfo.response.isCollaborator).toBe(true);
  });

  test("Owner receives information about himself", async ({ apiSdk }) => {
    const response = await apiSdk.profiles.returnHimselfInformation("owner");
    const bodyHimselfInfo = await response.json();
    expect(bodyHimselfInfo.statusCode).toBe(200);
    expect(bodyHimselfInfo.response.firstName).toBe("admin-zero");
    expect(bodyHimselfInfo.response.lastName).toBe("admin-zero");
    expect(bodyHimselfInfo.response.displayName).toBe("admin-zero admin-zero");
    expect(bodyHimselfInfo.response.isAdmin).toBe(true);
    expect(bodyHimselfInfo.response.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(bodyHimselfInfo.response.hasPersonalFolder).toBe(true);
  });

  test("DocSpace admin receives information about himself", async ({
    apiSdk,
    api,
  }) => {
    const user = await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    const docSpaceAdminInfo = await user.response.json();
    await api.auth.authenticateDocSpaceAdmin();
    const response =
      await apiSdk.profiles.returnHimselfInformation("docSpaceAdmin");
    const bodyHimselfInfo = await response.json();
    expect(bodyHimselfInfo.statusCode).toBe(200);
    expect(bodyHimselfInfo.response.firstName).toBe(
      docSpaceAdminInfo.response.firstName,
    );
    expect(bodyHimselfInfo.response.lastName).toBe(
      docSpaceAdminInfo.response.lastName,
    );
    expect(bodyHimselfInfo.response.displayName).toBe(
      docSpaceAdminInfo.response.displayName,
    );
    expect(bodyHimselfInfo.response.isAdmin).toBe(true);
    expect(bodyHimselfInfo.response.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(bodyHimselfInfo.response.hasPersonalFolder).toBe(true);
  });

  test("Room admin receives information about himself", async ({
    apiSdk,
    api,
  }) => {
    const user = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminInfo = await user.response.json();
    await api.auth.authenticateRoomAdmin();
    const response =
      await apiSdk.profiles.returnHimselfInformation("roomAdmin");
    const bodyHimselfInfo = await response.json();
    expect(bodyHimselfInfo.statusCode).toBe(200);
    expect(bodyHimselfInfo.response.firstName).toBe(
      roomAdminInfo.response.firstName,
    );
    expect(bodyHimselfInfo.response.lastName).toBe(
      roomAdminInfo.response.lastName,
    );
    expect(bodyHimselfInfo.response.displayName).toBe(
      roomAdminInfo.response.displayName,
    );
    expect(bodyHimselfInfo.response.isRoomAdmin).toBe(true);
    expect(bodyHimselfInfo.response.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(bodyHimselfInfo.response.hasPersonalFolder).toBe(true);
  });

  test("User receives information about himself", async ({ apiSdk, api }) => {
    const user = await apiSdk.profiles.addMember("owner", "User");
    const userInfo = await user.response.json();
    await api.auth.authenticateUser();
    const response = await apiSdk.profiles.returnHimselfInformation("user");
    const bodyHimselfInfo = await response.json();
    expect(bodyHimselfInfo.statusCode).toBe(200);
    expect(bodyHimselfInfo.response.firstName).toBe(
      userInfo.response.firstName,
    );
    expect(bodyHimselfInfo.response.lastName).toBe(userInfo.response.lastName);
    expect(bodyHimselfInfo.response.displayName).toBe(
      userInfo.response.displayName,
    );
    expect(bodyHimselfInfo.response.isCollaborator).toBe(true);
    expect(bodyHimselfInfo.response.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(bodyHimselfInfo.response.hasPersonalFolder).toBe(true);
  });

  test("Owner receives information about himself via email.", async ({
    apiSdk,
  }) => {
    const ownerData = await apiSdk.profiles.returnHimselfInformation("owner");
    const ownerDataJson = await ownerData.json();
    const ownerEmail = ownerDataJson.response.email;

    const userData = {
      email: [ownerEmail],
    };
    const response = await apiSdk.profiles.returnsUserInfoViaEmail(
      "owner",
      userData,
    );
    const bodyHimselfInfo = await response.json();
    expect(bodyHimselfInfo.statusCode).toBe(200);
    expect(bodyHimselfInfo.response.firstName).toBe(
      ownerDataJson.response.firstName,
    );
    expect(bodyHimselfInfo.response.lastName).toBe(
      ownerDataJson.response.lastName,
    );
    expect(bodyHimselfInfo.response.displayName).toBe(
      ownerDataJson.response.displayName,
    );
    expect(bodyHimselfInfo.response.email).toBe(ownerDataJson.response.email);
    expect(bodyHimselfInfo.response.isAdmin).toBe(true);
    expect(bodyHimselfInfo.response.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  test("Owner receives information about another user via email.", async ({
    apiSdk,
  }) => {
    const docSpaceData = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const docSpaceDataJson = await docSpaceData.response.json();
    const docSpaceEmail = docSpaceDataJson.response.email;

    const userData = {
      email: [docSpaceEmail],
    };
    const response = await apiSdk.profiles.returnsUserInfoViaEmail(
      "owner",
      userData,
    );
    const bodyDocSpaceAdminInfo = await response.json();
    expect(bodyDocSpaceAdminInfo.statusCode).toBe(200);
    expect(bodyDocSpaceAdminInfo.response.firstName).toBe(
      docSpaceDataJson.response.firstName,
    );
    expect(bodyDocSpaceAdminInfo.response.lastName).toBe(
      docSpaceDataJson.response.lastName,
    );
    expect(bodyDocSpaceAdminInfo.response.displayName).toBe(
      docSpaceDataJson.response.displayName,
    );
    expect(bodyDocSpaceAdminInfo.response.email).toBe(
      docSpaceDataJson.response.email,
    );
    expect(bodyDocSpaceAdminInfo.response.isAdmin).toBe(true);
    expect(bodyDocSpaceAdminInfo.response.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  test("DocSpace admin receives information about himself via email.", async ({
    apiSdk,
    api,
  }) => {
    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    const docSpaceAdminData =
      await apiSdk.profiles.returnHimselfInformation("docSpaceAdmin");
    const docSpaceAdminDataJson = await docSpaceAdminData.json();
    const docSpaceAdminEmail = docSpaceAdminDataJson.response.email;

    const userData = {
      email: [docSpaceAdminEmail],
    };
    const response = await apiSdk.profiles.returnsUserInfoViaEmail(
      "docSpaceAdmin",
      userData,
    );
    const bodyHimselfInfo = await response.json();
    expect(bodyHimselfInfo.statusCode).toBe(200);
    expect(bodyHimselfInfo.response.firstName).toBe(
      docSpaceAdminDataJson.response.firstName,
    );
    expect(bodyHimselfInfo.response.lastName).toBe(
      docSpaceAdminDataJson.response.lastName,
    );
    expect(bodyHimselfInfo.response.displayName).toBe(
      docSpaceAdminDataJson.response.displayName,
    );
    expect(bodyHimselfInfo.response.email).toBe(
      docSpaceAdminDataJson.response.email,
    );
    expect(bodyHimselfInfo.response.isAdmin).toBe(true);
    expect(bodyHimselfInfo.response.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  test("DocSpace admin receives information about another user via email.", async ({
    apiSdk,
    api,
  }) => {
    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    const roomAdminData = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminDataJson = await roomAdminData.response.json();
    const roomAdminEmail = roomAdminDataJson.response.email;

    const userData = {
      email: [roomAdminEmail],
    };

    await api.auth.authenticateDocSpaceAdmin();
    const response = await apiSdk.profiles.returnsUserInfoViaEmail(
      "docSpaceAdmin",
      userData,
    );
    const bodyDocSpaceAdminInfo = await response.json();
    expect(bodyDocSpaceAdminInfo.statusCode).toBe(200);
    expect(bodyDocSpaceAdminInfo.response.firstName).toBe(
      roomAdminDataJson.response.firstName,
    );
    expect(bodyDocSpaceAdminInfo.response.lastName).toBe(
      roomAdminDataJson.response.lastName,
    );
    expect(bodyDocSpaceAdminInfo.response.displayName).toBe(
      roomAdminDataJson.response.displayName,
    );
    expect(bodyDocSpaceAdminInfo.response.email).toBe(
      roomAdminDataJson.response.email,
    );
    expect(bodyDocSpaceAdminInfo.response.isRoomAdmin).toBe(true);
    expect(bodyDocSpaceAdminInfo.response.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  test("Room admin receives information about another user via email.", async ({
    apiSdk,
    api,
  }) => {
    await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const userData = await apiSdk.profiles.addMember("owner", "User");
    const userJson = await userData.response.json();
    const userEmail = userJson.response.email;

    const userRequestData = {
      email: [userEmail],
    };

    await api.auth.authenticateRoomAdmin();
    const response = await apiSdk.profiles.returnsUserInfoViaEmail(
      "roomAdmin",
      userRequestData,
    );
    const userInfo = await response.json();
    expect(userInfo.statusCode).toBe(200);
    expect(userInfo.response.firstName).toBe(userJson.response.firstName);
    expect(userInfo.response.lastName).toBe(userJson.response.lastName);
    expect(userInfo.response.displayName).toBe(userJson.response.displayName);
    expect(userInfo.response.email).toBe(userJson.response.email);
    expect(userInfo.response.isCollaborator).toBe(true);
    expect(userInfo.response.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  test("User receives information about himself via email.", async ({
    apiSdk,
    api,
  }) => {
    await apiSdk.profiles.addMember("owner", "User");
    await api.auth.authenticateUser();

    const userData = await apiSdk.profiles.returnHimselfInformation("user");
    const userJson = await userData.json();
    const userEmail = userJson.response.email;

    const userRequestData = {
      email: [userEmail],
    };
    const response = await apiSdk.profiles.returnsUserInfoViaEmail(
      "user",
      userRequestData,
    );
    const bodyHimselfInfo = await response.json();
    expect(bodyHimselfInfo.statusCode).toBe(200);
    expect(bodyHimselfInfo.response.firstName).toBe(
      userJson.response.firstName,
    );
    expect(bodyHimselfInfo.response.lastName).toBe(userJson.response.lastName);
    expect(bodyHimselfInfo.response.displayName).toBe(
      userJson.response.displayName,
    );
    expect(bodyHimselfInfo.response.email).toBe(userJson.response.email);
    expect(bodyHimselfInfo.response.isCollaborator).toBe(true);
    expect(bodyHimselfInfo.response.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  test("Owner sent himself instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    const ownerData = await apiSdk.profiles.returnHimselfInformation("owner");
    const ownerJson = await ownerData.json();
    const ownerId = ownerJson.response.id;

    const ownerRequestData = {
      userId: ownerId,
      email: faker.internet.email(),
    };
    const response = await apiSdk.profiles.sendInstructionToChangeEmail(
      "owner",
      ownerRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(200);
    expect(dataResponse.response).toBe(
      "The email change instructions have been successfully sent",
    );

    const ownerReturn = {
      userId: ownerId,
      email: config.DOCSPACE_OWNER_EMAIL,
    };
    await apiSdk.profiles.sendInstructionToChangeEmail("owner", ownerReturn);
    await api.auth.authenticateOwner();
  });

  test("Owner sent DocSpace admin user instructions on how to change his email address", async ({
    apiSdk,
  }) => {
    const docSpaceAdminData = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const docSpaceAdminJson = await docSpaceAdminData.response.json();
    const docSpaceAdminId = docSpaceAdminJson.response.id;

    const ownerRequestData = {
      userId: docSpaceAdminId,
      email: faker.internet.email(),
    };
    const response = await apiSdk.profiles.sendInstructionToChangeEmail(
      "owner",
      ownerRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(200);
    expect(dataResponse.response).toBe(
      "The email change instructions have been successfully sent",
    );
  });

  test("Owner sent Room admin user instructions on how to change his email address", async ({
    apiSdk,
  }) => {
    const roomAdminData = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminJson = await roomAdminData.response.json();
    const roomAdminId = roomAdminJson.response.id;

    const ownerRequestData = {
      userId: roomAdminId,
      email: faker.internet.email(),
    };
    const response = await apiSdk.profiles.sendInstructionToChangeEmail(
      "owner",
      ownerRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(200);
    expect(dataResponse.response).toBe(
      "The email change instructions have been successfully sent",
    );
  });

  test("Owner sent user instructions on how to change his email address", async ({
    apiSdk,
  }) => {
    const userData = await apiSdk.profiles.addMember("owner", "User");
    const userJson = await userData.response.json();
    const userId = userJson.response.id;

    const ownerRequestData = {
      userId: userId,
      email: faker.internet.email(),
    };
    const response = await apiSdk.profiles.sendInstructionToChangeEmail(
      "owner",
      ownerRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(200);
    expect(dataResponse.response).toBe(
      "The email change instructions have been successfully sent",
    );
  });

  test("DocSpace admin sent instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    const docSpaceAdminData = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const docSpaceAdminJson = await docSpaceAdminData.response.json();
    const docSpaceAdminId = docSpaceAdminJson.response.id;
    await api.auth.authenticateDocSpaceAdmin();

    const docSpaceAdminRequestData = {
      userId: docSpaceAdminId,
      email: faker.internet.email(),
    };
    const response = await apiSdk.profiles.sendInstructionToChangeEmail(
      "docSpaceAdmin",
      docSpaceAdminRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(200);
    expect(dataResponse.response).toBe(
      "The email change instructions have been successfully sent",
    );
  });

  test("DocSpace admin sent Room admin user instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    const roomAdminData = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminJson = await roomAdminData.response.json();
    const roomAdminId = roomAdminJson.response.id;
    await api.auth.authenticateDocSpaceAdmin();

    const roomAdminRequestData = {
      userId: roomAdminId,
      email: faker.internet.email(),
    };
    const response = await apiSdk.profiles.sendInstructionToChangeEmail(
      "docSpaceAdmin",
      roomAdminRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(200);
    expect(dataResponse.response).toBe(
      "The email change instructions have been successfully sent",
    );
  });

  test("DocSpace admin sent User instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    const userData = await apiSdk.profiles.addMember("owner", "User");
    const userJson = await userData.response.json();
    const userId = userJson.response.id;
    await api.auth.authenticateDocSpaceAdmin();

    const userRequestData = {
      userId: userId,
      email: faker.internet.email(),
    };
    const response = await apiSdk.profiles.sendInstructionToChangeEmail(
      "docSpaceAdmin",
      userRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(200);
    expect(dataResponse.response).toBe(
      "The email change instructions have been successfully sent",
    );
  });

  test("Room admin sent instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    const roomAdminData = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminJson = await roomAdminData.response.json();
    const roomAdminId = roomAdminJson.response.id;
    await api.auth.authenticateRoomAdmin();

    const roomAdminRequestData = {
      userId: roomAdminId,
      email: faker.internet.email(),
    };
    const response = await apiSdk.profiles.sendInstructionToChangeEmail(
      "roomAdmin",
      roomAdminRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(200);
    expect(dataResponse.response).toBe(
      "The email change instructions have been successfully sent",
    );
  });

  test("User sent instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    const userData = await apiSdk.profiles.addMember("owner", "User");
    const userJson = await userData.response.json();
    const userId = userJson.response.id;
    await api.auth.authenticateUser();

    const userRequestData = {
      userId: userId,
      email: faker.internet.email(),
    };
    const response = await apiSdk.profiles.sendInstructionToChangeEmail(
      "user",
      userRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(200);
    expect(dataResponse.response).toBe(
      "The email change instructions have been successfully sent",
    );
  });

  test("Owner removes deactivated users", async ({ apiSdk }) => {
    const docSpaceAdmin = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const docSpaceAdminJson = await docSpaceAdmin.response.json();
    const docSpaceAdminId = docSpaceAdminJson.response.id;

    const roomAdmin = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminJson = await roomAdmin.response.json();
    const roomAdminId = roomAdminJson.response.id;

    const usersRequestData = {
      userIds: [docSpaceAdminId, roomAdminId],
      resendAll: false,
    };

    await apiSdk.userStatus.changeUserStatus(
      "owner",
      UserStatus.Disabled,
      usersRequestData,
    );
    const response = await apiSdk.profiles.deleteUsers(
      "owner",
      usersRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(200);
    expect(dataResponse.response[0].id).toBe(docSpaceAdminId);
    expect(dataResponse.response[1].id).toBe(roomAdminId);
    expect(dataResponse.response[0].status).toBe(2);
    expect(dataResponse.response[1].status).toBe(2);
    expect(dataResponse.response[0].isAdmin).toBe(true);
    expect(dataResponse.response[1].isRoomAdmin).toBe(true);
  });

  test("DocSpace admin removes deactivated users", async ({ apiSdk, api }) => {
    const roomAdmin = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminJson = await roomAdmin.response.json();
    const roomAdminId = roomAdminJson.response.id;

    const user = await apiSdk.profiles.addMember("owner", "User");
    const userJson = await user.response.json();
    const userId = userJson.response.id;

    const usersRequestData = {
      userIds: [roomAdminId, userId],
      resendAll: false,
    };

    await apiSdk.userStatus.changeUserStatus(
      "owner",
      UserStatus.Disabled,
      usersRequestData,
    );
    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();
    const response = await apiSdk.profiles.deleteUsers(
      "docSpaceAdmin",
      usersRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(200);
    expect(dataResponse.response[0].id).toBe(roomAdminId);
    expect(dataResponse.response[1].id).toBe(userId);
    expect(dataResponse.response[0].status).toBe(2);
    expect(dataResponse.response[1].status).toBe(2);
    expect(dataResponse.response[0].isRoomAdmin).toBe(true);
    expect(dataResponse.response[1].isCollaborator).toBe(true);
  });

  test("Owner update a culture code of himself", async ({ apiSdk }) => {
    const ownerData = await apiSdk.profiles.returnHimselfInformation("owner");
    const ownerJson = await ownerData.json();
    const ownerId = ownerJson.response.id;

    const ownerRequestData = {
      userId: ownerId,
      cultureName: "es",
    };
    const response = await apiSdk.profiles.updateCultureCode(
      "owner",
      ownerRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(200);
    expect(dataResponse.response.id).toBe(ownerId);
    expect(dataResponse.response.email).toBe(ownerJson.response.email);
    expect(dataResponse.response.firstName).toBe(ownerJson.response.firstName);
    expect(dataResponse.response.lastName).toBe(ownerJson.response.lastName);
    expect(dataResponse.response.cultureName).toBe("es");
  });

  test("DocSpace admin update a culture code of himself", async ({
    apiSdk,
    api,
  }) => {
    const docSpaceAdmin = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const docSpaceAdminJson = await docSpaceAdmin.response.json();
    const docSpaceAdminId = docSpaceAdminJson.response.id;

    const docSpaceAdminRequestData = {
      userId: docSpaceAdminId,
      cultureName: "es",
    };
    await api.auth.authenticateDocSpaceAdmin();
    const response = await apiSdk.profiles.updateCultureCode(
      "docSpaceAdmin",
      docSpaceAdminRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(200);
    expect(dataResponse.response.id).toBe(docSpaceAdminId);
    expect(dataResponse.response.email).toBe(docSpaceAdminJson.response.email);
    expect(dataResponse.response.firstName).toBe(
      docSpaceAdminJson.response.firstName,
    );
    expect(dataResponse.response.lastName).toBe(
      docSpaceAdminJson.response.lastName,
    );
    expect(dataResponse.response.cultureName).toBe("es");
  });

  test("Room admin update a culture code of himself", async ({
    apiSdk,
    api,
  }) => {
    const roomAdmin = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminJson = await roomAdmin.response.json();
    const roomAdminId = roomAdminJson.response.id;

    const roomAdminRequestData = {
      userId: roomAdminId,
      cultureName: "es",
    };
    await api.auth.authenticateRoomAdmin();
    const response = await apiSdk.profiles.updateCultureCode(
      "roomAdmin",
      roomAdminRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(200);
    expect(dataResponse.response.id).toBe(roomAdminId);
    expect(dataResponse.response.email).toBe(roomAdminJson.response.email);
    expect(dataResponse.response.firstName).toBe(
      roomAdminJson.response.firstName,
    );
    expect(dataResponse.response.lastName).toBe(
      roomAdminJson.response.lastName,
    );
    expect(dataResponse.response.cultureName).toBe("es");
  });

  test("User update a culture code of himself", async ({ apiSdk, api }) => {
    const user = await apiSdk.profiles.addMember("owner", "User");
    const userJson = await user.response.json();
    const userId = userJson.response.id;

    const userRequestData = {
      userId: userId,
      cultureName: "es",
    };
    await api.auth.authenticateUser();
    const response = await apiSdk.profiles.updateCultureCode(
      "user",
      userRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(200);
    expect(dataResponse.response.id).toBe(userId);
    expect(dataResponse.response.email).toBe(userJson.response.email);
    expect(dataResponse.response.firstName).toBe(userJson.response.firstName);
    expect(dataResponse.response.lastName).toBe(userJson.response.lastName);
    expect(dataResponse.response.cultureName).toBe("es");
  });
});
