import { expect } from "@playwright/test";
import { test } from "@/src/fixtures/index";
import { faker } from "@faker-js/faker";
import config from "@/config";

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
  /*
  toDo - write tests for different types of users:
  - User (collaborator)
  - Room Admin 
  - DocSpace Admin
  - Owner
  */

  test("Owner create User", async ({ apiSdk }) => {
    const { response } = await apiSdk.profiles.addMemberUser();
    const body = await response.json();
    expect(response.status()).toBe(200);
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
    const { response } = await apiSdk.profiles.addMemberRoomAdmin();
    const body = await response.json();
    expect(response.status()).toBe(200);
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
    const { response } = await apiSdk.profiles.addMemberDocSpaceAdmin();
    const body = await response.json();
    expect(response.status()).toBe(200);
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
      firstName: faker.string.alpha({ length: 260 }),
      lastName: faker.string.alpha({ length: 260 }),
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
    const localPart = faker.string.alpha({ length: 260, casing: "lower" });
    const domain = faker.internet.domainName();
    const userData = {
      password: faker.internet.password({ length: 12 }),
      email: `${localPart}@${domain}`,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      type: "User",
    };
    const response = await apiSdk.profiles.addUserForLongEmail(userData);
    const body = await response.json();
    expect(response.status()).toBe(400);
    expect(body.response.errors.Email).toContain(
      "The field Email must be a string with a maximum length of 255.",
    );
  });

  test("DocSpace admin creates DocSpace admin", async ({ apiSdk, api }) => {
    await apiSdk.profiles.addMemberDocSpaceAdmin();
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
    expect(response.status()).toBe(403);
    expect(body.error.message).toContain("Access denied");
  });

  test("DocSpace admin creates Room admin", async ({ apiSdk, api }) => {
    await apiSdk.profiles.addMemberDocSpaceAdmin();
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
    expect(response.status()).toBe(200);
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
    await apiSdk.profiles.addMemberDocSpaceAdmin();
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
    expect(response.status()).toBe(200);
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
    await apiSdk.profiles.addMemberRoomAdmin();
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
    expect(response.status()).toBe(403);
    expect(body.error.message).toContain("Access denied");
  });

  test("Room admin creates User", async ({ apiSdk, api }) => {
    await apiSdk.profiles.addMemberRoomAdmin();
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
    expect(response.status()).toBe(200);
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
    await apiSdk.profiles.addMemberUser();
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
    expect(response.status()).toBe(403);
    expect(body.error.message).toContain("Access denied");
  });

  test("Owner returns all users list", async ({ apiSdk }) => {
    const { userData: docSpaceAdminUserData } =
      await apiSdk.profiles.addMemberDocSpaceAdmin();
    const { userData: roomAdminUserData } =
      await apiSdk.profiles.addMemberRoomAdmin();
    const { userData: userUserData } = await apiSdk.profiles.addMemberUser();
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
      await apiSdk.profiles.addMemberDocSpaceAdmin();
    const { userData: roomAdminUserData } =
      await apiSdk.profiles.addMemberRoomAdmin();
    const { userData: userUserData } = await apiSdk.profiles.addMemberUser();
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
      await apiSdk.profiles.addMemberDocSpaceAdmin();
    const { userData: roomAdminUserData } =
      await apiSdk.profiles.addMemberRoomAdmin();
    const { userData: userUserData } = await apiSdk.profiles.addMemberUser();
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
    await apiSdk.profiles.addMemberDocSpaceAdmin();
    await apiSdk.profiles.addMemberRoomAdmin();
    await apiSdk.profiles.addMemberUser();
    await api.auth.authenticateUser();
    const response = await apiSdk.profiles.userReturnAllUsersList();
    const body = await response.json();
    expect(response.status()).toBe(403);
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
    expect(response.status()).toBe(200);
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
    expect(response.status()).toBe(200);
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
    expect(response.status()).toBe(200);
    expect(invitedUser.displayName).toBe(userData.email);
    expect(invitedUser.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(body.count).toBe(1);
    expect(invitedUser.hasAvatar).toBe(false);
    expect(invitedUser.isAnonim).toBe(false);
  });

  test("DocSpace admin invites room admin", async ({ apiSdk, api }) => {
    await apiSdk.profiles.addMemberDocSpaceAdmin();
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
    expect(response.status()).toBe(200);
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
    await apiSdk.profiles.addMemberDocSpaceAdmin();
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
    expect(response.status()).toBe(200);
    expect(invitedUser).toBeDefined();
    expect(invitedUser.displayName).toBe(email);
    expect(invitedUser.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(body.count).toBe(2);
    expect(invitedUser.hasAvatar).toBe(false);
    expect(invitedUser.isAnonim).toBe(false);
  });

  // TODO: Bug 79500
  test.skip("DocSpace admin invites docspace admin", async ({
    apiSdk,
    api,
  }) => {
    await apiSdk.profiles.addMemberDocSpaceAdmin();
    await api.auth.authenticateDocSpaceAdmin();

    const userData = {
      type: "DocSpaceAdmin",
      email: faker.internet.email(),
    };

    const response = await apiSdk.profiles.docSpaceAdminInviteUser(userData);
    const body = await response.json();
    console.log(body);
    expect(response.status()).toBe(403);
    expect(body.error.message).toContain(
      "No permissions to perform this action",
    );
  });

  test("Room admin invites user", async ({ apiSdk, api }) => {
    await apiSdk.profiles.addMemberRoomAdmin();
    await api.auth.authenticateRoomAdmin();

    const userData = {
      type: "User",
      email: faker.internet.email(),
    };

    const response = await apiSdk.profiles.roomAdminInviteUser(userData);
    const body = await response.json();
    expect(response.status()).toBe(200);
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

  // TODO: Bug 79500
  test.skip("Room admin invites room admin", async ({ apiSdk, api }) => {
    await apiSdk.profiles.addMemberRoomAdmin();
    await api.auth.authenticateRoomAdmin();

    const userData = {
      type: "RoomAdmin",
      email: faker.internet.email(),
    };

    const response = await apiSdk.profiles.roomAdminInviteUser(userData);
    const body = await response.json();
    console.log(body);
    expect(response.status()).toBe(403);
    expect(body.error.message).toContain(
      "No permissions to perform this action",
    );
  });

  // TODO: Bug 79500
  test.skip("User invites user", async ({ apiSdk, api }) => {
    await apiSdk.profiles.addMemberUser();
    await api.auth.authenticateUser();

    const userData = {
      type: "User",
      email: faker.internet.email(),
    };

    const response = await apiSdk.profiles.userInviteUser(userData);
    const body = await response.json();
    console.log(body);
    expect(response.status()).toBe(403);
    expect(body.error.message).toContain(
      "No permissions to perform this action",
    );
  });

  // TODO: Bug 79500
  test.skip("Invite user for long email", async ({ apiSdk }) => {
    const localPart = faker.string.alpha({ length: 260, casing: "lower" });
    const domain = faker.internet.domainName();
    const userData = {
      type: "User",
      email: `${localPart}@${domain}`,
    };
    const response = await apiSdk.profiles.inviteUserForLongEmail(userData);
    const body = await response.json();
    expect(response.status()).toBe(400);
    expect(body.response.errors.Email).toContain(
      "The field Email must be a string with a maximum length of 255.",
    );
  });

  test("Resend activation emails ", async ({ apiSdk }) => {
    const email = faker.internet.email();
    const response = await apiSdk.profiles.ownerInviteUser({
      type: "DocSpaceAdmin",
      email,
    });
    const body = await response.json();
    const invitedUser = body.response[0];

    const userData = {
      userIds: [invitedUser.id],
      resendAll: true,
    };

    const responseResent =
      await apiSdk.profiles.resendActavationEmails(userData);
    const bodyResent = await responseResent.json();
    const resendUser = bodyResent.response[0];
    expect(responseResent.status()).toBe(200);
    expect(resendUser.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(resendUser.email).toBe(email);
    expect(resendUser.hasAvatar).toBe(false);
    expect(resendUser.isAnonim).toBe(false);
    expect(resendUser.status).toBe(4);
    expect(resendUser.activationStatus).toBe(2);
  });
});
