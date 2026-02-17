// Tests that check user access rights.

import { expect } from "@playwright/test";
import { test } from "@/src/fixtures/index";
import config from "@/config";

test.describe("API password methods", () => {
  // 80157 - NEW
  test.skip("POST /people/password - DocSpace administrator reminds the owner of the password.", async ({
    apiSdk,
    api,
  }) => {
    const ownerEmail = config.DOCSPACE_OWNER_EMAIL;
    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    const response = await apiSdk.password.remindAUserPassword(
      "docSpaceAdmin",
      {
        email: ownerEmail,
      },
    );
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.response).toBe("No permissions to perform this action");
  });

  test("POST /people/password - Room admin reminds the owner of the password.", async ({
    apiSdk,
    api,
  }) => {
    const ownerEmail = config.DOCSPACE_OWNER_EMAIL;
    await apiSdk.profiles.addMember("owner", "RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    const response = await apiSdk.password.remindAUserPassword("roomAdmin", {
      email: ownerEmail,
    });
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toBe("No permissions to perform this action");
  });

  test("POST /people/password - User reminds the owner of the password.", async ({
    apiSdk,
    api,
  }) => {
    const ownerEmail = config.DOCSPACE_OWNER_EMAIL;
    await apiSdk.profiles.addMember("owner", "User");
    await api.auth.authenticateUser();

    const response = await apiSdk.password.remindAUserPassword("user", {
      email: ownerEmail,
    });
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toBe("No permissions to perform this action");
  });

  // 80157 - NEW
  test.skip("POST /people/password - DocSpace admin reminds the docspace admin of the password.", async ({
    apiSdk,
    api,
  }) => {
    const docSpaceadmin = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const responseDocSpaceAdmin = await docSpaceadmin.response.json();
    const email = responseDocSpaceAdmin.response.email;

    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    const response = await apiSdk.password.remindAUserPassword(
      "docSpaceAdmin",
      {
        email: email,
      },
    );
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toBe("No permissions to perform this action");
  });

  test("POST /people/password - Room admin reminds the room admin of the password.", async ({
    apiSdk,
    api,
  }) => {
    const roomAdmin = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const responseRoomAdmin = await roomAdmin.response.json();
    const email = responseRoomAdmin.response.email;

    await apiSdk.profiles.addMember("owner", "RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    const response = await apiSdk.password.remindAUserPassword("roomAdmin", {
      email: email,
    });
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toBe("No permissions to perform this action");
  });

  test("POST /people/password - User reminds the user of the password.", async ({
    apiSdk,
    api,
  }) => {
    const user = await apiSdk.profiles.addMember("owner", "User");
    const responseUser = await user.response.json();
    const email = responseUser.response.email;

    await apiSdk.profiles.addMember("owner", "User");
    await api.auth.authenticateUser();

    const response = await apiSdk.password.remindAUserPassword("user", {
      email: email,
    });
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toBe("No permissions to perform this action");
  });

  test("POST /people/password - Room admin reminds the user of the password.", async ({
    apiSdk,
    api,
  }) => {
    const user = await apiSdk.profiles.addMember("owner", "User");
    const responseUser = await user.response.json();
    const email = responseUser.response.email;

    await apiSdk.profiles.addMember("owner", "RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    const response = await apiSdk.password.remindAUserPassword("roomAdmin", {
      email: email,
    });
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toBe("No permissions to perform this action");
  });
});
