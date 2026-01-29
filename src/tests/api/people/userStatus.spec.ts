import { expect } from "@playwright/test";
import { test } from "@/src/fixtures/index";
import { UserStatus } from "@/src/services/people/userStatus.services";

test.describe("API user status methods", () => {
  test("Owner deactivates the user", async ({ apiSdk }) => {
    const user = await apiSdk.profiles.ownerAddMember("User");
    const body = await user.response.json();
    const userId = body.response.id;

    const userData = {
      userIds: [userId],
      resendAll: false,
    };

    const response = await apiSdk.userStatus.changeUserStatus(
      UserStatus.Disabled,
      userData,
    );
    const bodyResponse = await response.json();
    const userInfo = bodyResponse.response[0];
    expect(bodyResponse.statusCode).toBe(200);
    expect(userInfo.isCollaborator).toBe(true);
    expect(userInfo.status).toBe(2);
    expect(userInfo.isOwner).toBe(false);
    expect(userInfo.isVisitor).toBe(false);
    expect(userInfo.isAdmin).toBe(false);
    expect(userInfo.isRoomAdmin).toBe(false);
    expect(userInfo.isLDAP).toBe(false);
    expect(userInfo.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  test("Owner activates the user", async ({ apiSdk }) => {
    const user = await apiSdk.profiles.ownerAddMember("User");
    const body = await user.response.json();
    const userId = body.response.id;

    const userData = {
      userIds: [userId],
      resendAll: false,
    };
    await apiSdk.userStatus.changeUserStatus(UserStatus.Disabled, userData);
    const activateResponse = await apiSdk.userStatus.changeUserStatus(
      UserStatus.Active,
      userData,
    );
    const bodyResponse = await activateResponse.json();
    const userInfo = bodyResponse.response[0];
    expect(bodyResponse.statusCode).toBe(200);
    expect(userInfo.isCollaborator).toBe(true);
    expect(userInfo.status).toBe(1);
    expect(userInfo.isOwner).toBe(false);
    expect(userInfo.isVisitor).toBe(false);
    expect(userInfo.isAdmin).toBe(false);
    expect(userInfo.isRoomAdmin).toBe(false);
    expect(userInfo.isLDAP).toBe(false);
    expect(userInfo.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
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
});

//TODO: write tests from different users
