// Tests that check user access rights.

import { expect } from "@playwright/test";
import { test } from "@/src/fixtures/index";
import { QuotaPlan } from "@/src/services/people/peopleQuota.services";
import { DefaultQuota } from "@/src/services/settings/quota.services";

test.describe("API quota methods", () => {
  test("PUT /people/userquota - Change a roomAdmin quota limit himself", async ({
    apiSdk,
    paymentsApi,
    api,
  }) => {
    await paymentsApi.setupPayment();
    await apiSdk.settings.userquotasettings("owner", {
      enableQuota: true,
      defaultQuota: DefaultQuota.User,
    });
    const roomAdmin = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminResponse = await roomAdmin.response.json();
    const roomAdminId = roomAdminResponse.response.id;
    await api.auth.authenticateRoomAdmin();
    const response = await apiSdk.peopleQuota.changeUserQuotaLimit(
      "roomAdmin",
      {
        userIds: [roomAdminId],
        quota: QuotaPlan.Minimal,
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
      defaultQuota: DefaultQuota.User,
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
        quota: QuotaPlan.Minimal,
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
      defaultQuota: DefaultQuota.User,
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
      quota: QuotaPlan.Minimal,
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
      defaultQuota: DefaultQuota.User,
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
      quota: QuotaPlan.Minimal,
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
      defaultQuota: DefaultQuota.User,
    });
    const roomAdmin = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminResponse = await roomAdmin.response.json();
    const roomAdminId = roomAdminResponse.response.id;
    await apiSdk.peopleQuota.changeUserQuotaLimit("owner", {
      userIds: [roomAdminId],
      quota: QuotaPlan.Minimal,
    });
    await api.auth.authenticateRoomAdmin();
    const response = await apiSdk.peopleQuota.resetUserQuotaLimit("roomAdmin", {
      userIds: [roomAdminId],
    });

    const body = await response.json();
    expect(body.statusCode).toBe(403);
    expect(body.error.message).toBe("Access denied");
  });

  test("PUT /people/resetquota - Room admin has reset the quota limit of other users.", async ({
    apiSdk,
    paymentsApi,
    api,
  }) => {
    await paymentsApi.setupPayment();
    await apiSdk.settings.userquotasettings("owner", {
      enableQuota: true,
      defaultQuota: DefaultQuota.User,
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
      quota: QuotaPlan.Minimal,
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

  test("PUT /people/resetquota - User has reset the quota limit of other users.", async ({
    apiSdk,
    paymentsApi,
    api,
  }) => {
    await paymentsApi.setupPayment();
    await apiSdk.settings.userquotasettings("owner", {
      enableQuota: true,
      defaultQuota: DefaultQuota.User,
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
      quota: QuotaPlan.Minimal,
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

  test("PUT /people/resetquota - Guest has reset the quota limit of other users.", async ({
    apiSdk,
    paymentsApi,
    api,
  }) => {
    await paymentsApi.setupPayment();
    await apiSdk.settings.userquotasettings("owner", {
      enableQuota: true,
      defaultQuota: DefaultQuota.User,
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
      quota: QuotaPlan.Minimal,
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

  test("PUT /people/userquota - Change a quota limit user without autorization", async ({
    apiSdk,
    paymentsApi,
  }) => {
    await paymentsApi.setupPayment();
    await apiSdk.settings.userquotasettings("owner", {
      enableQuota: true,
      defaultQuota: DefaultQuota.User,
    });
    const roomAdmin = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminResponse = await roomAdmin.response.json();
    const roomAdminId = roomAdminResponse.response.id;

    const response =
      await apiSdk.peopleQuota.changeUserQuotaLimitWithoutAutorization({
        userIds: [roomAdminId],
        quota: QuotaPlan.Minimal,
      });
    expect(response.status()).toBe(401);
  });

  test("PUT /people/resetquota - Reset a quota limit user without autorization", async ({
    apiSdk,
    paymentsApi,
  }) => {
    await paymentsApi.setupPayment();
    await apiSdk.settings.userquotasettings("owner", {
      enableQuota: true,
      defaultQuota: DefaultQuota.User,
    });
    const roomAdmin = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminResponse = await roomAdmin.response.json();
    const roomAdminId = roomAdminResponse.response.id;
    await apiSdk.peopleQuota.changeUserQuotaLimit("owner", {
      userIds: [roomAdminId],
      quota: QuotaPlan.Minimal,
    });

    const response =
      await apiSdk.peopleQuota.resetUserQuotaLimitWithoutAutorization({
        userIds: [roomAdminId],
      });
    expect(response.status()).toBe(401);
  });

  // 80301 - NEW
  test.skip("PUT /people/userquota - Owner changes the user's quota limit to a value higher than the total storage size", async ({
    apiSdk,
    paymentsApi,
  }) => {
    await paymentsApi.setupPayment();
    await apiSdk.settings.userquotasettings("owner", {
      enableQuota: true,
      defaultQuota: DefaultQuota.User,
    });
    const docspaceAdmin = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const docspaceAdminResponse = await docspaceAdmin.response.json();
    const docspaceAdminId = docspaceAdminResponse.response.id;

    const response = await apiSdk.peopleQuota.changeUserQuotaLimit("owner", {
      userIds: [docspaceAdminId],
      quota: QuotaPlan.OverSize,
    });
    const body = await response.json();
    expect(body.statusCode).toBe(402);
    expect(body.error.message).toBe(
      "Failed to set quota per user. The entered value is greater than the total DocSpace storage.",
    );
  });
});
