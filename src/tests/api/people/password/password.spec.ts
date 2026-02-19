import { expect } from "@playwright/test";
import { test } from "@/src/fixtures/index";
import config from "@/config";

test.describe("API password methods", () => {
  test("POST /people/password - Owner reminds himself of the password.", async ({
    apiSdk,
  }) => {
    const email = config.DOCSPACE_OWNER_EMAIL;
    const response = await apiSdk.password.remindAUserPassword("owner", {
      email,
    });
    const body = await response.json();
    expect(body.statusCode).toBe(200);
    expect(body.response).toBe(
      `The password change instruction has been sent to ${email} email address.`,
    );
  });

  test("POST /people/password - DocSpace admin reminds himself of the password.", async ({
    apiSdk,
    api,
  }) => {
    const user = await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    const responseUser = await user.response.json();
    const email = responseUser.response.email;
    await api.auth.authenticateDocSpaceAdmin();

    const response = await apiSdk.password.remindAUserPassword(
      "docSpaceAdmin",
      {
        email,
      },
    );
    const body = await response.json();
    expect(body.statusCode).toBe(200);
    expect(body.response).toBe(
      `The password change instruction has been sent to ${email} email address.`,
    );
  });

  test("POST /people/password - Room admin reminds himself of the password.", async ({
    apiSdk,
    api,
  }) => {
    const user = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const responseUser = await user.response.json();
    const email = responseUser.response.email;
    await api.auth.authenticateRoomAdmin();

    const response = await apiSdk.password.remindAUserPassword("roomAdmin", {
      email,
    });
    const body = await response.json();
    expect(body.statusCode).toBe(200);
    expect(body.response).toBe(
      `The password change instruction has been sent to ${email} email address.`,
    );
  });

  test("POST /people/password - User reminds himself of the password.", async ({
    apiSdk,
    api,
  }) => {
    const user = await apiSdk.profiles.addMember("owner", "User");
    const responseUser = await user.response.json();
    const email = responseUser.response.email;
    await api.auth.authenticateUser();

    const response = await apiSdk.password.remindAUserPassword("user", {
      email,
    });
    const body = await response.json();
    expect(body.statusCode).toBe(200);
    expect(body.response).toBe(
      `The password change instruction has been sent to ${email} email address.`,
    );
  });

  test("POST /people/password - Guest reminds himself of the password.", async ({
    apiSdk,
    api,
  }) => {
    const user = await apiSdk.profiles.addMember("owner", "Guest");
    const responseUser = await user.response.json();
    const email = responseUser.response.email;
    await api.auth.authenticateGuest();

    const response = await apiSdk.password.remindAUserPassword("guest", {
      email,
    });
    const body = await response.json();
    expect(body.statusCode).toBe(200);
    expect(body.response).toBe(
      `The password change instruction has been sent to ${email} email address.`,
    );
  });

  test("POST /people/password - DocSpace admin reminds the room admin of the password.", async ({
    apiSdk,
    api,
  }) => {
    const roomAdmin = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const responseRoomAdmin = await roomAdmin.response.json();
    const email = responseRoomAdmin.response.email;

    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    const response = await apiSdk.password.remindAUserPassword(
      "docSpaceAdmin",
      {
        email: email,
      },
    );
    const body = await response.json();
    expect(body.statusCode).toBe(200);
    expect(body.response).toBe(
      `The password change instruction has been sent to ${email} email address.`,
    );
  });

  test("POST /people/password - DocSpace admin reminds the user of the password.", async ({
    apiSdk,
    api,
  }) => {
    const user = await apiSdk.profiles.addMember("owner", "User");
    const responseUser = await user.response.json();
    const email = responseUser.response.email;

    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    const response = await apiSdk.password.remindAUserPassword(
      "docSpaceAdmin",
      {
        email: email,
      },
    );
    const body = await response.json();
    expect(body.statusCode).toBe(200);
    expect(body.response).toBe(
      `The password change instruction has been sent to ${email} email address.`,
    );
  });

  test("POST /people/password - DocSpace admin reminds the guest of the password.", async ({
    apiSdk,
    api,
  }) => {
    const guest = await apiSdk.profiles.addMember("owner", "Guest");
    const responseGuest = await guest.response.json();
    const email = responseGuest.response.email;

    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();

    const response = await apiSdk.password.remindAUserPassword(
      "docSpaceAdmin",
      {
        email: email,
      },
    );
    const body = await response.json();
    expect(body.statusCode).toBe(200);
    expect(body.response).toBe(
      `The password change instruction has been sent to ${email} email address.`,
    );
  });
});
