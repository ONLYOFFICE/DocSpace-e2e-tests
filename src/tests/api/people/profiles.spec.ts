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
  test("Owner create User", async ({ apiSdk }) => {
    const { response } = await apiSdk.profiles.ownerAddMember("User");
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
    const { response } = await apiSdk.profiles.ownerAddMember("RoomAdmin");
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
    const { response } = await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
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

  test("Owner create User for long first and last name", async ({ apiSdk }) => {
    const userData = {
      password: faker.internet.password({ length: 12 }),
      email: faker.internet.email(),
      firstName: apiSdk.faker.generateString(260),
      lastName: apiSdk.faker.generateString(260),
      type: "User",
    };
    const response =
      await apiSdk.profiles.addUserForLongFirstAndLastName(userData);
    const body = await response.json();
    expect(response.status()).toBe(400);
    expect(body.response.errors.FirstName).toContain(
      "The field FirstName must be a string with a maximum length of 255.",
    );
    expect(body.response.errors.LastName).toContain(
      "The field LastName must be a string with a maximum length of 255.",
    );
  });

  test("Owner create User for long email", async ({ apiSdk }) => {
    const email = apiSdk.faker.generateEmailWithLength(260);
    const userData = {
      password: faker.internet.password({ length: 12 }),
      email,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      type: "User",
    };
    const response = await apiSdk.profiles.addUserForLongEmail(userData);
    const body = await response.json();
    expect(body.statusCode).toBe(200);
    expect(response.status()).toBe(400);
    expect(body.response.errors.Email).toContain(
      "The field Email must be a string with a maximum length of 255.",
    );
  });

  test("DocSpace admin creates DocSpace admin", async ({ apiSdk, api }) => {
    await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    const userData = {
      password: faker.internet.password({ length: 12 }),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      type: "DocSpaceAdmin",
    };

    const response = await apiSdk.profiles.docSpaceAdminAddsUsers(userData);
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toContain("Access denied");
  });

  test("DocSpace admin creates Room admin", async ({ apiSdk, api }) => {
    await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    const userData = {
      password: faker.internet.password({ length: 12 }),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      type: "RoomAdmin",
    };

    const response = await apiSdk.profiles.docSpaceAdminAddsUsers(userData);
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
    await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    const userData = {
      password: faker.internet.password({ length: 12 }),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      type: "User",
    };

    const response = await apiSdk.profiles.docSpaceAdminAddsUsers(userData);
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

  test("Room admin creates Room admin", async ({ apiSdk, api }) => {
    await apiSdk.profiles.ownerAddMember("RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    const userData = {
      password: faker.internet.password({ length: 12 }),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      type: "RoomAdmin",
    };

    const response = await apiSdk.profiles.roomAdminAddsDocSpaceUser(userData);
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toContain("Access denied");
  });

  test("Room admin creates User", async ({ apiSdk, api }) => {
    await apiSdk.profiles.ownerAddMember("RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    const userData = {
      password: faker.internet.password({ length: 12 }),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      type: "User",
    };

    const response = await apiSdk.profiles.roomAdminAddsUser(userData);
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

  test("User creates User", async ({ apiSdk, api }) => {
    await apiSdk.profiles.ownerAddMember("User");
    await api.auth.authenticateUser();

    const userData = {
      password: faker.internet.password({ length: 12 }),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      type: "User",
    };

    const response = await apiSdk.profiles.userAddsUser(userData);
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toContain("Access denied");
  });

  test("Owner returns all users list", async ({ apiSdk }) => {
    const { userData: docSpaceAdminUserData } =
      await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    const { userData: roomAdminUserData } =
      await apiSdk.profiles.ownerAddMember("RoomAdmin");
    const { userData: userUserData } =
      await apiSdk.profiles.ownerAddMember("User");
    const response = await apiSdk.profiles.ownerReturnAllUsersList();
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
    const { userData: docSpaceAdminUserData } =
      await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    const { userData: roomAdminUserData } =
      await apiSdk.profiles.ownerAddMember("RoomAdmin");
    const { userData: userUserData } =
      await apiSdk.profiles.ownerAddMember("User");
    await api.auth.authenticateDocSpaceAdmin();

    const response = await apiSdk.profiles.docSpaceAdminReturnAllUsersList();
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
    const { userData: docSpaceAdminUserData } =
      await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    const { userData: roomAdminUserData } =
      await apiSdk.profiles.ownerAddMember("RoomAdmin");
    const { userData: userUserData } =
      await apiSdk.profiles.ownerAddMember("User");
    await api.auth.authenticateRoomAdmin();

    const response = await apiSdk.profiles.roomAdminReturnAllUsersList();
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

  test("User returns all users list", async ({ apiSdk, api }) => {
    await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    await apiSdk.profiles.ownerAddMember("RoomAdmin");
    await apiSdk.profiles.ownerAddMember("User");
    await api.auth.authenticateUser();
    const response = await apiSdk.profiles.userReturnAllUsersList();
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toContain("Access denied");
  });

  test("Owner invites docspace admin", async ({ apiSdk }) => {
    const userData = {
      type: "DocSpaceAdmin",
      email: faker.internet.email(),
    };

    const response = await apiSdk.profiles.ownerInviteUser(userData);
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

    const response = await apiSdk.profiles.ownerInviteUser(userData);
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
    const userData = {
      type: "User",
      email: faker.internet.email(),
    };

    const response = await apiSdk.profiles.ownerInviteUser(userData);
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

  test("DocSpace admin invites room admin", async ({ apiSdk, api }) => {
    await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();
    const email = faker.internet.email();

    const response = await apiSdk.profiles.docSpaceAdminInviteUser({
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
    await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();
    const email = faker.internet.email();

    const response = await apiSdk.profiles.docSpaceAdminInviteUser({
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

  test("DocSpace admin invites docspace admin", async ({ apiSdk, api }) => {
    await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    const userData = {
      type: "DocSpaceAdmin",
      email: faker.internet.email(),
    };

    const response = await apiSdk.profiles.docSpaceAdminInviteUser(userData);
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toContain("Access denied");
  });

  test("Room admin invites user", async ({ apiSdk, api }) => {
    await apiSdk.profiles.ownerAddMember("RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    const userData = {
      type: "User",
      email: faker.internet.email(),
    };

    const response = await apiSdk.profiles.roomAdminInviteUser(userData);
    const body = await response.json();
    expect(body.statusCode).toBe(200);
    const invitedUser = body.response.find(
      (u: UsersListItem) => u.displayName === userData.email,
    );
    expect(invitedUser.displayName).toBe(userData.email);
    expect(invitedUser.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(body.count).toBe(2);
    expect(invitedUser.hasAvatar).toBe(false);
    expect(invitedUser.isAnonim).toBe(false);
  });

  test("Room admin invites room admin", async ({ apiSdk, api }) => {
    await apiSdk.profiles.ownerAddMember("RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    const userData = {
      type: "RoomAdmin",
      email: faker.internet.email(),
    };

    const response = await apiSdk.profiles.roomAdminInviteUser(userData);
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toContain("Access denied");
  });

  test("User invites user", async ({ apiSdk, api }) => {
    await apiSdk.profiles.ownerAddMember("User");
    await api.auth.authenticateUser();

    const userData = {
      type: "User",
      email: faker.internet.email(),
    };

    const response = await apiSdk.profiles.userInviteUser(userData);
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toContain("Access denied");
  });

  // TODO: Bug 79527 - Api: Incorrect response from POST method /api/2.0/people/invite when inviting a user with an email length exceeding the allowed values.
  test.skip("Invite user for long email", async ({ apiSdk }) => {
    const localPart = faker.string.alpha({ length: 260, casing: "lower" });
    const domain = faker.internet.domainName();
    const userData = {
      type: "User",
      email: `${localPart}@${domain}`,
    };
    const response = await apiSdk.profiles.inviteUserForLongEmail(userData);
    const body = await response.json();
    console.log(body);
    expect(body.statusCode).toBe(400);
    expect(body.error.message).toContain(
      "The field Email must be a string with a maximum length of 255.",
    );
  });

  test("Owner resend activation emails ", async ({ apiSdk }) => {
    const email = faker.internet.email();
    const response = await apiSdk.profiles.ownerInviteUser({
      type: "DocSpaceAdmin",
      email,
    });
    const body = await response.json();
    const invitedUser = body.response.find(
      (u: UsersListItem) => u.displayName === email,
    )!;

    const userData = {
      userIds: [invitedUser.id],
      resendAll: false,
    };

    const responseResent =
      await apiSdk.profiles.ownerResendActavationEmails(userData);
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
    await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    const email = faker.internet.email();
    const response = await apiSdk.profiles.docSpaceAdminInviteUser({
      type: "RoomAdmin",
      email,
    });
    const body = await response.json();
    const invitedUser = body.response.find(
      (u: UsersListItem) => u.displayName === email,
    )!;

    const userData = {
      userIds: [invitedUser.id],
      resendAll: false,
    };

    const responseResent =
      await apiSdk.profiles.docSpaceAdminResendActavationEmails(userData);
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
    await apiSdk.profiles.ownerAddMember("RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    const email = faker.internet.email();
    const response = await apiSdk.profiles.roomAdminInviteUser({
      type: "User",
      email,
    });
    const body = await response.json();
    const invitedUser = body.response.find(
      (u: UsersListItem) => u.displayName === email,
    )!;
    const userData = {
      userIds: [invitedUser.id],
      resendAll: false,
    };

    const responseResent =
      await apiSdk.profiles.roomAdminResendActavationEmails(userData);
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

  //Bug 79545 - Api: Incorrect response from the PUT /api/2.0/people/invite method when executed under the user's User.
  test.skip("User resend activation emails ", async ({ apiSdk, api }) => {
    await apiSdk.profiles.ownerAddMember("User");

    const email = faker.internet.email();
    const response = await apiSdk.profiles.ownerInviteUser({
      type: "User",
      email,
    });
    const body = await response.json();
    const invitedUser = body.response.find(
      (u: UsersListItem) => u.displayName === email,
    )!;
    const userData = {
      userIds: [invitedUser.id],
      resendAll: false,
    };

    await api.auth.authenticateUser();

    const responseResent =
      await apiSdk.profiles.UserResendActavationEmails(userData);
    const bodyResent = await responseResent.json();
    console.log(bodyResent);
    expect(bodyResent.statusCode).toBe(403);
    expect(bodyResent.error).toContain("No permissions to perform this action");
  });

  //Bug 79560 - Api: Method DELETE /api/2.0/people/:userid is not returning a valid response code when attempting to delete a non-deactivated user.
  test.skip("Owner deletes a non-deactivated user", async ({ apiSdk }) => {
    const user = await apiSdk.profiles.ownerAddMember("User");
    const response = await user.response.json();
    const userId = response.response.id;
    const userData = {
      userIds: [userId],
    };

    const responseDelete = await apiSdk.profiles.ownerDeleteUser(userData);
    const bodyDelete = await responseDelete.json();
    expect(bodyDelete.statusCode).toBe(500);
    expect(bodyDelete.error.message).toContain("The user is not suspended");
  });

  test("Owner deletes a deactivated user", async ({ apiSdk }) => {
    const user = await apiSdk.profiles.ownerAddMember("User");
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
      UserStatus.Disabled,
      userDataChangeStatus,
    );
    const responseDelete =
      await apiSdk.profiles.ownerDeleteUser(userDataDeleteUser);
    const bodyDelete = await responseDelete.json();
    expect(bodyDelete.statusCode).toBe(200);
    expect(bodyDelete.links[0].action).toBe("DELETE");
    expect(bodyDelete.response.id).toBe(userId);
  });

  test("Owner deletes a deactivated docspace admin", async ({ apiSdk }) => {
    const user = await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
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
      UserStatus.Disabled,
      userDataChangeStatus,
    );
    const responseDelete =
      await apiSdk.profiles.ownerDeleteUser(userDataDeleteUser);
    const bodyDelete = await responseDelete.json();
    expect(bodyDelete.statusCode).toBe(200);
    expect(bodyDelete.links[0].action).toBe("DELETE");
    expect(bodyDelete.response.id).toBe(userId);
  });

  test("Owner deletes a deactivated room admin", async ({ apiSdk }) => {
    const user = await apiSdk.profiles.ownerAddMember("RoomAdmin");
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
      UserStatus.Disabled,
      userDataChangeStatus,
    );
    const responseDelete =
      await apiSdk.profiles.ownerDeleteUser(userDataDeleteUser);
    const bodyDelete = await responseDelete.json();
    expect(bodyDelete.statusCode).toBe(200);
    expect(bodyDelete.links[0].action).toBe("DELETE");
    expect(bodyDelete.response.id).toBe(userId);
  });

  test("DocSpace admin deletes a deactivated docspace admin", async ({
    apiSdk,
    api,
  }) => {
    // Create first DocSpace admin that will be deleted
    const userToDelete = await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    const responseToDelete = await userToDelete.response.json();
    const userIdToDelete = responseToDelete.response.id;

    // Disable the first DocSpace admin
    const userDataChangeStatus = {
      userIds: [userIdToDelete],
      resendAll: false,
    };
    await apiSdk.userStatus.changeUserStatus(
      UserStatus.Disabled,
      userDataChangeStatus,
    );

    // Create second DocSpace admin that will perform the deletion
    await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    // Delete the disabled DocSpace admin
    const userDataDeleteUser = {
      userIds: [userIdToDelete],
    };

    const responseDelete =
      await apiSdk.profiles.docSpaceAdminDeleteUser(userDataDeleteUser);
    const bodyDelete = await responseDelete.json();
    expect(bodyDelete.statusCode).toBe(403);
    expect(bodyDelete.error.message).toContain("Access denied");
  });

  test("Room admin deletes a deactivated room admin", async ({
    apiSdk,
    api,
  }) => {
    // Create first Room admin that will be deleted
    const userToDelete = await apiSdk.profiles.ownerAddMember("RoomAdmin");
    const responseToDelete = await userToDelete.response.json();
    const userIdToDelete = responseToDelete.response.id;

    // Disable the first Room admin
    const userDataChangeStatus = {
      userIds: [userIdToDelete],
      resendAll: false,
    };
    await apiSdk.userStatus.changeUserStatus(
      UserStatus.Disabled,
      userDataChangeStatus,
    );

    // Create second Room admin that will perform the deletion
    await apiSdk.profiles.ownerAddMember("RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    // Delete the disabled Room admin
    const userDataDeleteUser = {
      userIds: [userIdToDelete],
    };

    const responseDelete =
      await apiSdk.profiles.roomAdminDeleteUser(userDataDeleteUser);
    const bodyDelete = await responseDelete.json();
    expect(bodyDelete.statusCode).toBe(403);
    expect(bodyDelete.error.message).toContain("Access denied");
  });

  test("User deletes a deactivated user", async ({ apiSdk, api }) => {
    // Create first User that will be deleted
    const userToDelete = await apiSdk.profiles.ownerAddMember("User");
    const responseToDelete = await userToDelete.response.json();
    const userIdToDelete = responseToDelete.response.id;

    // Disable the first User
    const userDataChangeStatus = {
      userIds: [userIdToDelete],
      resendAll: false,
    };
    await apiSdk.userStatus.changeUserStatus(
      UserStatus.Disabled,
      userDataChangeStatus,
    );

    // Create second User that will perform the deletion
    await apiSdk.profiles.ownerAddMember("User");
    await api.auth.authenticateUser();

    // Delete the disabled User
    const userDataDeleteUser = {
      userIds: [userIdToDelete],
    };

    const responseDelete =
      await apiSdk.profiles.userDeleteUser(userDataDeleteUser);
    const bodyDelete = await responseDelete.json();
    expect(bodyDelete.statusCode).toBe(403);
    expect(bodyDelete.error.message).toContain("Access denied");
  });

  test("DocSpace admin deletes a deactivated room admin", async ({
    apiSdk,
    api,
  }) => {
    // Create first DocSpace admin that will be deleted
    const userToDelete = await apiSdk.profiles.ownerAddMember("RoomAdmin");
    const responseToDelete = await userToDelete.response.json();
    const userIdToDelete = responseToDelete.response.id;

    // Disable the first DocSpace admin
    const userDataChangeStatus = {
      userIds: [userIdToDelete],
      resendAll: false,
    };
    await apiSdk.userStatus.changeUserStatus(
      UserStatus.Disabled,
      userDataChangeStatus,
    );

    // Create second DocSpace admin that will perform the deletion
    await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    // Delete the disabled DocSpace admin
    const userDataDeleteUser = {
      userIds: [userIdToDelete],
    };

    const responseDelete =
      await apiSdk.profiles.docSpaceAdminDeleteUser(userDataDeleteUser);
    const bodyDelete = await responseDelete.json();
    expect(bodyDelete.statusCode).toBe(200);
    expect(bodyDelete.links[0].action).toBe("DELETE");
    expect(bodyDelete.response.id).toBe(userIdToDelete);
  });

  test("DocSpace admin deletes a deactivated user", async ({ apiSdk, api }) => {
    // Create first DocSpace admin that will be deleted
    const userToDelete = await apiSdk.profiles.ownerAddMember("User");
    const responseToDelete = await userToDelete.response.json();
    const userIdToDelete = responseToDelete.response.id;

    // Disable the first DocSpace admin
    const userDataChangeStatus = {
      userIds: [userIdToDelete],
      resendAll: false,
    };
    await apiSdk.userStatus.changeUserStatus(
      UserStatus.Disabled,
      userDataChangeStatus,
    );

    // Create second DocSpace admin that will perform the deletion
    await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    // Delete the disabled DocSpace admin
    const userDataDeleteUser = {
      userIds: [userIdToDelete],
    };

    const responseDelete =
      await apiSdk.profiles.docSpaceAdminDeleteUser(userDataDeleteUser);
    const bodyDelete = await responseDelete.json();
    expect(bodyDelete.statusCode).toBe(200);
    expect(bodyDelete.links[0].action).toBe("DELETE");
    expect(bodyDelete.response.id).toBe(userIdToDelete);
  });

  test("Room admin deletes a deactivated user", async ({ apiSdk, api }) => {
    // Create first user that will be deleted
    const userToDelete = await apiSdk.profiles.ownerAddMember("User");
    const responseToDelete = await userToDelete.response.json();
    const userIdToDelete = responseToDelete.response.id;

    // Disable the first user
    const userDataChangeStatus = {
      userIds: [userIdToDelete],
      resendAll: false,
    };
    await apiSdk.userStatus.changeUserStatus(
      UserStatus.Disabled,
      userDataChangeStatus,
    );

    // Create second Room admin that will perform the deletion
    await apiSdk.profiles.ownerAddMember("RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    // Delete the disabled user
    const userDataDeleteUser = {
      userIds: [userIdToDelete],
    };

    const responseDelete =
      await apiSdk.profiles.roomAdminDeleteUser(userDataDeleteUser);
    const bodyDelete = await responseDelete.json();
    expect(bodyDelete.statusCode).toBe(403);
    expect(bodyDelete.error.message).toContain("Access denied");
  });
});
