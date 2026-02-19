// Tests that check user access rights.

import { expect } from "@playwright/test";
import { test } from "@/src/fixtures/index";
import { faker } from "@faker-js/faker";
import config from "@/config";
import { UserStatus } from "@/src/services/people/userStatus.services";

type UsersListItem = {
  email: string;
  displayName?: string;
  id: string;
};

test.describe("API profiling tests for access rights", () => {
  test("POST /people - Owner create User for long first and last name", async ({
    apiSdk,
  }) => {
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

  test("POST /people - Owner create User for long email", async ({
    apiSdk,
  }) => {
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

  test("POST /people - DocSpace admin creates DocSpace admin", async ({
    apiSdk,
    api,
  }) => {
    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    const { response } = await apiSdk.profiles.addMember(
      "docSpaceAdmin",
      "DocSpaceAdmin",
    );
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toContain("Access denied");
  });

  test("POST /people - Room admin creates Room admin", async ({
    apiSdk,
    api,
  }) => {
    await apiSdk.profiles.addMember("owner", "RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    const { response } = await apiSdk.profiles.addMember(
      "roomAdmin",
      "RoomAdmin",
    );
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toContain("Access denied");
  });

  test("POST /people - User creates User", async ({ apiSdk, api }) => {
    await apiSdk.profiles.addMember("owner", "User");
    await api.auth.authenticateUser();

    const { response } = await apiSdk.profiles.addMember("user", "User");
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toContain("Access denied");
  });

  test("POST /people - Adding a user without authorization", async ({
    apiSdk,
  }) => {
    const response = await apiSdk.profiles.addingAUserWithoutAuthorization();
    expect(response.status()).toBe(401);
  });

  test("GET /people - User returns all users list", async ({ apiSdk, api }) => {
    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await apiSdk.profiles.addMember("owner", "RoomAdmin");
    await apiSdk.profiles.addMember("owner", "User");
    await api.auth.authenticateUser();
    const response = await apiSdk.profiles.returnAllUsersList("user");
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toContain("Access denied");
  });

  test("GET /people - Guest returns all users list", async ({
    apiSdk,
    api,
  }) => {
    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await apiSdk.profiles.addMember("owner", "RoomAdmin");
    await apiSdk.profiles.addMember("owner", "User");
    await apiSdk.profiles.addMember("owner", "Guest");
    await api.auth.authenticateGuest();
    const response = await apiSdk.profiles.returnAllUsersList("guest");
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toContain("Access denied");
  });

  test("GET /people - Return all users list without authorization", async ({
    apiSdk,
  }) => {
    const response =
      await apiSdk.profiles.returnAllUsersListWithoutAuthorization();
    expect(response.status()).toBe(401);
  });

  test("POST /people/invite - Owner invites guest", async ({ apiSdk }) => {
    const userData = {
      type: "Guest",
      email: faker.internet.email(),
    };

    const response = await apiSdk.profiles.inviteUser("owner", userData);
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toContain("Access denied");
  });

  test("POST /people/invite - DocSpace admin invites guest", async ({
    apiSdk,
    api,
  }) => {
    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();
    const email = faker.internet.email();

    const response = await apiSdk.profiles.inviteUser("docSpaceAdmin", {
      type: "Guest",
      email,
    });
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toContain("Access denied");
  });

  test("POST /people/invite - Room admin invites guest", async ({
    apiSdk,
    api,
  }) => {
    await apiSdk.profiles.addMember("owner", "RoomAdmin");
    await api.auth.authenticateRoomAdmin();
    const email = faker.internet.email();

    const response = await apiSdk.profiles.inviteUser("roomAdmin", {
      type: "Guest",
      email,
    });
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toContain("Access denied");
  });

  test("POST /people/invite - User invites guest", async ({ apiSdk, api }) => {
    await apiSdk.profiles.addMember("owner", "User");
    await api.auth.authenticateUser();
    const email = faker.internet.email();

    const response = await apiSdk.profiles.inviteUser("user", {
      type: "Guest",
      email,
    });
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toContain("Access denied");
  });

  test("POST /people/invite - Guest invites guest", async ({ apiSdk, api }) => {
    await apiSdk.profiles.addMember("owner", "Guest");
    await api.auth.authenticateGuest();
    const email = faker.internet.email();

    const response = await apiSdk.profiles.inviteUser("guest", {
      type: "Guest",
      email,
    });
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toContain("Access denied");
  });

  test("POST /people/invite - DocSpace admin invites docspace admin", async ({
    apiSdk,
    api,
  }) => {
    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    const userData = {
      type: "DocSpaceAdmin",
      email: faker.internet.email(),
    };

    const response = await apiSdk.profiles.inviteUser(
      "docSpaceAdmin",
      userData,
    );
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toContain("Access denied");
  });

  test("POST /people/invite - Room admin invites room admin", async ({
    apiSdk,
    api,
  }) => {
    await apiSdk.profiles.addMember("owner", "RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    const userData = {
      type: "RoomAdmin",
      email: faker.internet.email(),
    };

    const response = await apiSdk.profiles.inviteUser("roomAdmin", userData);
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toContain("Access denied");
  });

  test("POST /people/invite - User invites user", async ({ apiSdk, api }) => {
    await apiSdk.profiles.addMember("owner", "User");
    await api.auth.authenticateUser();

    const userData = {
      type: "User",
      email: faker.internet.email(),
    };

    const response = await apiSdk.profiles.inviteUser("user", userData);
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toContain("Access denied");
  });

  test("POST /people/invite - Invite user for long email", async ({
    apiSdk,
  }) => {
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

  test("POST /people/invite - Inviting a user without authorization", async ({
    apiSdk,
  }) => {
    const response = await apiSdk.profiles.invitingAUserWithoutAuthorization();
    expect(response.status()).toBe(401);
  });

  test("PUT /people/invite - Guest resends activation emails ", async ({
    apiSdk,
    api,
  }) => {
    await apiSdk.profiles.addMember("owner", "Guest");
    const email = faker.internet.email();
    const response = await apiSdk.profiles.inviteUser("owner", {
      type: "RoomAdmin",
      email,
    });
    const body = await response.json();
    const invitedUser = body.response.find(
      (u: UsersListItem) => u.displayName === email,
    )!;
    await api.auth.authenticateGuest();
    const responseResent = await apiSdk.profiles.resendActavationEmails(
      "guest",
      {
        userIds: [invitedUser.id],
        resendAll: false,
      },
    );
    const bodyResent = await responseResent.json();
    expect(bodyResent.statusCode).toBe(403);
    expect(bodyResent.error.message).toContain("Access denied");
  });

  // 79545 - Fix
  test("PUT /people/invite - User resend activation emails ", async ({
    apiSdk,
    api,
  }) => {
    await apiSdk.profiles.addMember("owner", "User");
    const email = faker.internet.email();

    const response = await apiSdk.profiles.inviteUser("owner", {
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

    const responseResent = await apiSdk.profiles.resendActavationEmails(
      "user",
      userData,
    );
    const bodyResent = await responseResent.json();
    expect(bodyResent.statusCode).toBe(403);
    expect(bodyResent.error.message).toContain("Access denied");
  });

  test("PUT /people/invite - Resending activation email by unauthorized user", async ({
    apiSdk,
  }) => {
    const response =
      await apiSdk.profiles.resendingActivationEmailByUnauthorizedUser();
    expect(response.status()).toBe(401);
  });

  test("DELETE /people/:userIds - Owner deletes a non-deactivated guest", async ({
    apiSdk,
  }) => {
    const user = await apiSdk.profiles.addMember("owner", "Guest");
    const response = await user.response.json();
    const userId = response.response.id;
    const userData = {
      userIds: [userId],
    };
    const responseDelete = await apiSdk.profiles.deleteUser("owner", userData);
    const bodyDelete = await responseDelete.json();
    expect(bodyDelete.statusCode).toBe(403);
    expect(bodyDelete.error.message).toContain("The user is not suspended");
  });

  // 79560 - Fixed
  test("DELETE /people/:userIds - Owner deletes a non-deactivated user", async ({
    apiSdk,
  }) => {
    const user = await apiSdk.profiles.addMember("owner", "User");
    const response = await user.response.json();
    const userId = response.response.id;
    const userData = {
      userIds: [userId],
    };

    const responseDelete = await apiSdk.profiles.deleteUser("owner", userData);
    const bodyDelete = await responseDelete.json();
    expect(bodyDelete.statusCode).toBe(403);
    expect(bodyDelete.error.message).toContain("The user is not suspended");
  });

  // 79560 - Fixed
  test("DELETE /people/:userIds - DocSpace admin deletes a non-deactivated user", async ({
    apiSdk,
    api,
  }) => {
    const user = await apiSdk.profiles.addMember("owner", "User");
    const response = await user.response.json();
    const userId = response.response.id;
    const userData = {
      userIds: [userId],
    };

    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    const responseDelete = await apiSdk.profiles.deleteUser(
      "docSpaceAdmin",
      userData,
    );
    const bodyDelete = await responseDelete.json();
    expect(bodyDelete.statusCode).toBe(403);
    expect(bodyDelete.error.message).toContain("The user is not suspended");
  });

  test("DELETE /people/:userIds - Room admin deletes a non-deactivated user", async ({
    apiSdk,
    api,
  }) => {
    const user = await apiSdk.profiles.addMember("owner", "User");
    const response = await user.response.json();
    const userId = response.response.id;
    const userData = {
      userIds: [userId],
    };

    await apiSdk.profiles.addMember("owner", "RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    const responseDelete = await apiSdk.profiles.deleteUser(
      "roomAdmin",
      userData,
    );
    const bodyDelete = await responseDelete.json();
    expect(bodyDelete.statusCode).toBe(403);
    expect(bodyDelete.error.message).toContain("Access denied");
  });

  test("DELETE /people/:userIds - User deletes a non-deactivated user", async ({
    apiSdk,
    api,
  }) => {
    const user = await apiSdk.profiles.addMember("owner", "User");
    const response = await user.response.json();
    const userId = response.response.id;
    const userData = {
      userIds: [userId],
    };

    await apiSdk.profiles.addMember("owner", "User");
    await api.auth.authenticateUser();

    const responseDelete = await apiSdk.profiles.deleteUser("user", userData);
    const bodyDelete = await responseDelete.json();
    expect(bodyDelete.statusCode).toBe(403);
    expect(bodyDelete.error.message).toContain("Access denied");
  });

  test("DELETE /people/:userIds - DocSpace admin deletes a deactivated docspace admin", async ({
    apiSdk,
    api,
  }) => {
    // Create first DocSpace admin that will be deleted
    const userToDelete = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
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
    expect(bodyDelete.statusCode).toBe(403);
    expect(bodyDelete.error.message).toContain("Access denied");
  });

  test("DELETE /people/:userIds - Room admin deletes a deactivated room admin", async ({
    apiSdk,
    api,
  }) => {
    // Create first Room admin that will be deleted
    const userToDelete = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const responseToDelete = await userToDelete.response.json();
    const userIdToDelete = responseToDelete.response.id;

    // Disable the first Room admin
    const userDataChangeStatus = {
      userIds: [userIdToDelete],
      resendAll: false,
    };
    await apiSdk.userStatus.changeUserStatus(
      "owner",
      UserStatus.Disabled,
      userDataChangeStatus,
    );

    // Create second Room admin that will perform the deletion
    await apiSdk.profiles.addMember("owner", "RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    // Delete the disabled Room admin
    const userDataDeleteUser = {
      userIds: [userIdToDelete],
    };

    const responseDelete = await apiSdk.profiles.deleteUser(
      "roomAdmin",
      userDataDeleteUser,
    );
    const bodyDelete = await responseDelete.json();
    expect(bodyDelete.statusCode).toBe(403);
    expect(bodyDelete.error.message).toContain("Access denied");
  });

  test("DELETE /people/:userIds - User deletes a deactivated user", async ({
    apiSdk,
    api,
  }) => {
    // Create first User that will be deleted
    const userToDelete = await apiSdk.profiles.addMember("owner", "User");
    const responseToDelete = await userToDelete.response.json();
    const userIdToDelete = responseToDelete.response.id;

    // Disable the first User
    const userDataChangeStatus = {
      userIds: [userIdToDelete],
      resendAll: false,
    };
    await apiSdk.userStatus.changeUserStatus(
      "owner",
      UserStatus.Disabled,
      userDataChangeStatus,
    );

    // Create second User that will perform the deletion
    await apiSdk.profiles.addMember("owner", "User");
    await api.auth.authenticateUser();

    // Delete the disabled User
    const userDataDeleteUser = {
      userIds: [userIdToDelete],
    };

    const responseDelete = await apiSdk.profiles.deleteUser(
      "user",
      userDataDeleteUser,
    );
    const bodyDelete = await responseDelete.json();
    expect(bodyDelete.statusCode).toBe(403);
    expect(bodyDelete.error.message).toContain("Access denied");
  });

  test("DELETE /people/:userIds - Room admin deletes a deactivated user", async ({
    apiSdk,
    api,
  }) => {
    // Create first user that will be deleted
    const userToDelete = await apiSdk.profiles.addMember("owner", "User");
    const responseToDelete = await userToDelete.response.json();
    const userIdToDelete = responseToDelete.response.id;

    // Disable the first user
    const userDataChangeStatus = {
      userIds: [userIdToDelete],
      resendAll: false,
    };
    await apiSdk.userStatus.changeUserStatus(
      "owner",
      UserStatus.Disabled,
      userDataChangeStatus,
    );

    // Create second Room admin that will perform the deletion
    await apiSdk.profiles.addMember("owner", "RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    // Delete the disabled user
    const userDataDeleteUser = {
      userIds: [userIdToDelete],
    };

    const responseDelete = await apiSdk.profiles.deleteUser(
      "roomAdmin",
      userDataDeleteUser,
    );
    const bodyDelete = await responseDelete.json();
    expect(bodyDelete.statusCode).toBe(403);
    expect(bodyDelete.error.message).toContain("Access denied");
  });

  test("DELETE /people/:userIds - Deleting a non-existent user", async ({
    apiSdk,
  }) => {
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
    await apiSdk.profiles.deleteUser("owner", userDataDeleteUser);
    const responseDelete = await apiSdk.profiles.deleteUser(
      "owner",
      userDataDeleteUser,
    );
    const bodyDelete = await responseDelete.json();
    expect(bodyDelete.statusCode).toBe(404);
    expect(bodyDelete.error.message).toContain("The user could not be found");
  });

  test("DELETE /people/:userIds - Deleting a user without authorization", async ({
    apiSdk,
  }) => {
    // Create first user that will be deleted
    const userToDelete = await apiSdk.profiles.addMember("owner", "User");
    const responseToDelete = await userToDelete.response.json();
    const userIdToDelete = responseToDelete.response.id;

    // Disable the first user
    const userDataChangeStatus = {
      userIds: [userIdToDelete],
      resendAll: false,
    };
    await apiSdk.userStatus.changeUserStatus(
      "owner",
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

  test("GET /people/:userId - Returns detailed information about a non-existent user", async ({
    apiSdk,
  }) => {
    const user = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const response = await user.response.json();
    const userId = response.response.id;

    const userDataChangeStatus = {
      userIds: [userId],
      resendAll: false,
    };

    await apiSdk.userStatus.changeUserStatus(
      "owner",
      UserStatus.Disabled,
      userDataChangeStatus,
    );

    const userDataDeleteUser = {
      userIds: [userId],
    };

    await apiSdk.profiles.deleteUser("owner", userDataDeleteUser);

    const responseReturnInfo =
      await apiSdk.profiles.returnUserDetailedInformation("owner", userId);
    const bodyReturnInfo = await responseReturnInfo.json();
    expect(bodyReturnInfo.statusCode).toBe(404);
    expect(bodyReturnInfo.error.message).toContain(
      "The user could not be found",
    );
  });

  test("GET /people/:userId - Returns detailed information of a user without authorization", async ({
    apiSdk,
  }) => {
    const user = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const response = await user.response.json();
    const userId = response.response.id;

    const responseReturnInfo =
      await apiSdk.profiles.returnUserDetailedInformationAboutAUsetWithoutAuthorization(
        userId,
      );
    expect(responseReturnInfo.status()).toBe(401);
  });

  test("GET /people/:userIds - User returns detailed information of a user", async ({
    apiSdk,
    api,
  }) => {
    await apiSdk.profiles.addMember("owner", "User");
    const returnAllUsersList =
      await apiSdk.profiles.returnAllUsersList("owner");
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
    await api.auth.authenticateUser();
    const responseReturnInfo =
      await apiSdk.profiles.returnUserDetailedInformation("user", userId);
    const bodyReturnInfo = await responseReturnInfo.json();
    expect(bodyReturnInfo.statusCode).toBe(403);
    expect(bodyReturnInfo.error.message).toContain("Access denied");
  });

  test("GET /people/:userIds - Guest returns detailed information of a user", async ({
    apiSdk,
    api,
  }) => {
    await apiSdk.profiles.addMember("owner", "Guest");
    const returnAllUsersList =
      await apiSdk.profiles.returnAllUsersList("owner");
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
    await api.auth.authenticateGuest();
    const responseReturnInfo =
      await apiSdk.profiles.returnUserDetailedInformation("guest", userId);
    const bodyReturnInfo = await responseReturnInfo.json();
    expect(bodyReturnInfo.statusCode).toBe(403);
    expect(bodyReturnInfo.error.message).toContain("Access denied");
  });

  test("PUT /people/:userId - Updating owner profile data without authorization", async ({
    apiSdk,
  }) => {
    const returnAllUsersList =
      await apiSdk.profiles.returnAllUsersList("owner");
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

  test("PUT /people/:userId - Updating profile data non-existent user", async ({
    apiSdk,
  }) => {
    const user = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const response = await user.response.json();
    const userId = response.response.id;

    const userDataChangeStatus = {
      userIds: [userId],
      resendAll: false,
    };
    await apiSdk.userStatus.changeUserStatus(
      "owner",
      UserStatus.Disabled,
      userDataChangeStatus,
    );

    const userDataDeleteUser = {
      userIds: [userId],
    };
    await apiSdk.profiles.deleteUser("owner", userDataDeleteUser);

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
    expect(bodyUpdateInfo.statusCode).toBe(404);
    expect(bodyUpdateInfo.error.message).toContain(
      "The user could not be found",
    );
  });

  test("PUT /people/:userId - DocSpace admin updating profile data owner", async ({
    apiSdk,
    api,
  }) => {
    const returnAllUsersList =
      await apiSdk.profiles.returnAllUsersList("owner");
    const response = await returnAllUsersList.json();
    const userId = response.response[0].id;

    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
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
    expect(bodyUpdateInfo.statusCode).toBe(403);
    expect(bodyUpdateInfo.error.message).toContain("Access denied");
  });

  test("PUT /people/:userId - Room admin updating profile data owner", async ({
    apiSdk,
    api,
  }) => {
    const returnAllUsersList =
      await apiSdk.profiles.returnAllUsersList("owner");
    const response = await returnAllUsersList.json();
    const userId = response.response[0].id;

    await apiSdk.profiles.addMember("owner", "RoomAdmin");
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
    expect(bodyUpdateInfo.statusCode).toBe(403);
    expect(bodyUpdateInfo.error.message).toContain("Access denied");
  });

  test("PUT /people/:userId - User updating profile data owner", async ({
    apiSdk,
    api,
  }) => {
    const returnAllUsersList =
      await apiSdk.profiles.returnAllUsersList("owner");
    const response = await returnAllUsersList.json();
    const userId = response.response[0].id;

    await apiSdk.profiles.addMember("owner", "User");
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
    expect(bodyUpdateInfo.statusCode).toBe(403);
    expect(bodyUpdateInfo.error.message).toContain("Access denied");
  });

  test("PUT /people/:userId - Guest updating profile data owner", async ({
    apiSdk,
    api,
  }) => {
    const returnAllUsersList =
      await apiSdk.profiles.returnAllUsersList("owner");
    const response = await returnAllUsersList.json();
    const userId = response.response[0].id;

    await apiSdk.profiles.addMember("owner", "Guest");
    await api.auth.authenticateGuest();

    const userData = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };
    const responseUpdateInfo = await apiSdk.profiles.updatesData(
      "guest",
      userId,
      userData,
    );
    const bodyUpdateInfo = await responseUpdateInfo.json();
    expect(bodyUpdateInfo.statusCode).toBe(403);
    expect(bodyUpdateInfo.error.message).toContain("Access denied");
  });

  test("PUT /people/:userId - Updating owner profile data with incorrect name", async ({
    apiSdk,
  }) => {
    const returnAllUsersList =
      await apiSdk.profiles.returnAllUsersList("owner");
    const response = await returnAllUsersList.json();
    const userId = response.response[0].id;
    const incorrectName = faker.number.int({ min: 1, max: 10 });
    const userData = {
      firstName: incorrectName.toString(),
      lastName: faker.person.lastName(),
    };

    const responseUpdateInfo = await apiSdk.profiles.updatesData(
      "owner",
      userId,
      userData,
    );
    const bodyUpdateInfo = await responseUpdateInfo.json();
    expect(bodyUpdateInfo.statusCode).toBe(400);
    expect(bodyUpdateInfo.error.message).toContain(
      "Incorrect firstname or lastname",
    );
  });

  test("PUT /people/:userId - Updating user profile data with incorrect data", async ({
    apiSdk,
    api,
  }) => {
    const user = await apiSdk.profiles.addMember("owner", "User");
    const response = await user.response.json();
    const userId = response.response.id;
    await api.auth.authenticateUser();

    const userData = {
      firstName: apiSdk.faker.generateString(260),
      lastName: apiSdk.faker.generateString(260),
    };

    const responseUpdateInfo = await apiSdk.profiles.updatesData(
      "user",
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

  test("PUT /people/:userId - Updating guest profile data with incorrect data", async ({
    apiSdk,
    api,
  }) => {
    const user = await apiSdk.profiles.addMember("owner", "Guest");
    const response = await user.response.json();
    const userId = response.response.id;
    await api.auth.authenticateGuest();

    const userData = {
      firstName: apiSdk.faker.generateString(260),
      lastName: apiSdk.faker.generateString(260),
    };

    const responseUpdateInfo = await apiSdk.profiles.updatesData(
      "guest",
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

  test("GET /people/email?email= - Receives information about another user via email without authorization.", async ({
    apiSdk,
  }) => {
    const ownerData = await apiSdk.profiles.returnHimselfInformation("owner");
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

  test("GET /people/email?email= - Receives information about another user via email with a non-existent user", async ({
    apiSdk,
  }) => {
    const user = await apiSdk.profiles.addMember("owner", "RoomAdmin");
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
      "owner",
      UserStatus.Disabled,
      userDataChangeStatus,
    );
    await apiSdk.profiles.deleteUser("owner", userDataDeleteUser);
    const responseDelete = await apiSdk.profiles.returnsUserInfoViaEmail(
      "owner",
      userData,
    );
    const bodyDelete = await responseDelete.json();
    expect(bodyDelete.statusCode).toBe(404);
    expect(bodyDelete.error.message).toContain("The user could not be found");
  });

  test("GET /people/email?email= - User receives information about another user via email.", async ({
    apiSdk,
    api,
  }) => {
    await apiSdk.profiles.addMember("owner", "User");
    const roomAdminData = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminJson = await roomAdminData.response.json();
    const roomAdminEmail = roomAdminJson.response.email;

    const userRequestData = {
      email: [roomAdminEmail],
    };

    await api.auth.authenticateUser();
    const response = await apiSdk.profiles.returnsUserInfoViaEmail(
      "user",
      userRequestData,
    );
    const userInfo = await response.json();
    expect(userInfo.statusCode).toBe(403);
    expect(userInfo.error.message).toContain("Access denied");
  });

  test("GET /people/email?email= - Guest receives information about another user via email.", async ({
    apiSdk,
    api,
  }) => {
    await apiSdk.profiles.addMember("owner", "Guest");
    const roomAdminData = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminJson = await roomAdminData.response.json();
    const roomAdminEmail = roomAdminJson.response.email;

    const userRequestData = {
      email: [roomAdminEmail],
    };

    await api.auth.authenticateGuest();
    const response = await apiSdk.profiles.returnsUserInfoViaEmail(
      "guest",
      userRequestData,
    );
    const userInfo = await response.json();
    expect(userInfo.statusCode).toBe(403);
    expect(userInfo.error.message).toContain("Access denied");
  });

  test("POST /people/email - Sent instructions on changing an email address to a non-existent user", async ({
    apiSdk,
  }) => {
    const userId = faker.string.uuid();
    const ownerRequestData = {
      userId: userId,
      email: faker.internet.email(),
    };
    const response = await apiSdk.profiles.sendInstructionToChangeEmail(
      "owner",
      ownerRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(404);
    expect(dataResponse.error.message).toContain("The user could not be found");
  });

  test("POST /people/email - Sent instructions on how to change your email address with an incorrect email address", async ({
    apiSdk,
  }) => {
    const userData = await apiSdk.profiles.addMember("owner", "User");
    const userJson = await userData.response.json();
    const userId = userJson.response.id;
    const incorrectEmail = apiSdk.faker.generateString(20);

    const ownerRequestData = {
      userId: userId,
      email: incorrectEmail,
    };
    const response = await apiSdk.profiles.sendInstructionToChangeEmail(
      "owner",
      ownerRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.response.status).toBe(400);
    expect(dataResponse.response.title).toContain(
      "One or more validation errors occurred.",
    );
    expect(dataResponse.response.errors.Email[0]).toContain(
      "The Email field is not a valid e-mail address.",
    );
  });

  test("POST /people/email - DocSpace admin sent DocSpace admin user instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    const docSpaceAdminData = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const docSpaceAdminJson = await docSpaceAdminData.response.json();
    const docSpaceAdminId = docSpaceAdminJson.response.id;
    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
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
    expect(dataResponse.statusCode).toBe(403);
    expect(dataResponse.error.message).toBe("Access denied");
  });

  test("POST /people/email - DocSpace admin sent Owner user instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    const ownerData = await apiSdk.profiles.returnHimselfInformation("owner");
    const ownerJson = await ownerData.json();
    const ownerId = ownerJson.response.id;
    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    const ownerRequestData = {
      userId: ownerId,
      email: faker.internet.email(),
    };
    const response = await apiSdk.profiles.sendInstructionToChangeEmail(
      "docSpaceAdmin",
      ownerRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(403);
    expect(dataResponse.error.message).toBe("Access denied");
  });

  test("POST /people/email - Room admin sent Owner user instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    const ownerData = await apiSdk.profiles.returnHimselfInformation("owner");
    const ownerJson = await ownerData.json();
    const ownerId = ownerJson.response.id;
    await apiSdk.profiles.addMember("owner", "RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    const ownerRequestData = {
      userId: ownerId,
      email: faker.internet.email(),
    };
    const response = await apiSdk.profiles.sendInstructionToChangeEmail(
      "roomAdmin",
      ownerRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(403);
    expect(dataResponse.error.message).toBe("Access denied");
  });

  test("POST /people/email - Room admin sent DocSpace admin user instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    const docSpaceAdminData = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const docSpaceAdminJson = await docSpaceAdminData.response.json();
    const docSpaceAdminId = docSpaceAdminJson.response.id;
    await apiSdk.profiles.addMember("owner", "RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    const docSpaceAdminRequestData = {
      userId: docSpaceAdminId,
      email: faker.internet.email(),
    };
    const response = await apiSdk.profiles.sendInstructionToChangeEmail(
      "roomAdmin",
      docSpaceAdminRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(403);
    expect(dataResponse.error.message).toBe("Access denied");
  });

  test("POST /people/email - Room admin sent Room admin user instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    const roomAdminData = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminJson = await roomAdminData.response.json();
    const roomAdminId = roomAdminJson.response.id;
    await apiSdk.profiles.addMember("owner", "RoomAdmin");
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
    expect(dataResponse.statusCode).toBe(403);
    expect(dataResponse.error.message).toBe("Access denied");
  });

  test("POST /people/email - Room admin sent User instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const userData = await apiSdk.profiles.addMember("owner", "User");
    const userJson = await userData.response.json();
    const userId = userJson.response.id;
    await api.auth.authenticateRoomAdmin();

    const userRequestData = {
      userId: userId,
      email: faker.internet.email(),
    };
    const response = await apiSdk.profiles.sendInstructionToChangeEmail(
      "roomAdmin",
      userRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(403);
    expect(dataResponse.error.message).toBe("Access denied");
  });

  test("POST /people/email - User sent Owner user instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    const ownerData = await apiSdk.profiles.returnHimselfInformation("owner");
    const ownerJson = await ownerData.json();
    const ownerId = ownerJson.response.id;
    await apiSdk.profiles.addMember("owner", "User");
    await api.auth.authenticateUser();

    const ownerRequestData = {
      userId: ownerId,
      email: faker.internet.email(),
    };
    const response = await apiSdk.profiles.sendInstructionToChangeEmail(
      "user",
      ownerRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(403);
    expect(dataResponse.error.message).toBe("Access denied");
  });

  test("POST /people/email - Guest sent Owner user instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    const ownerData = await apiSdk.profiles.returnHimselfInformation("owner");
    const ownerJson = await ownerData.json();
    const ownerId = ownerJson.response.id;
    await apiSdk.profiles.addMember("owner", "Guest");
    await api.auth.authenticateGuest();

    const ownerRequestData = {
      userId: ownerId,
      email: faker.internet.email(),
    };
    const response = await apiSdk.profiles.sendInstructionToChangeEmail(
      "guest",
      ownerRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(403);
    expect(dataResponse.error.message).toBe("Access denied");
  });

  test("POST /people/email - User sent DocSpace admin user instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    const docSpaceAdminData = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const docSpaceAdminJson = await docSpaceAdminData.response.json();
    const docSpaceAdminId = docSpaceAdminJson.response.id;
    await apiSdk.profiles.addMember("owner", "User");
    await api.auth.authenticateUser();

    const docSpaceAdminRequestData = {
      userId: docSpaceAdminId,
      email: faker.internet.email(),
    };
    const response = await apiSdk.profiles.sendInstructionToChangeEmail(
      "user",
      docSpaceAdminRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(403);
    expect(dataResponse.error.message).toBe("Access denied");
  });

  test("POST /people/email - Guest sent DocSpace admin user instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    const docSpaceAdminData = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const docSpaceAdminJson = await docSpaceAdminData.response.json();
    const docSpaceAdminId = docSpaceAdminJson.response.id;
    await apiSdk.profiles.addMember("owner", "Guest");
    await api.auth.authenticateGuest();

    const docSpaceAdminRequestData = {
      userId: docSpaceAdminId,
      email: faker.internet.email(),
    };
    const response = await apiSdk.profiles.sendInstructionToChangeEmail(
      "guest",
      docSpaceAdminRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(403);
    expect(dataResponse.error.message).toBe("Access denied");
  });

  test("POST /people/email - User sent Room admin user instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    const roomAdminData = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminJson = await roomAdminData.response.json();
    const roomAdminId = roomAdminJson.response.id;
    await apiSdk.profiles.addMember("owner", "User");
    await api.auth.authenticateUser();

    const roomAdminRequestData = {
      userId: roomAdminId,
      email: faker.internet.email(),
    };
    const response = await apiSdk.profiles.sendInstructionToChangeEmail(
      "user",
      roomAdminRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(403);
    expect(dataResponse.error.message).toBe("Access denied");
  });

  test("POST /people/email - Guest sent Room admin user instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    const roomAdminData = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminJson = await roomAdminData.response.json();
    const roomAdminId = roomAdminJson.response.id;
    await apiSdk.profiles.addMember("owner", "Guest");
    await api.auth.authenticateGuest();

    const roomAdminRequestData = {
      userId: roomAdminId,
      email: faker.internet.email(),
    };
    const response = await apiSdk.profiles.sendInstructionToChangeEmail(
      "guest",
      roomAdminRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(403);
    expect(dataResponse.error.message).toBe("Access denied");
  });

  test("POST /people/email - User sent another User instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    const userData = await apiSdk.profiles.addMember("owner", "User");
    const userJson = await userData.response.json();
    const userId = userJson.response.id;
    await apiSdk.profiles.addMember("owner", "User");
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
    expect(dataResponse.statusCode).toBe(403);
    expect(dataResponse.error.message).toBe("Access denied");
  });

  test("POST /people/email - User sent Guest instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    const userData = await apiSdk.profiles.addMember("owner", "Guest");
    const userJson = await userData.response.json();
    const userId = userJson.response.id;
    await apiSdk.profiles.addMember("owner", "User");
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
    expect(dataResponse.statusCode).toBe(403);
    expect(dataResponse.error.message).toBe("Access denied");
  });

  test("POST /people/email - Guest sent User instructions on how to change his email address", async ({
    apiSdk,
    api,
  }) => {
    const userData = await apiSdk.profiles.addMember("owner", "User");
    const userJson = await userData.response.json();
    const userId = userJson.response.id;
    await apiSdk.profiles.addMember("owner", "Guest");
    await api.auth.authenticateGuest();

    const userRequestData = {
      userId: userId,
      email: faker.internet.email(),
    };
    const response = await apiSdk.profiles.sendInstructionToChangeEmail(
      "guest",
      userRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(403);
    expect(dataResponse.error.message).toBe("Access denied");
  });

  test("POST /people/email - Sent instructions on how to change email address without authorization", async ({
    apiSdk,
  }) => {
    const ownerData = await apiSdk.profiles.returnHimselfInformation("owner");
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

  test("POST /people/email - Sending instructions on how to change a very long email address.", async ({
    apiSdk,
  }) => {
    const docSpaceAdminData = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const docSpaceAdminJson = await docSpaceAdminData.response.json();
    const docSpaceAdminId = docSpaceAdminJson.response.id;
    const veryLongEmail = apiSdk.faker.generateEmailWithLength(260);

    const ownerRequestData = {
      userId: docSpaceAdminId,
      email: veryLongEmail,
    };
    const response = await apiSdk.profiles.sendInstructionToChangeEmail(
      "owner",
      ownerRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.response.status).toBe(400);
    expect(dataResponse.response.title).toContain(
      "One or more validation errors occurred.",
    );
    expect(dataResponse.response.errors.Email[0]).toContain(
      "The field Email must be a string with a maximum length of 255.",
    );
  });

  // 79876 - FIX
  test("PUT /people/delete - Owner delete non-deactivated users", async ({
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

    const usersRequestData = {
      userIds: [docSpaceAdminId, roomAdminId],
      resendAll: false,
    };
    const response = await apiSdk.profiles.deleteUsers(
      "owner",
      usersRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(403);
    expect(dataResponse.error.message).toBe("Users are not suspended");
  });

  test("PUT /people/delete - Room admin removes deactivated users", async ({
    apiSdk,
    api,
  }) => {
    const user1 = await apiSdk.profiles.addMember("owner", "User");
    const user1Json = await user1.response.json();
    const user1Id = user1Json.response.id;

    const user2 = await apiSdk.profiles.addMember("owner", "User");
    const user2Json = await user2.response.json();
    const user2Id = user2Json.response.id;

    const usersRequestData = {
      userIds: [user1Id, user2Id],
      resendAll: false,
    };

    await apiSdk.userStatus.changeUserStatus(
      "owner",
      UserStatus.Disabled,
      usersRequestData,
    );
    await apiSdk.profiles.addMember("owner", "RoomAdmin");
    await api.auth.authenticateRoomAdmin();
    const response = await apiSdk.profiles.deleteUser(
      "roomAdmin",
      usersRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(403);
    expect(dataResponse.error.message).toContain("Access denied");
  });

  test("PUT /people/delete - User removes deactivated users", async ({
    apiSdk,
    api,
  }) => {
    const user1 = await apiSdk.profiles.addMember("owner", "User");
    const user1Json = await user1.response.json();
    const user1Id = user1Json.response.id;

    const user2 = await apiSdk.profiles.addMember("owner", "User");
    const user2Json = await user2.response.json();
    const user2Id = user2Json.response.id;

    const usersRequestData = {
      userIds: [user1Id, user2Id],
      resendAll: false,
    };

    await apiSdk.userStatus.changeUserStatus(
      "owner",
      UserStatus.Disabled,
      usersRequestData,
    );
    await apiSdk.profiles.addMember("owner", "User");
    await api.auth.authenticateUser();
    const response = await apiSdk.profiles.deleteUsers(
      "user",
      usersRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(403);
    expect(dataResponse.error.message).toContain("Access denied");
  });

  test("PUT /people/delete - Guest removes deactivated users", async ({
    apiSdk,
    api,
  }) => {
    const user1 = await apiSdk.profiles.addMember("owner", "User");
    const user1Json = await user1.response.json();
    const user1Id = user1Json.response.id;

    const user2 = await apiSdk.profiles.addMember("owner", "User");
    const user2Json = await user2.response.json();
    const user2Id = user2Json.response.id;

    const usersRequestData = {
      userIds: [user1Id, user2Id],
      resendAll: false,
    };

    await apiSdk.userStatus.changeUserStatus(
      "owner",
      UserStatus.Disabled,
      usersRequestData,
    );
    await apiSdk.profiles.addMember("owner", "Guest");
    await api.auth.authenticateGuest();
    const response = await apiSdk.profiles.deleteUsers(
      "guest",
      usersRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(403);
    expect(dataResponse.error.message).toContain("Access denied");
  });

  test("PUT /people/:userId/culture - Update a culture code of himself without authorization", async ({
    apiSdk,
  }) => {
    const ownerData = await apiSdk.profiles.returnHimselfInformation("owner");
    const ownerJson = await ownerData.json();
    const ownerId = ownerJson.response.id;

    const ownerRequestData = {
      userId: ownerId,
      cultureName: "es",
    };
    const response =
      await apiSdk.profiles.updateCultureCodeWithoutAuthorization(
        ownerRequestData,
      );
    expect(response.status()).toBe(401);
  });

  // 65478 - FIX
  test("PUT /people/:userId/culture - Owner update a culture code another's users", async ({
    apiSdk,
  }) => {
    const docSpaceAdminData = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const docSpaceAdminJson = await docSpaceAdminData.response.json();
    const docSpaceAdminId = docSpaceAdminJson.response.id;

    const docSpaceAdminRequestData = {
      userId: docSpaceAdminId,
      cultureName: "es",
    };

    const roomAdminData = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminJson = await roomAdminData.response.json();
    const roomAdminId = roomAdminJson.response.id;

    const roomAdminRequestData = {
      userId: roomAdminId,
      cultureName: "es",
    };

    const user = await apiSdk.profiles.addMember("owner", "User");
    const userJson = await user.response.json();
    const userId = userJson.response.id;

    const userRequestData = {
      userId: userId,
      cultureName: "es",
    };

    const guest = await apiSdk.profiles.addMember("owner", "Guest");
    const guestJson = await guest.response.json();
    const guestId = guestJson.response.id;

    const guestRequestData = {
      userId: guestId,
      cultureName: "es",
    };

    const docSpaceAdminResponse = await apiSdk.profiles.updateCultureCode(
      "owner",
      docSpaceAdminRequestData,
    );
    const docSpaceAdminDataResponse = await docSpaceAdminResponse.json();
    expect(docSpaceAdminDataResponse.statusCode).toBe(403);
    expect(docSpaceAdminDataResponse.error.message).toBe("Access denied");

    const roomAdminResponse = await apiSdk.profiles.updateCultureCode(
      "owner",
      roomAdminRequestData,
    );
    const roomAdminDataResponse = await roomAdminResponse.json();
    expect(roomAdminDataResponse.statusCode).toBe(403);
    expect(roomAdminDataResponse.error.message).toBe("Access denied");

    const userResponse = await apiSdk.profiles.updateCultureCode(
      "owner",
      userRequestData,
    );
    const userDataResponse = await userResponse.json();
    expect(userDataResponse.statusCode).toBe(403);
    expect(userDataResponse.error.message).toBe("Access denied");

    const guestResponse = await apiSdk.profiles.updateCultureCode(
      "owner",
      guestRequestData,
    );
    const guestDataResponse = await guestResponse.json();
    expect(guestDataResponse.statusCode).toBe(403);
    expect(guestDataResponse.error.message).toBe("Access denied");
  });

  // 65478 - FIX
  test("PUT /people/:userId/culture - DocSpace admin update a culture code another's users", async ({
    apiSdk,
    api,
  }) => {
    const ownerData = await apiSdk.profiles.returnHimselfInformation("owner");
    const ownerJson = await ownerData.json();
    const ownerId = ownerJson.response.id;

    const ownerRequestData = {
      userId: ownerId,
      cultureName: "es",
    };

    const roomAdminData = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminJson = await roomAdminData.response.json();
    const roomAdminId = roomAdminJson.response.id;

    const roomAdminRequestData = {
      userId: roomAdminId,
      cultureName: "es",
    };

    const user = await apiSdk.profiles.addMember("owner", "User");
    const userJson = await user.response.json();
    const userId = userJson.response.id;

    const userRequestData = {
      userId: userId,
      cultureName: "es",
    };

    const guest = await apiSdk.profiles.addMember("owner", "Guest");
    const guestJson = await guest.response.json();
    const guestId = guestJson.response.id;

    const guestRequestData = {
      userId: guestId,
      cultureName: "es",
    };

    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();
    const ownerResponse = await apiSdk.profiles.updateCultureCode(
      "docSpaceAdmin",
      ownerRequestData,
    );
    const ownerDataResponse = await ownerResponse.json();
    expect(ownerDataResponse.statusCode).toBe(403);
    expect(ownerDataResponse.error.message).toBe("Access denied");

    const roomAdminResponse = await apiSdk.profiles.updateCultureCode(
      "docSpaceAdmin",
      roomAdminRequestData,
    );
    const roomAdminDataResponse = await roomAdminResponse.json();
    expect(roomAdminDataResponse.statusCode).toBe(403);
    expect(roomAdminDataResponse.error.message).toBe("Access denied");

    const userResponse = await apiSdk.profiles.updateCultureCode(
      "docSpaceAdmin",
      userRequestData,
    );
    const userDataResponse = await userResponse.json();
    expect(userDataResponse.statusCode).toBe(403);
    expect(userDataResponse.error.message).toBe("Access denied");

    const guestResponse = await apiSdk.profiles.updateCultureCode(
      "owner",
      guestRequestData,
    );
    const guestDataResponse = await guestResponse.json();
    expect(guestDataResponse.statusCode).toBe(403);
    expect(guestDataResponse.error.message).toBe("Access denied");
  });

  // 65478 - FIX
  test("PUT /people/:userId/culture - Room admin update a culture code another's users", async ({
    apiSdk,
    api,
  }) => {
    const ownerData = await apiSdk.profiles.returnHimselfInformation("owner");
    const ownerJson = await ownerData.json();
    const ownerId = ownerJson.response.id;

    const ownerRequestData = {
      userId: ownerId,
      cultureName: "es",
    };

    const docSpaceAdminData = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const docSpaceAdminJson = await docSpaceAdminData.response.json();
    const docSpaceAdminId = docSpaceAdminJson.response.id;

    const docSpaceAdminRequestData = {
      userId: docSpaceAdminId,
      cultureName: "es",
    };

    const user = await apiSdk.profiles.addMember("owner", "User");
    const userJson = await user.response.json();
    const userId = userJson.response.id;

    const userRequestData = {
      userId: userId,
      cultureName: "es",
    };

    const guest = await apiSdk.profiles.addMember("owner", "Guest");
    const guestJson = await guest.response.json();
    const guestId = guestJson.response.id;

    const guestRequestData = {
      userId: guestId,
      cultureName: "es",
    };

    await apiSdk.profiles.addMember("owner", "RoomAdmin");
    await api.auth.authenticateRoomAdmin();
    const ownerResponse = await apiSdk.profiles.updateCultureCode(
      "roomAdmin",
      ownerRequestData,
    );
    const ownerDataResponse = await ownerResponse.json();
    expect(ownerDataResponse.statusCode).toBe(403);
    expect(ownerDataResponse.error.message).toBe("Access denied");

    const docSpaceAdminResponse = await apiSdk.profiles.updateCultureCode(
      "roomAdmin",
      docSpaceAdminRequestData,
    );
    const docSpaceAdminDataResponse = await docSpaceAdminResponse.json();
    expect(docSpaceAdminDataResponse.statusCode).toBe(403);
    expect(docSpaceAdminDataResponse.error.message).toBe("Access denied");

    const userResponse = await apiSdk.profiles.updateCultureCode(
      "roomAdmin",
      userRequestData,
    );
    const userDataResponse = await userResponse.json();
    expect(userDataResponse.statusCode).toBe(403);
    expect(userDataResponse.error.message).toBe("Access denied");

    const guestResponse = await apiSdk.profiles.updateCultureCode(
      "owner",
      guestRequestData,
    );
    const guestDataResponse = await guestResponse.json();
    expect(guestDataResponse.statusCode).toBe(403);
    expect(guestDataResponse.error.message).toBe("Access denied");
  });

  // 65478 - FIX
  test("PUT /people/:userId/culture - User update a culture code another's users", async ({
    apiSdk,
    api,
  }) => {
    const ownerData = await apiSdk.profiles.returnHimselfInformation("owner");
    const ownerJson = await ownerData.json();
    const ownerId = ownerJson.response.id;

    const ownerRequestData = {
      userId: ownerId,
      cultureName: "es",
    };

    const docSpaceAdminData = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const docSpaceAdminJson = await docSpaceAdminData.response.json();
    const docSpaceAdminId = docSpaceAdminJson.response.id;

    const docSpaceAdminRequestData = {
      userId: docSpaceAdminId,
      cultureName: "es",
    };

    const roomAdminData = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminJson = await roomAdminData.response.json();
    const roomAdminId = roomAdminJson.response.id;

    const roomAdminRequestData = {
      userId: roomAdminId,
      cultureName: "es",
    };

    const guest = await apiSdk.profiles.addMember("owner", "Guest");
    const guestJson = await guest.response.json();
    const guestId = guestJson.response.id;

    const guestRequestData = {
      userId: guestId,
      cultureName: "es",
    };

    await apiSdk.profiles.addMember("owner", "User");
    await api.auth.authenticateUser();
    const ownerResponse = await apiSdk.profiles.updateCultureCode(
      "user",
      ownerRequestData,
    );
    const ownerDataResponse = await ownerResponse.json();
    expect(ownerDataResponse.statusCode).toBe(403);
    expect(ownerDataResponse.error.message).toBe("Access denied");

    const docSpaceAdminResponse = await apiSdk.profiles.updateCultureCode(
      "user",
      docSpaceAdminRequestData,
    );
    const docSpaceAdminDataResponse = await docSpaceAdminResponse.json();
    expect(docSpaceAdminDataResponse.statusCode).toBe(403);
    expect(docSpaceAdminDataResponse.error.message).toBe("Access denied");

    const roomAdminResponse = await apiSdk.profiles.updateCultureCode(
      "user",
      roomAdminRequestData,
    );
    const roomAdminDataResponse = await roomAdminResponse.json();
    expect(roomAdminDataResponse.statusCode).toBe(403);
    expect(roomAdminDataResponse.error.message).toBe("Access denied");

    const guestResponse = await apiSdk.profiles.updateCultureCode(
      "owner",
      guestRequestData,
    );
    const guestDataResponse = await guestResponse.json();
    expect(guestDataResponse.statusCode).toBe(403);
    expect(guestDataResponse.error.message).toBe("Access denied");
  });

  test("PUT /people/:userId/culture - Guest update a culture code another's users", async ({
    apiSdk,
    api,
  }) => {
    const ownerData = await apiSdk.profiles.returnHimselfInformation("owner");
    const ownerJson = await ownerData.json();
    const ownerId = ownerJson.response.id;

    const ownerRequestData = {
      userId: ownerId,
      cultureName: "es",
    };

    const docSpaceAdminData = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const docSpaceAdminJson = await docSpaceAdminData.response.json();
    const docSpaceAdminId = docSpaceAdminJson.response.id;

    const docSpaceAdminRequestData = {
      userId: docSpaceAdminId,
      cultureName: "es",
    };

    const roomAdminData = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminJson = await roomAdminData.response.json();
    const roomAdminId = roomAdminJson.response.id;

    const roomAdminRequestData = {
      userId: roomAdminId,
      cultureName: "es",
    };

    const user = await apiSdk.profiles.addMember("owner", "User");
    const userJson = await user.response.json();
    const userId = userJson.response.id;

    const userRequestData = {
      userId: userId,
      cultureName: "es",
    };

    await apiSdk.profiles.addMember("owner", "Guest");
    await api.auth.authenticateGuest();
    const ownerResponse = await apiSdk.profiles.updateCultureCode(
      "guest",
      ownerRequestData,
    );
    const ownerDataResponse = await ownerResponse.json();
    expect(ownerDataResponse.statusCode).toBe(403);
    expect(ownerDataResponse.error.message).toBe("Access denied");

    const docSpaceAdminResponse = await apiSdk.profiles.updateCultureCode(
      "guest",
      docSpaceAdminRequestData,
    );
    const docSpaceAdminDataResponse = await docSpaceAdminResponse.json();
    expect(docSpaceAdminDataResponse.statusCode).toBe(403);
    expect(docSpaceAdminDataResponse.error.message).toBe("Access denied");

    const roomAdminResponse = await apiSdk.profiles.updateCultureCode(
      "guest",
      roomAdminRequestData,
    );
    const roomAdminDataResponse = await roomAdminResponse.json();
    expect(roomAdminDataResponse.statusCode).toBe(403);
    expect(roomAdminDataResponse.error.message).toBe("Access denied");

    const userResponse = await apiSdk.profiles.updateCultureCode(
      "guest",
      userRequestData,
    );
    const userDataResponse = await userResponse.json();
    expect(userDataResponse.statusCode).toBe(403);
    expect(userDataResponse.error.message).toBe("Access denied");
  });

  test("PUT /people/:userId/culture - Owner update a culture code of non-existent user", async ({
    apiSdk,
  }) => {
    const userId = faker.string.uuid();
    const ownerRequestData = {
      userId: userId,
      cultureName: "es",
    };
    const response = await apiSdk.profiles.updateCultureCode(
      "owner",
      ownerRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(404);
    expect(dataResponse.error.message).toContain("The user could not be found");
  });

  // 79918 - FIX
  test("PUT /people/:userId/culture - Update culture code with long string", async ({
    apiSdk,
  }) => {
    const ownerData = await apiSdk.profiles.returnHimselfInformation("owner");
    const ownerJson = await ownerData.json();
    const ownerId = ownerJson.response.id;
    const longString = apiSdk.faker.generateString(260);

    const ownerRequestData = {
      userId: ownerId,
      cultureName: longString,
    };
    const response = await apiSdk.profiles.updateCultureCode(
      "owner",
      ownerRequestData,
    );
    const dataResponse = await response.json();
    expect(dataResponse.response.status).toBe(400);
    expect(dataResponse.response.errors["Culture.CultureName"][0]).toContain(
      "The field CultureName must be a string with a maximum length of 85.",
    );
  });
});
