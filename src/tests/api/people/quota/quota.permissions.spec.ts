// Tests that check user access rights.

import { expect } from "@playwright/test";
import { test } from "@/src/fixtures/index";

test.describe("API quota methods", () => {
  test("PUT /people/userquota - Change a roomAdmin quota limit himself", async ({
    apiSdk,
    paymentsApi,
    api,
  }) => {
    await paymentsApi.setupPayment();
    await apiSdk.settings.userquotasettings("owner", {
      enableQuota: true,
      defaultQuota: 524288000,
    });
    const roomAdmin = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminResponse = await roomAdmin.response.json();
    const roomAdminId = roomAdminResponse.response.id;
    await api.auth.authenticateRoomAdmin();
    const response = await apiSdk.peopleQuota.changeUserQuotaLimit(
      "roomAdmin",
      {
        userIds: [roomAdminId],
        quota: 104857600,
      },
    );
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toBe("Access denied");
  });

  test("PUT /people/userquota - Room admin change a other users quota limit", async ({
    apiSdk,
    paymentsApi,
    api,
  }) => {
    await paymentsApi.setupPayment();
    await apiSdk.settings.userquotasettings("owner", {
      enableQuota: true,
      defaultQuota: 524288000,
    });
    const owner = await apiSdk.profiles.returnHimselfInformation("owner");
    const ownerResponse = await owner.json();
    const ownerId = ownerResponse.response.id;

    const docSpaceAdmin = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const docSpaceAdminResponse = await docSpaceAdmin.response.json();
    const docSpaceAdminId = docSpaceAdminResponse.response.id;

    const user = await apiSdk.profiles.addMember("owner", "User");
    const userResponse = await user.response.json();
    const userId = userResponse.response.id;

    await apiSdk.profiles.addMember("owner", "RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    const response = await apiSdk.peopleQuota.changeUserQuotaLimit(
      "roomAdmin",
      {
        userIds: [ownerId, docSpaceAdminId, userId],
        quota: 104857600,
      },
    );
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toBe("Access denied");
  });

  test("PUT /people/userquota - User change a other users quota limit", async ({
    apiSdk,
    paymentsApi,
    api,
  }) => {
    await paymentsApi.setupPayment();
    await apiSdk.settings.userquotasettings("owner", {
      enableQuota: true,
      defaultQuota: 524288000,
    });
    const owner = await apiSdk.profiles.returnHimselfInformation("owner");
    const ownerResponse = await owner.json();
    const ownerId = ownerResponse.response.id;

    const docSpaceAdmin = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const docSpaceAdminResponse = await docSpaceAdmin.response.json();
    const docSpaceAdminId = docSpaceAdminResponse.response.id;

    const roomAdmin = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminResponse = await roomAdmin.response.json();
    const roomAdminId = roomAdminResponse.response.id;

    await apiSdk.profiles.addMember("owner", "User");
    await api.auth.authenticateUser();
    const response = await apiSdk.peopleQuota.changeUserQuotaLimit("user", {
      userIds: [ownerId, docSpaceAdminId, roomAdminId],
      quota: 104857600,
    });
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toBe("Access denied");
  });

  test("PUT /people/userquota - Guest change a other users quota limit", async ({
    apiSdk,
    paymentsApi,
    api,
  }) => {
    await paymentsApi.setupPayment();
    await apiSdk.settings.userquotasettings("owner", {
      enableQuota: true,
      defaultQuota: 524288000,
    });
    const owner = await apiSdk.profiles.returnHimselfInformation("owner");
    const ownerResponse = await owner.json();
    const ownerId = ownerResponse.response.id;

    const docSpaceAdmin = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const docSpaceAdminResponse = await docSpaceAdmin.response.json();
    const docSpaceAdminId = docSpaceAdminResponse.response.id;

    const roomAdmin = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminResponse = await roomAdmin.response.json();
    const roomAdminId = roomAdminResponse.response.id;

    const user = await apiSdk.profiles.addMember("owner", "User");
    const userResponse = await user.response.json();
    const userId = userResponse.response.id;

    await apiSdk.profiles.addMember("owner", "Guest");
    await api.auth.authenticateGuest();
    const response = await apiSdk.peopleQuota.changeUserQuotaLimit("guest", {
      userIds: [ownerId, docSpaceAdminId, roomAdminId, userId],
      quota: 104857600,
    });
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toBe("Access denied");
  });

  test("PUT /people/resetquota - Reset a roomAdmin quota limit himself", async ({
    apiSdk,
    paymentsApi,
    api,
  }) => {
    await paymentsApi.setupPayment();
    await apiSdk.settings.userquotasettings("owner", {
      enableQuota: true,
      defaultQuota: 524288000,
    });
    const roomAdmin = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminResponse = await roomAdmin.response.json();
    const roomAdminId = roomAdminResponse.response.id;
    await apiSdk.peopleQuota.changeUserQuotaLimit("owner", {
      userIds: [roomAdminId],
      quota: 104857600,
    });
    await api.auth.authenticateRoomAdmin();
    const response = await apiSdk.peopleQuota.resetUserQuotaLimit("roomAdmin", {
      userIds: [roomAdminId],
    });

    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toBe("Access denied");
  });

  test("PUT /people/resetquota - Room admin reset a other users quota limit", async ({
    apiSdk,
    paymentsApi,
    api,
  }) => {
    await paymentsApi.setupPayment();
    await apiSdk.settings.userquotasettings("owner", {
      enableQuota: true,
      defaultQuota: 524288000,
    });
    const owner = await apiSdk.profiles.returnHimselfInformation("owner");
    const ownerResponse = await owner.json();
    const ownerId = ownerResponse.response.id;

    const docSpaceAdmin = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const docSpaceAdminResponse = await docSpaceAdmin.response.json();
    const docSpaceAdminId = docSpaceAdminResponse.response.id;

    const user = await apiSdk.profiles.addMember("owner", "User");
    const userResponse = await user.response.json();
    const userId = userResponse.response.id;

    await apiSdk.peopleQuota.changeUserQuotaLimit("owner", {
      userIds: [ownerId, docSpaceAdminId, userId],
      quota: 104857600,
    });
    await apiSdk.profiles.addMember("owner", "RoomAdmin");
    await api.auth.authenticateRoomAdmin();

    const response = await apiSdk.peopleQuota.resetUserQuotaLimit("roomAdmin", {
      userIds: [ownerId, docSpaceAdminId, userId],
    });

    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toBe("Access denied");
  });

  test("PUT /people/resetquota - User reset a other users quota limit", async ({
    apiSdk,
    paymentsApi,
    api,
  }) => {
    await paymentsApi.setupPayment();
    await apiSdk.settings.userquotasettings("owner", {
      enableQuota: true,
      defaultQuota: 524288000,
    });
    const owner = await apiSdk.profiles.returnHimselfInformation("owner");
    const ownerResponse = await owner.json();
    const ownerId = ownerResponse.response.id;

    const docSpaceAdmin = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const docSpaceAdminResponse = await docSpaceAdmin.response.json();
    const docSpaceAdminId = docSpaceAdminResponse.response.id;

    const roomAdmin = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminResponse = await roomAdmin.response.json();
    const roomAdminId = roomAdminResponse.response.id;

    await apiSdk.peopleQuota.changeUserQuotaLimit("owner", {
      userIds: [ownerId, docSpaceAdminId, roomAdminId],
      quota: 104857600,
    });

    await apiSdk.profiles.addMember("owner", "User");
    await api.auth.authenticateUser();

    const response = await apiSdk.peopleQuota.resetUserQuotaLimit("user", {
      userIds: [ownerId, docSpaceAdminId, roomAdminId],
    });
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toBe("Access denied");
  });

  test("PUT /people/resetquota - Guest reset a other users quota limit", async ({
    apiSdk,
    paymentsApi,
    api,
  }) => {
    await paymentsApi.setupPayment();
    await apiSdk.settings.userquotasettings("owner", {
      enableQuota: true,
      defaultQuota: 524288000,
    });
    const owner = await apiSdk.profiles.returnHimselfInformation("owner");
    const ownerResponse = await owner.json();
    const ownerId = ownerResponse.response.id;

    const docSpaceAdmin = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const docSpaceAdminResponse = await docSpaceAdmin.response.json();
    const docSpaceAdminId = docSpaceAdminResponse.response.id;

    const roomAdmin = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminResponse = await roomAdmin.response.json();
    const roomAdminId = roomAdminResponse.response.id;

    const user = await apiSdk.profiles.addMember("owner", "User");
    const userResponse = await user.response.json();
    const userId = userResponse.response.id;

    await apiSdk.peopleQuota.changeUserQuotaLimit("owner", {
      userIds: [ownerId, docSpaceAdminId, roomAdminId, userId],
      quota: 104857600,
    });

    await apiSdk.profiles.addMember("owner", "Guest");
    await api.auth.authenticateGuest();

    const response = await apiSdk.peopleQuota.resetUserQuotaLimit("guest", {
      userIds: [ownerId, docSpaceAdminId, roomAdminId, userId],
    });
    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toBe("Access denied");
  });
});
