// Tests that check user access rights.

import { expect } from "@playwright/test";
import { test } from "@/src/fixtures/index";
import { faker } from "@faker-js/faker";
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

test.describe("API profiling tests for access rights", () => {
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

  // 79545 - Fix
  test("User resend activation emails ", async ({ apiSdk, api }) => {
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
    expect(bodyResent.error.message).toContain("Access denied");
  });

  test("Resending activation email by unauthorized user", async ({
    apiSdk,
  }) => {
    const response =
      await apiSdk.profiles.resendingActivationEmailByUnauthorizedUser();
    expect(response.status()).toBe(401);
  });

  // 79560 - Fixed
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

  // 79560 - Fixed
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
    await apiSdk.userStatus.ownerChangeUserStatus(
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
    await apiSdk.userStatus.ownerChangeUserStatus(
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
    await apiSdk.userStatus.ownerChangeUserStatus(
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
    await apiSdk.userStatus.ownerChangeUserStatus(
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

    await apiSdk.userStatus.ownerChangeUserStatus(
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
    await apiSdk.userStatus.ownerChangeUserStatus(
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

    await apiSdk.userStatus.ownerChangeUserStatus(
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
    await apiSdk.userStatus.ownerChangeUserStatus(
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

    await apiSdk.userStatus.ownerChangeUserStatus(
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

  test("User sent another User instructions on how to change his email address", async ({
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

  test("Sending instructions on how to change a very long email address.", async ({
    apiSdk,
  }) => {
    const docSpaceAdminData =
      await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    const docSpaceAdminJson = await docSpaceAdminData.response.json();
    const docSpaceAdminId = docSpaceAdminJson.response.id;
    const veryLongEmail = apiSdk.faker.generateEmailWithLength(260);

    const ownerRequestData = {
      userId: docSpaceAdminId,
      email: veryLongEmail,
    };
    const response =
      await apiSdk.profiles.ownerSendInstructionToChangeEmail(ownerRequestData);
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
  test("Owner delete non-deactivated users", async ({ apiSdk }) => {
    const docSpaceAdmin = await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    const docSpaceAdminJson = await docSpaceAdmin.response.json();
    const docSpaceAdminId = docSpaceAdminJson.response.id;

    const roomAdmin = await apiSdk.profiles.ownerAddMember("RoomAdmin");
    const roomAdminJson = await roomAdmin.response.json();
    const roomAdminId = roomAdminJson.response.id;

    const usersRequestData = {
      userIds: [docSpaceAdminId, roomAdminId],
      resendAll: false,
    };
    const response = await apiSdk.profiles.ownerDeleteUsers(usersRequestData);
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(403);
    expect(dataResponse.error.message).toBe("Users are not suspended");
  });

  test("Room admin removes deactivated users", async ({ apiSdk, api }) => {
    const user1 = await apiSdk.profiles.ownerAddMember("User");
    const user1Json = await user1.response.json();
    const user1Id = user1Json.response.id;

    const user2 = await apiSdk.profiles.ownerAddMember("User");
    const user2Json = await user2.response.json();
    const user2Id = user2Json.response.id;

    const usersRequestData = {
      userIds: [user1Id, user2Id],
      resendAll: false,
    };

    await apiSdk.userStatus.ownerChangeUserStatus(
      UserStatus.Disabled,
      usersRequestData,
    );
    await apiSdk.profiles.ownerAddMember("RoomAdmin");
    await api.auth.authenticateRoomAdmin();
    const response =
      await apiSdk.profiles.roomAdminDeleteUser(usersRequestData);
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(403);
    expect(dataResponse.error.message).toContain("Access denied");
  });

  test("User removes deactivated users", async ({ apiSdk, api }) => {
    const user1 = await apiSdk.profiles.ownerAddMember("User");
    const user1Json = await user1.response.json();
    const user1Id = user1Json.response.id;

    const user2 = await apiSdk.profiles.ownerAddMember("User");
    const user2Json = await user2.response.json();
    const user2Id = user2Json.response.id;

    const usersRequestData = {
      userIds: [user1Id, user2Id],
      resendAll: false,
    };

    await apiSdk.userStatus.ownerChangeUserStatus(
      UserStatus.Disabled,
      usersRequestData,
    );
    await apiSdk.profiles.ownerAddMember("User");
    await api.auth.authenticateUser();
    const response = await apiSdk.profiles.userDeleteUser(usersRequestData);
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(403);
    expect(dataResponse.error.message).toContain("Access denied");
  });

  test("Update a culture code of himself without authorization", async ({
    apiSdk,
  }) => {
    const ownerData = await apiSdk.profiles.ownerReturnHimselfInformation();
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
  test("Owner update a culture code another's users", async ({ apiSdk }) => {
    const docSpaceAdminData =
      await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    const docSpaceAdminJson = await docSpaceAdminData.response.json();
    const docSpaceAdminId = docSpaceAdminJson.response.id;

    const docSpaceAdminRequestData = {
      userId: docSpaceAdminId,
      cultureName: "es",
    };

    const roomAdminData = await apiSdk.profiles.ownerAddMember("RoomAdmin");
    const roomAdminJson = await roomAdminData.response.json();
    const roomAdminId = roomAdminJson.response.id;

    const roomAdminRequestData = {
      userId: roomAdminId,
      cultureName: "es",
    };

    const user = await apiSdk.profiles.ownerAddMember("User");
    const userJson = await user.response.json();
    const userId = userJson.response.id;

    const userRequestData = {
      userId: userId,
      cultureName: "es",
    };

    const docSpaceAdminResponse = await apiSdk.profiles.ownerUpdateCultureCode(
      docSpaceAdminRequestData,
    );
    const docSpaceAdminDataResponse = await docSpaceAdminResponse.json();
    expect(docSpaceAdminDataResponse.statusCode).toBe(403);
    expect(docSpaceAdminDataResponse.error.message).toBe("Access denied");

    const roomAdminResponse =
      await apiSdk.profiles.ownerUpdateCultureCode(roomAdminRequestData);
    const roomAdminDataResponse = await roomAdminResponse.json();
    expect(roomAdminDataResponse.statusCode).toBe(403);
    expect(roomAdminDataResponse.error.message).toBe("Access denied");

    const userResponse =
      await apiSdk.profiles.ownerUpdateCultureCode(userRequestData);
    const userDataResponse = await userResponse.json();
    expect(userDataResponse.statusCode).toBe(403);
    expect(userDataResponse.error.message).toBe("Access denied");
  });

  // 65478 - FIX
  test("DocSpace admin update a culture code another's users", async ({
    apiSdk,
    api,
  }) => {
    const ownerData = await apiSdk.profiles.ownerReturnHimselfInformation();
    const ownerJson = await ownerData.json();
    const ownerId = ownerJson.response.id;

    const ownerRequestData = {
      userId: ownerId,
      cultureName: "es",
    };

    const roomAdminData = await apiSdk.profiles.ownerAddMember("RoomAdmin");
    const roomAdminJson = await roomAdminData.response.json();
    const roomAdminId = roomAdminJson.response.id;

    const roomAdminRequestData = {
      userId: roomAdminId,
      cultureName: "es",
    };

    const user = await apiSdk.profiles.ownerAddMember("User");
    const userJson = await user.response.json();
    const userId = userJson.response.id;

    const userRequestData = {
      userId: userId,
      cultureName: "es",
    };

    await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();
    const ownerResponse =
      await apiSdk.profiles.docSpaceAdminUpdateCultureCode(ownerRequestData);
    const ownerDataResponse = await ownerResponse.json();
    expect(ownerDataResponse.statusCode).toBe(403);
    expect(ownerDataResponse.error.message).toBe("Access denied");

    const roomAdminResponse =
      await apiSdk.profiles.docSpaceAdminUpdateCultureCode(
        roomAdminRequestData,
      );
    const roomAdminDataResponse = await roomAdminResponse.json();
    expect(roomAdminDataResponse.statusCode).toBe(403);
    expect(roomAdminDataResponse.error.message).toBe("Access denied");

    const userResponse =
      await apiSdk.profiles.docSpaceAdminUpdateCultureCode(userRequestData);
    const userDataResponse = await userResponse.json();
    expect(userDataResponse.statusCode).toBe(403);
    expect(userDataResponse.error.message).toBe("Access denied");
  });

  // 65478 - FIX
  test("Room admin update a culture code another's users", async ({
    apiSdk,
    api,
  }) => {
    const ownerData = await apiSdk.profiles.ownerReturnHimselfInformation();
    const ownerJson = await ownerData.json();
    const ownerId = ownerJson.response.id;

    const ownerRequestData = {
      userId: ownerId,
      cultureName: "es",
    };

    const docSpaceAdminData =
      await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    const docSpaceAdminJson = await docSpaceAdminData.response.json();
    const docSpaceAdminId = docSpaceAdminJson.response.id;

    const docSpaceAdminRequestData = {
      userId: docSpaceAdminId,
      cultureName: "es",
    };

    const user = await apiSdk.profiles.ownerAddMember("User");
    const userJson = await user.response.json();
    const userId = userJson.response.id;

    const userRequestData = {
      userId: userId,
      cultureName: "es",
    };

    await apiSdk.profiles.ownerAddMember("RoomAdmin");
    await api.auth.authenticateRoomAdmin();
    const ownerResponse =
      await apiSdk.profiles.roomAdminUpdateCultureCode(ownerRequestData);
    const ownerDataResponse = await ownerResponse.json();
    expect(ownerDataResponse.statusCode).toBe(403);
    expect(ownerDataResponse.error.message).toBe("Access denied");

    const docSpaceAdminResponse =
      await apiSdk.profiles.roomAdminUpdateCultureCode(
        docSpaceAdminRequestData,
      );
    const docSpaceAdminDataResponse = await docSpaceAdminResponse.json();
    expect(docSpaceAdminDataResponse.statusCode).toBe(403);
    expect(docSpaceAdminDataResponse.error.message).toBe("Access denied");

    const userResponse =
      await apiSdk.profiles.roomAdminUpdateCultureCode(userRequestData);
    const userDataResponse = await userResponse.json();
    expect(userDataResponse.statusCode).toBe(403);
    expect(userDataResponse.error.message).toBe("Access denied");
  });

  // 65478 - FIX
  test("User update a culture code another's users", async ({
    apiSdk,
    api,
  }) => {
    const ownerData = await apiSdk.profiles.ownerReturnHimselfInformation();
    const ownerJson = await ownerData.json();
    const ownerId = ownerJson.response.id;

    const ownerRequestData = {
      userId: ownerId,
      cultureName: "es",
    };

    const docSpaceAdminData =
      await apiSdk.profiles.ownerAddMember("DocSpaceAdmin");
    const docSpaceAdminJson = await docSpaceAdminData.response.json();
    const docSpaceAdminId = docSpaceAdminJson.response.id;

    const docSpaceAdminRequestData = {
      userId: docSpaceAdminId,
      cultureName: "es",
    };

    const roomAdminData = await apiSdk.profiles.ownerAddMember("RoomAdmin");
    const roomAdminJson = await roomAdminData.response.json();
    const roomAdminId = roomAdminJson.response.id;

    const roomAdminRequestData = {
      userId: roomAdminId,
      cultureName: "es",
    };

    await apiSdk.profiles.ownerAddMember("User");
    await api.auth.authenticateUser();
    const ownerResponse =
      await apiSdk.profiles.userUpdateCultureCode(ownerRequestData);
    const ownerDataResponse = await ownerResponse.json();
    expect(ownerDataResponse.statusCode).toBe(403);
    expect(ownerDataResponse.error.message).toBe("Access denied");

    const docSpaceAdminResponse = await apiSdk.profiles.userUpdateCultureCode(
      docSpaceAdminRequestData,
    );
    const docSpaceAdminDataResponse = await docSpaceAdminResponse.json();
    expect(docSpaceAdminDataResponse.statusCode).toBe(403);
    expect(docSpaceAdminDataResponse.error.message).toBe("Access denied");

    const roomAdminResponse =
      await apiSdk.profiles.userUpdateCultureCode(roomAdminRequestData);
    const roomAdminDataResponse = await roomAdminResponse.json();
    expect(roomAdminDataResponse.statusCode).toBe(403);
    expect(roomAdminDataResponse.error.message).toBe("Access denied");
  });

  test("Owner update a culture code of non-existent user", async ({
    apiSdk,
  }) => {
    const userId = faker.string.uuid();
    const ownerRequestData = {
      userId: userId,
      cultureName: "es",
    };
    const response =
      await apiSdk.profiles.ownerUpdateCultureCode(ownerRequestData);
    const dataResponse = await response.json();
    expect(dataResponse.statusCode).toBe(404);
    expect(dataResponse.error.message).toContain("The user could not be found");
  });

  // 79918 - FIX
  test("Update culture code with long string", async ({ apiSdk }) => {
    const ownerData = await apiSdk.profiles.ownerReturnHimselfInformation();
    const ownerJson = await ownerData.json();
    const ownerId = ownerJson.response.id;
    const longString = apiSdk.faker.generateString(260);

    const ownerRequestData = {
      userId: ownerId,
      cultureName: longString,
    };
    const response =
      await apiSdk.profiles.ownerUpdateCultureCode(ownerRequestData);
    const dataResponse = await response.json();
    expect(dataResponse.response.status).toBe(400);
    expect(dataResponse.response.errors["Culture.CultureName"][0]).toContain(
      "The field CultureName must be a string with a maximum length of 85.",
    );
  });
});
