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

  test("Adding a user without authorization", async ({ apiSdk }) => {
    const response = await apiSdk.profiles.addingAUserWithoutAuthorization();
    expect(response.status()).toBe(401);
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

  test("Return all users list without authorization", async ({ apiSdk }) => {
    const response =
      await apiSdk.profiles.returnAllUsersListWithoutAuthorization();
    expect(response.status()).toBe(401);
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

  test("Invite user for long email", async ({ apiSdk }) => {
    const localPart = faker.string.alpha({ length: 260, casing: "lower" });
    const domain = faker.internet.domainName();
    const userData = {
      type: "User",
      email: `${localPart}@${domain}`,
    };
    const response = await apiSdk.profiles.inviteUserForLongEmail(userData);
    const body = await response.json();
    expect(body.response.status).toBe(400);
    expect(body.response.errors?.["Invitations[0].Email"]?.[0]).toContain(
      "The field Email must be a string or array type with a maximum length of '255'.",
    );
  });

  test("Inviting a user without authorization", async ({ apiSdk }) => {
    const response = await apiSdk.profiles.invitingAUserWithoutAuthorization();
    expect(response.status()).toBe(401);
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
    expect(bodyResent.statusCode).toBe(403);
    expect(bodyResent.error).toContain("No permissions to perform this action");
  });

  test("Resending activation email by unauthorized user", async ({
    apiSdk,
  }) => {
    const response =
      await apiSdk.profiles.resendingActivationEmailByUnauthorizedUser();
    expect(response.status()).toBe(401);
  });

  //Bug 79560 - Fixed
  test("Owner deletes a non-deactivated user", async ({ apiSdk }) => {
    const user = await apiSdk.profiles.ownerAddMember("User");
    const response = await user.response.json();
    const userId = response.response.id;
    const userData = {
      userIds: [userId],
    };

    const responseDelete = await apiSdk.profiles.ownerDeleteUser(userData);
    const bodyDelete = await responseDelete.json();
    expect(bodyDelete.statusCode).toBe(403);
    expect(bodyDelete.error.message).toContain("The user is not suspended");
  });

  //Bug 79560 - Fixed
  test("DocSpace admin deletes a non-deactivated user", async ({
    apiSdk,
    api,
  }) => {
    const user = await apiSdk.profiles.ownerAddMember("User");
    const response = await user.response.json();
    const userId = response.response.id;
    const userData = {
      userIds: [userId],
    };

    await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    const responseDelete =
      await apiSdk.profiles.docSpaceAdminDeleteUser(userData);
    const bodyDelete = await responseDelete.json();
    expect(bodyDelete.statusCode).toBe(403);
    expect(bodyDelete.error.message).toContain("The user is not suspended");
  });

  test("Room admin deletes a non-deactivated user", async ({ apiSdk, api }) => {
    const user = await apiSdk.profiles.ownerAddMember("User");
    const response = await user.response.json();
    const userId = response.response.id;
    const userData = {
      userIds: [userId],
    };

    await apiSdk.profiles.ownerAddMember("RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    const responseDelete = await apiSdk.profiles.roomAdminDeleteUser(userData);
    const bodyDelete = await responseDelete.json();
    expect(bodyDelete.statusCode).toBe(403);
    expect(bodyDelete.error.message).toContain("Access denied");
  });

  test("User deletes a non-deactivated user", async ({ apiSdk, api }) => {
    const user = await apiSdk.profiles.ownerAddMember("User");
    const response = await user.response.json();
    const userId = response.response.id;
    const userData = {
      userIds: [userId],
    };

    await apiSdk.profiles.ownerAddMember("User");
    await api.auth.authenticateUser();

    const responseDelete = await apiSdk.profiles.userDeleteUser(userData);
    const bodyDelete = await responseDelete.json();
    expect(bodyDelete.statusCode).toBe(403);
    expect(bodyDelete.error.message).toContain("Access denied");
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

  test("Deleting a non-existent user", async ({ apiSdk }) => {
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
    await apiSdk.profiles.ownerDeleteUser(userDataDeleteUser);
    const responseDelete =
      await apiSdk.profiles.ownerDeleteUser(userDataDeleteUser);
    const bodyDelete = await responseDelete.json();
    expect(bodyDelete.statusCode).toBe(404);
    expect(bodyDelete.error.message).toContain("The user could not be found");
  });

  test("Deleting a user without authorization", async ({ apiSdk }) => {
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

    // Delete the disabled user
    const userDataDeleteUser = {
      userIds: [userIdToDelete],
    };

    const responseDelete =
      await apiSdk.profiles.deletingAUserWithoutAuthorization(
        userDataDeleteUser,
      );
    expect(responseDelete.status()).toBe(401);
  });

  test("Owner returns detailed information of a user", async ({ apiSdk }) => {
    const user = await apiSdk.profiles.ownerAddMember("RoomAdmin");
    const response = await user.response.json();
    const userId = response.response.id;

    const responseReturnInfo =
      await apiSdk.profiles.OwnerReturnUserDetailedInformation(userId);
    const bodyReturnInfo = await responseReturnInfo.json();
    expect(bodyReturnInfo.statusCode).toBe(200);
    expect(bodyReturnInfo.response.id).toBe(userId);
    expect(bodyReturnInfo.response.email).toBe(response.response.email);
  });

  test("Returns detailed information about a non-existent user", async ({
    apiSdk,
  }) => {
    const user = await apiSdk.profiles.ownerAddMember("RoomAdmin");
    const response = await user.response.json();
    const userId = response.response.id;

    const userDataChangeStatus = {
      userIds: [userId],
      resendAll: false,
    };

    await apiSdk.userStatus.changeUserStatus(
      UserStatus.Disabled,
      userDataChangeStatus,
    );

    const userDataDeleteUser = {
      userIds: [userId],
    };

    await apiSdk.profiles.ownerDeleteUser(userDataDeleteUser);

    const responseReturnInfo =
      await apiSdk.profiles.OwnerReturnUserDetailedInformation(userId);
    const bodyReturnInfo = await responseReturnInfo.json();
    expect(bodyReturnInfo.statusCode).toBe(404);
    expect(bodyReturnInfo.error.message).toContain(
      "The user could not be found",
    );
  });

  test("DocSpace admin returns detailed information of a user", async ({
    apiSdk,
    api,
  }) => {
    await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();
    const returnAllUsersList =
      await apiSdk.profiles.docSpaceAdminReturnAllUsersList();
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
      await apiSdk.profiles.DocSpaceAdminReturnUserDetailedInformation(userId);
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
    await apiSdk.profiles.ownerAddMember("RoomAdmin");
    await api.auth.authenticateRoomAdmin();
    const returnAllUsersList =
      await apiSdk.profiles.roomAdminReturnAllUsersList();
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
      await apiSdk.profiles.RoomAdminReturnUserDetailedInformation(userId);
    const bodyReturnInfo = await responseReturnInfo.json();
    expect(bodyReturnInfo.statusCode).toBe(200);
    expect(bodyReturnInfo.response.id).toBe(userId);
    expect(bodyReturnInfo.response.email).toBe(owner.email);
    expect(bodyReturnInfo.response.firstName).toBe(owner.firstName);
    expect(bodyReturnInfo.response.lastName).toBe(owner.lastName);
  });

  test("Returns detailed information of a user without authorization", async ({
    apiSdk,
  }) => {
    const user = await apiSdk.profiles.ownerAddMember("RoomAdmin");
    const response = await user.response.json();
    const userId = response.response.id;

    const responseReturnInfo =
      await apiSdk.profiles.returnUserDetailedInformationAboutAUsetWithoutAuthorization(
        userId,
      );
    expect(responseReturnInfo.status()).toBe(401);
  });

  test("Updating owner profile data", async ({ apiSdk }) => {
    const returnAllUsersList = await apiSdk.profiles.ownerReturnAllUsersList();
    const response = await returnAllUsersList.json();
    const userId = response.response[0].id;
    const userData = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const responseUpdateInfo = await apiSdk.profiles.ownerUpdatesData(
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

  test("Updating owner profile data without authorization", async ({
    apiSdk,
  }) => {
    const returnAllUsersList = await apiSdk.profiles.ownerReturnAllUsersList();
    const response = await returnAllUsersList.json();
    const userId = response.response[0].id;
    const userData = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const responseUpdateInfo =
      await apiSdk.profiles.updateUserDataWithoutAuthorization(
        userId,
        userData,
      );
    expect(responseUpdateInfo.status()).toBe(401);
  });

  test("Updating profile data non-existent user", async ({ apiSdk }) => {
    const user = await apiSdk.profiles.ownerAddMember("RoomAdmin");
    const response = await user.response.json();
    const userId = response.response.id;

    const userDataChangeStatus = {
      userIds: [userId],
      resendAll: false,
    };
    await apiSdk.userStatus.changeUserStatus(
      UserStatus.Disabled,
      userDataChangeStatus,
    );

    const userDataDeleteUser = {
      userIds: [userId],
    };
    await apiSdk.profiles.ownerDeleteUser(userDataDeleteUser);

    const userData = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };
    const responseUpdateInfo = await apiSdk.profiles.ownerUpdatesData(
      userId,
      userData,
    );
    const bodyUpdateInfo = await responseUpdateInfo.json();
    expect(bodyUpdateInfo.statusCode).toBe(404);
    expect(bodyUpdateInfo.error.message).toContain(
      "The user could not be found",
    );
  });

  test("DocSpace admin updating profile data owner", async ({
    apiSdk,
    api,
  }) => {
    const returnAllUsersList = await apiSdk.profiles.ownerReturnAllUsersList();
    const response = await returnAllUsersList.json();
    const userId = response.response[0].id;

    await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    const userData = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };
    const responseUpdateInfo =
      await apiSdk.profiles.docSpaceAdminUpdateUserData(userId, userData);
    const bodyUpdateInfo = await responseUpdateInfo.json();
    expect(bodyUpdateInfo.statusCode).toBe(403);
    expect(bodyUpdateInfo.error.message).toContain("Access denied");
  });

  test("Room admin updating profile data owner", async ({ apiSdk, api }) => {
    const returnAllUsersList = await apiSdk.profiles.ownerReturnAllUsersList();
    const response = await returnAllUsersList.json();
    const userId = response.response[0].id;

    await apiSdk.profiles.ownerAddMember("RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    const userData = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };
    const responseUpdateInfo = await apiSdk.profiles.roomAdminUpdateUserData(
      userId,
      userData,
    );
    const bodyUpdateInfo = await responseUpdateInfo.json();
    expect(bodyUpdateInfo.statusCode).toBe(403);
    expect(bodyUpdateInfo.error.message).toContain("Access denied");
  });

  test("User updating profile data owner", async ({ apiSdk, api }) => {
    const returnAllUsersList = await apiSdk.profiles.ownerReturnAllUsersList();
    const response = await returnAllUsersList.json();
    const userId = response.response[0].id;

    await apiSdk.profiles.ownerAddMember("User");
    await api.auth.authenticateUser();

    const userData = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };
    const responseUpdateInfo = await apiSdk.profiles.userUpdateUserData(
      userId,
      userData,
    );
    const bodyUpdateInfo = await responseUpdateInfo.json();
    expect(bodyUpdateInfo.statusCode).toBe(403);
    expect(bodyUpdateInfo.error.message).toContain("Access denied");
  });

  test("Updating owner profile data with incorrect name", async ({
    apiSdk,
  }) => {
    const returnAllUsersList = await apiSdk.profiles.ownerReturnAllUsersList();
    const response = await returnAllUsersList.json();
    const userId = response.response[0].id;
    const incorrectName = faker.number.int({ min: 1, max: 10 });
    const userData = {
      firstName: incorrectName.toString(),
      lastName: faker.person.lastName(),
    };

    const responseUpdateInfo = await apiSdk.profiles.ownerUpdatesData(
      userId,
      userData,
    );
    const bodyUpdateInfo = await responseUpdateInfo.json();
    expect(bodyUpdateInfo.statusCode).toBe(400);
    expect(bodyUpdateInfo.error.message).toContain(
      "Incorrect firstname or lastname",
    );
  });

  test("Updating DocSpace admin profile data", async ({ apiSdk, api }) => {
    const user = await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    const response = await user.response.json();
    const userId = response.response.id;
    await api.auth.authenticateDocSpaceAdmin();

    const userData = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const responseUpdateInfo =
      await apiSdk.profiles.docSpaceAdminUpdateUserData(userId, userData);
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
    const user = await apiSdk.profiles.ownerAddMember("RoomAdmin");
    const response = await user.response.json();
    const userId = response.response.id;
    await api.auth.authenticateRoomAdmin();

    const userData = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const responseUpdateInfo = await apiSdk.profiles.roomAdminUpdateUserData(
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

  test("Updating user profile data", async ({ apiSdk, api }) => {
    const user = await apiSdk.profiles.ownerAddMember("User");
    const response = await user.response.json();
    const userId = response.response.id;
    await api.auth.authenticateUser();

    const userData = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const responseUpdateInfo = await apiSdk.profiles.userUpdateUserData(
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

  test("Updating user profile data with incorrect data", async ({
    apiSdk,
    api,
  }) => {
    const user = await apiSdk.profiles.ownerAddMember("User");
    const response = await user.response.json();
    const userId = response.response.id;
    await api.auth.authenticateUser();

    const userData = {
      firstName: apiSdk.faker.generateString(260),
      lastName: apiSdk.faker.generateString(260),
    };

    const responseUpdateInfo = await apiSdk.profiles.userUpdateUserData(
      userId,
      userData,
    );
    const bodyUpdateInfo = await responseUpdateInfo.json();
    expect(bodyUpdateInfo.response.status).toBe(400);
    expect(bodyUpdateInfo.response.errors["UpdateMember.FirstName"]).toContain(
      "The field FirstName must be a string with a maximum length of 255.",
    );
    expect(bodyUpdateInfo.response.errors["UpdateMember.LastName"]).toContain(
      "The field LastName must be a string with a maximum length of 255.",
    );
  });

  test("Owner receives information about himself", async ({ apiSdk }) => {
    const response = await apiSdk.profiles.ownerReturnHimselfInformation();
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
    const user = await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    const docSpaceAdminInfo = await user.response.json();
    await api.auth.authenticateDocSpaceAdmin();
    const response =
      await apiSdk.profiles.docSpaceAdminReturnHimselfInformation();
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
    const user = await apiSdk.profiles.ownerAddMember("RoomAdmin");
    const roomAdminInfo = await user.response.json();
    await api.auth.authenticateRoomAdmin();
    const response = await apiSdk.profiles.roomAdminReturnHimselfInformation();
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
    const user = await apiSdk.profiles.ownerAddMember("User");
    const userInfo = await user.response.json();
    await api.auth.authenticateUser();
    const response = await apiSdk.profiles.userReturnHimselfInformation();
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
    const ownerData = await apiSdk.profiles.ownerReturnHimselfInformation();
    const ownerDataJson = await ownerData.json();
    const ownerEmail = ownerDataJson.response.email;

    const userData = {
      email: [ownerEmail],
    };
    const response =
      await apiSdk.profiles.ownerReturnsUserInfoViaEmail(userData);
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
    const docSpaceData = await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    const docSpaceDataJson = await docSpaceData.response.json();
    const docSpaceEmail = docSpaceDataJson.response.email;

    const userData = {
      email: [docSpaceEmail],
    };
    const response =
      await apiSdk.profiles.ownerReturnsUserInfoViaEmail(userData);
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

  test("Receives information about another user via email without authorization.", async ({
    apiSdk,
  }) => {
    const ownerData = await apiSdk.profiles.ownerReturnHimselfInformation();
    const ownerDataJson = await ownerData.json();
    const ownerEmail = ownerDataJson.response.email;

    const userData = {
      email: [ownerEmail],
    };
    const response =
      await apiSdk.profiles.returnsUserInfoViaEmailWithoutAuthorization(
        userData,
      );
    expect(response.status()).toBe(401);
  });

  test("Receives information about another user via email with a non-existent user", async ({
    apiSdk,
  }) => {
    const user = await apiSdk.profiles.ownerAddMember("RoomAdmin");
    const response = await user.response.json();
    const userId = response.response.id;
    const docSpaceEmail = response.response.email;

    const userData = {
      email: [docSpaceEmail],
    };

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
    await apiSdk.profiles.ownerDeleteUser(userDataDeleteUser);
    const responseDelete =
      await apiSdk.profiles.ownerReturnsUserInfoViaEmail(userData);
    const bodyDelete = await responseDelete.json();
    expect(bodyDelete.statusCode).toBe(404);
    expect(bodyDelete.error.message).toContain("The user could not be found");
  });

  test("DocSpace admin receives information about himself via email.", async ({
    apiSdk,
    api,
  }) => {
    await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    const docSpaceAdminData =
      await apiSdk.profiles.docSpaceAdminReturnHimselfInformation();
    const docSpaceAdminDataJson = await docSpaceAdminData.json();
    const docSpaceAdminEmail = docSpaceAdminDataJson.response.email;

    const userData = {
      email: [docSpaceAdminEmail],
    };
    const response =
      await apiSdk.profiles.docSpaceAdminReturnsUserInfoViaEmail(userData);
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
    await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    const roomAdminData = await apiSdk.profiles.ownerAddMember("RoomAdmin");
    const roomAdminDataJson = await roomAdminData.response.json();
    const roomAdminEmail = roomAdminDataJson.response.email;

    const userData = {
      email: [roomAdminEmail],
    };

    await api.auth.authenticateDocSpaceAdmin();
    const response =
      await apiSdk.profiles.docSpaceAdminReturnsUserInfoViaEmail(userData);
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
    await apiSdk.profiles.ownerAddMember("RoomAdmin");
    const userData = await apiSdk.profiles.ownerAddMember("User");
    const userJson = await userData.response.json();
    const userEmail = userJson.response.email;

    const userRequestData = {
      email: [userEmail],
    };

    await api.auth.authenticateRoomAdmin();
    const response =
      await apiSdk.profiles.roomAdminReturnsUserInfoViaEmail(userRequestData);
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
    await apiSdk.profiles.ownerAddMember("User");
    await api.auth.authenticateUser();

    const userData = await apiSdk.profiles.userReturnHimselfInformation();
    const userJson = await userData.json();
    const userEmail = userJson.response.email;

    const userRequestData = {
      email: [userEmail],
    };
    const response =
      await apiSdk.profiles.userReturnsUserInfoViaEmail(userRequestData);
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

  test("User receives information about another user via email.", async ({
    apiSdk,
    api,
  }) => {
    await apiSdk.profiles.ownerAddMember("User");
    const roomAdminData = await apiSdk.profiles.ownerAddMember("RoomAdmin");
    const roomAdminJson = await roomAdminData.response.json();
    const roomAdminEmail = roomAdminJson.response.email;

    const userRequestData = {
      email: [roomAdminEmail],
    };

    await api.auth.authenticateUser();
    const response =
      await apiSdk.profiles.userReturnsUserInfoViaEmail(userRequestData);
    const userInfo = await response.json();
    expect(userInfo.statusCode).toBe(403);
    expect(userInfo.error.message).toContain("Access denied");
  });

  test("Owner sent himself instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    const ownerData = await apiSdk.profiles.ownerReturnHimselfInformation();
    const ownerJson = await ownerData.json();
    const ownerId = ownerJson.response.id;

    const ownerRequestData = {
      userId: ownerId,
      email: faker.internet.email(),
    };
    const response =
      await apiSdk.profiles.ownerSendInstructionToChangeEmail(ownerRequestData);
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(200);
    expect(dataResponse.response).toBe(
      "The email change instructions have been successfully sent",
    );

    const ownerReturn = {
      userId: ownerId,
      email: config.DOCSPACE_OWNER_EMAIL,
    };
    await apiSdk.profiles.ownerSendInstructionToChangeEmail(ownerReturn);
    await api.auth.authenticateOwner();
  });

  test("Owner sent DocSpace admin user instructions on how to change his email address", async ({
    apiSdk,
  }) => {
    const docSpaceAdminData =
      await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    const docSpaceAdminJson = await docSpaceAdminData.response.json();
    const docSpaceAdminId = docSpaceAdminJson.response.id;

    const ownerRequestData = {
      userId: docSpaceAdminId,
      email: faker.internet.email(),
    };
    const response =
      await apiSdk.profiles.ownerSendInstructionToChangeEmail(ownerRequestData);
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(200);
    expect(dataResponse.response).toBe(
      "The email change instructions have been successfully sent",
    );
  });

  test("Owner sent Room admin user instructions on how to change his email address", async ({
    apiSdk,
  }) => {
    const roomAdminData = await apiSdk.profiles.ownerAddMember("RoomAdmin");
    const roomAdminJson = await roomAdminData.response.json();
    const roomAdminId = roomAdminJson.response.id;

    const ownerRequestData = {
      userId: roomAdminId,
      email: faker.internet.email(),
    };
    const response =
      await apiSdk.profiles.ownerSendInstructionToChangeEmail(ownerRequestData);
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(200);
    expect(dataResponse.response).toBe(
      "The email change instructions have been successfully sent",
    );
  });

  test("Owner sent user instructions on how to change his email address", async ({
    apiSdk,
  }) => {
    const userData = await apiSdk.profiles.ownerAddMember("User");
    const userJson = await userData.response.json();
    const userId = userJson.response.id;

    const ownerRequestData = {
      userId: userId,
      email: faker.internet.email(),
    };
    const response =
      await apiSdk.profiles.ownerSendInstructionToChangeEmail(ownerRequestData);
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(200);
    expect(dataResponse.response).toBe(
      "The email change instructions have been successfully sent",
    );
  });

  test("Sent instructions on changing an email address to a non-existent user", async ({
    apiSdk,
  }) => {
    const userId = faker.string.uuid();
    const ownerRequestData = {
      userId: userId,
      email: faker.internet.email(),
    };
    const response =
      await apiSdk.profiles.ownerSendInstructionToChangeEmail(ownerRequestData);
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(404);
    expect(dataResponse.error.message).toContain("The user could not be found");
  });

  test("Sent instructions on how to change your email address with an incorrect email address", async ({
    apiSdk,
  }) => {
    const userData = await apiSdk.profiles.ownerAddMember("User");
    const userJson = await userData.response.json();
    const userId = userJson.response.id;
    const incorrectEmail = apiSdk.faker.generateString(20);

    const ownerRequestData = {
      userId: userId,
      email: incorrectEmail,
    };
    const response =
      await apiSdk.profiles.ownerSendInstructionToChangeEmail(ownerRequestData);
    const dataResponse = await response.json();
    expect(dataResponse.response.status).toBe(400);
    expect(dataResponse.response.title).toContain(
      "One or more validation errors occurred.",
    );
    expect(dataResponse.response.errors.Email[0]).toContain(
      "The Email field is not a valid e-mail address.",
    );
  });

  test("DocSpace admin sent instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    const docSpaceAdminData =
      await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    const docSpaceAdminJson = await docSpaceAdminData.response.json();
    const docSpaceAdminId = docSpaceAdminJson.response.id;
    await api.auth.authenticateDocSpaceAdmin();

    const docSpaceAdminRequestData = {
      userId: docSpaceAdminId,
      email: faker.internet.email(),
    };
    const response =
      await apiSdk.profiles.docSpaceAdminSendInstructionToChangeEmail(
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
    await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    const roomAdminData = await apiSdk.profiles.ownerAddMember("RoomAdmin");
    const roomAdminJson = await roomAdminData.response.json();
    const roomAdminId = roomAdminJson.response.id;
    await api.auth.authenticateDocSpaceAdmin();

    const roomAdminRequestData = {
      userId: roomAdminId,
      email: faker.internet.email(),
    };
    const response =
      await apiSdk.profiles.docSpaceAdminSendInstructionToChangeEmail(
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
    await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    const userData = await apiSdk.profiles.ownerAddMember("User");
    const userJson = await userData.response.json();
    const userId = userJson.response.id;
    await api.auth.authenticateDocSpaceAdmin();

    const userRequestData = {
      userId: userId,
      email: faker.internet.email(),
    };
    const response =
      await apiSdk.profiles.docSpaceAdminSendInstructionToChangeEmail(
        userRequestData,
      );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(200);
    expect(dataResponse.response).toBe(
      "The email change instructions have been successfully sent",
    );
  });

  test("DocSpace admin sent DocSpace admin user instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    const docSpaceAdminData =
      await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    const docSpaceAdminJson = await docSpaceAdminData.response.json();
    const docSpaceAdminId = docSpaceAdminJson.response.id;
    await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    const docSpaceAdminRequestData = {
      userId: docSpaceAdminId,
      email: faker.internet.email(),
    };
    const response =
      await apiSdk.profiles.docSpaceAdminSendInstructionToChangeEmail(
        docSpaceAdminRequestData,
      );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(403);
    expect(dataResponse.error.message).toBe("Access denied");
  });

  test("DocSpace admin sent Owner user instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    const ownerData = await apiSdk.profiles.ownerReturnHimselfInformation();
    const ownerJson = await ownerData.json();
    const ownerId = ownerJson.response.id;
    await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    const ownerRequestData = {
      userId: ownerId,
      email: faker.internet.email(),
    };
    const response =
      await apiSdk.profiles.docSpaceAdminSendInstructionToChangeEmail(
        ownerRequestData,
      );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(403);
    expect(dataResponse.error.message).toBe("Access denied");
  });

  test("Room admin sent instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    const roomAdminData = await apiSdk.profiles.ownerAddMember("RoomAdmin");
    const roomAdminJson = await roomAdminData.response.json();
    const roomAdminId = roomAdminJson.response.id;
    await api.auth.authenticateRoomAdmin();

    const roomAdminRequestData = {
      userId: roomAdminId,
      email: faker.internet.email(),
    };
    const response =
      await apiSdk.profiles.roomAdminSendInstructionToChangeEmail(
        roomAdminRequestData,
      );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(200);
    expect(dataResponse.response).toBe(
      "The email change instructions have been successfully sent",
    );
  });

  test("Room admin sent Owner user instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    const ownerData = await apiSdk.profiles.ownerReturnHimselfInformation();
    const ownerJson = await ownerData.json();
    const ownerId = ownerJson.response.id;
    await apiSdk.profiles.ownerAddMember("RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    const ownerRequestData = {
      userId: ownerId,
      email: faker.internet.email(),
    };
    const response =
      await apiSdk.profiles.roomAdminSendInstructionToChangeEmail(
        ownerRequestData,
      );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(403);
    expect(dataResponse.error.message).toBe("Access denied");
  });

  test("Room admin sent DocSpace admin user instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    const docSpaceAdminData =
      await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    const docSpaceAdminJson = await docSpaceAdminData.response.json();
    const docSpaceAdminId = docSpaceAdminJson.response.id;
    await apiSdk.profiles.ownerAddMember("RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    const docSpaceAdminRequestData = {
      userId: docSpaceAdminId,
      email: faker.internet.email(),
    };
    const response =
      await apiSdk.profiles.roomAdminSendInstructionToChangeEmail(
        docSpaceAdminRequestData,
      );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(403);
    expect(dataResponse.error.message).toBe("Access denied");
  });

  test("Room admin sent Room admin user instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    const roomAdminData = await apiSdk.profiles.ownerAddMember("RoomAdmin");
    const roomAdminJson = await roomAdminData.response.json();
    const roomAdminId = roomAdminJson.response.id;
    await apiSdk.profiles.ownerAddMember("RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    const roomAdminRequestData = {
      userId: roomAdminId,
      email: faker.internet.email(),
    };
    const response =
      await apiSdk.profiles.roomAdminSendInstructionToChangeEmail(
        roomAdminRequestData,
      );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(403);
    expect(dataResponse.error.message).toBe("Access denied");
  });

  test("Room admin sent User instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    await apiSdk.profiles.ownerAddMember("RoomAdmin");
    const userData = await apiSdk.profiles.ownerAddMember("User");
    const userJson = await userData.response.json();
    const userId = userJson.response.id;
    await api.auth.authenticateRoomAdmin();

    const userRequestData = {
      userId: userId,
      email: faker.internet.email(),
    };
    const response =
      await apiSdk.profiles.roomAdminSendInstructionToChangeEmail(
        userRequestData,
      );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(403);
    expect(dataResponse.error.message).toBe("Access denied");
  });

  test("User sent instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    const userData = await apiSdk.profiles.ownerAddMember("User");
    const userJson = await userData.response.json();
    const userId = userJson.response.id;
    await api.auth.authenticateUser();

    const userRequestData = {
      userId: userId,
      email: faker.internet.email(),
    };
    const response =
      await apiSdk.profiles.userSendInstructionToChangeEmail(userRequestData);
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(200);
    expect(dataResponse.response).toBe(
      "The email change instructions have been successfully sent",
    );
  });

  test("User sent Owner user instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    const ownerData = await apiSdk.profiles.ownerReturnHimselfInformation();
    const ownerJson = await ownerData.json();
    const ownerId = ownerJson.response.id;
    await apiSdk.profiles.ownerAddMember("User");
    await api.auth.authenticateUser();

    const ownerRequestData = {
      userId: ownerId,
      email: faker.internet.email(),
    };
    const response =
      await apiSdk.profiles.userSendInstructionToChangeEmail(ownerRequestData);
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(403);
    expect(dataResponse.error.message).toBe("Access denied");
  });

  test("User sent DocSpace admin user instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    const docSpaceAdminData =
      await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    const docSpaceAdminJson = await docSpaceAdminData.response.json();
    const docSpaceAdminId = docSpaceAdminJson.response.id;
    await apiSdk.profiles.ownerAddMember("User");
    await api.auth.authenticateUser();

    const docSpaceAdminRequestData = {
      userId: docSpaceAdminId,
      email: faker.internet.email(),
    };
    const response = await apiSdk.profiles.userSendInstructionToChangeEmail(
      docSpaceAdminRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(403);
    expect(dataResponse.error.message).toBe("Access denied");
  });

  test("User sent Room admin user instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    const roomAdminData = await apiSdk.profiles.ownerAddMember("RoomAdmin");
    const roomAdminJson = await roomAdminData.response.json();
    const roomAdminId = roomAdminJson.response.id;
    await apiSdk.profiles.ownerAddMember("User");
    await api.auth.authenticateUser();

    const roomAdminRequestData = {
      userId: roomAdminId,
      email: faker.internet.email(),
    };
    const response =
      await apiSdk.profiles.userSendInstructionToChangeEmail(
        roomAdminRequestData,
      );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(403);
    expect(dataResponse.error.message).toBe("Access denied");
  });

  test("User sent User user instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    const userData = await apiSdk.profiles.ownerAddMember("User");
    const userJson = await userData.response.json();
    const userId = userJson.response.id;
    await apiSdk.profiles.ownerAddMember("User");
    await api.auth.authenticateUser();

    const userRequestData = {
      userId: userId,
      email: faker.internet.email(),
    };
    const response =
      await apiSdk.profiles.userSendInstructionToChangeEmail(userRequestData);
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(403);
    expect(dataResponse.error.message).toBe("Access denied");
  });

  test("Sent instructions on how to change email address without authorization", async ({
    apiSdk,
  }) => {
    const ownerData = await apiSdk.profiles.ownerReturnHimselfInformation();
    const ownerJson = await ownerData.json();
    const ownerId = ownerJson.response.id;

    const ownerRequestData = {
      userId: ownerId,
      email: faker.internet.email(),
    };
    const response =
      await apiSdk.profiles.sendInstructionToChangeEmailWithoutAuthorization(
        ownerRequestData,
      );
    expect(response.status()).toBe(401);
  });

  // TODO: Add tests from other users for the GET /api/2.0/people/email method
});
