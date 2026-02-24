import { expect } from "@playwright/test";
import { test } from "@/src/fixtures/index";
import {
  QuotaPlan,
  quotaPlanToBytes,
} from "@/src/services/people/peopleQuota.services";
import {
  DefaultQuota,
  defaultQuotaToBytes,
} from "@/src/services/settings/quota.services";

test.describe("API quota methods", () => {
  test("PUT /people/userquota - Change a owner quota limit", async ({
    apiSdk,
    paymentsApi,
  }) => {
    await paymentsApi.setupPayment();
    await apiSdk.settings.userquotasettings("owner", {
      enableQuota: true,
      defaultQuota: DefaultQuota.User,
    });
    const owner = await apiSdk.profiles.returnHimselfInformation("owner");
    const ownerResponse = await owner.json();
    const ownerId = ownerResponse.response.id;
    const response = await apiSdk.peopleQuota.changeUserQuotaLimit("owner", {
      userIds: [ownerId],
      quota: QuotaPlan.Minimal,
    });
    const body = await response.json();
    expect(body.statusCode).toBe(200);
    expect(body.response[0].isOwner).toBe(true);
    expect(body.response[0].quotaLimit).toBe(
      quotaPlanToBytes[QuotaPlan.Minimal],
    );
  });

  test("PUT /people/userquota - Owner change a other users quota limit", async ({
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

    const roomAdmin = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminResponse = await roomAdmin.response.json();
    const roomAdminId = roomAdminResponse.response.id;

    const user = await apiSdk.profiles.addMember("owner", "User");
    const userResponse = await user.response.json();
    const userId = userResponse.response.id;

    const response = await apiSdk.peopleQuota.changeUserQuotaLimit("owner", {
      userIds: [docspaceAdminId, roomAdminId, userId],
      quota: QuotaPlan.Minimal,
    });
    const body = await response.json();
    expect(body.statusCode).toBe(200);
    expect(body.response[0].isAdmin).toBe(true);
    expect(body.response[0].quotaLimit).toBe(QuotaPlan.Minimal);
    expect(body.response[1].isRoomAdmin).toBe(true);
    expect(body.response[1].quotaLimit).toBe(QuotaPlan.Minimal);
    expect(body.response[2].isCollaborator).toBe(true);
    expect(body.response[2].quotaLimit).toBe(QuotaPlan.Minimal);
  });

  test("PUT /people/userquota - DocSpaceAdmin change a other users quota limit", async ({
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

    const roomAdmin = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminResponse = await roomAdmin.response.json();
    const roomAdminId = roomAdminResponse.response.id;

    const user = await apiSdk.profiles.addMember("owner", "User");
    const userResponse = await user.response.json();
    const userId = userResponse.response.id;

    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();
    const response = await apiSdk.peopleQuota.changeUserQuotaLimit(
      "docSpaceAdmin",
      {
        userIds: [ownerId, roomAdminId, userId],
        quota: QuotaPlan.Minimal,
      },
    );
    const body = await response.json();
    expect(body.statusCode).toBe(200);
    expect(body.response[0].isOwner).toBe(true);
    expect(body.response[0].quotaLimit).toBe(QuotaPlan.Minimal);
    expect(body.response[1].isRoomAdmin).toBe(true);
    expect(body.response[1].quotaLimit).toBe(QuotaPlan.Minimal);
    expect(body.response[2].isCollaborator).toBe(true);
    expect(body.response[2].quotaLimit).toBe(QuotaPlan.Minimal);
  });

  test("PUT /people/resetquota - Reset a owner quota limit", async ({
    apiSdk,
    paymentsApi,
  }) => {
    await paymentsApi.setupPayment();
    await apiSdk.settings.userquotasettings("owner", {
      enableQuota: true,
      defaultQuota: DefaultQuota.User,
    });
    const owner = await apiSdk.profiles.returnHimselfInformation("owner");
    const ownerResponse = await owner.json();
    const ownerId = ownerResponse.response.id;
    await apiSdk.peopleQuota.changeUserQuotaLimit("owner", {
      userIds: [ownerId],
      quota: QuotaPlan.Minimal,
    });

    const response = await apiSdk.peopleQuota.resetUserQuotaLimit("owner", {
      userIds: [ownerId],
    });
    const body = await response.json();
    expect(body.statusCode).toBe(200);
    expect(body.response[0].isOwner).toBe(true);
    expect(body.response[0].quotaLimit).toBe(
      defaultQuotaToBytes[DefaultQuota.User],
    );
  });

  test("PUT /people/resetquota - Owner reset a other users quota limit", async ({
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

    const roomAdmin = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminResponse = await roomAdmin.response.json();
    const roomAdminId = roomAdminResponse.response.id;

    const user = await apiSdk.profiles.addMember("owner", "User");
    const userResponse = await user.response.json();
    const userId = userResponse.response.id;

    await apiSdk.peopleQuota.changeUserQuotaLimit("owner", {
      userIds: [docspaceAdminId, roomAdminId, userId],
      quota: QuotaPlan.Minimal,
    });
    const response = await apiSdk.peopleQuota.resetUserQuotaLimit("owner", {
      userIds: [docspaceAdminId, roomAdminId, userId],
    });
    const body = await response.json();
    expect(body.statusCode).toBe(200);
    expect(body.response[0].isAdmin).toBe(true);
    expect(body.response[0].quotaLimit).toBe(
      defaultQuotaToBytes[DefaultQuota.User],
    );
    expect(body.response[1].isRoomAdmin).toBe(true);
    expect(body.response[1].quotaLimit).toBe(
      defaultQuotaToBytes[DefaultQuota.User],
    );
    expect(body.response[2].isCollaborator).toBe(true);
    expect(body.response[2].quotaLimit).toBe(
      defaultQuotaToBytes[DefaultQuota.User],
    );
  });

  test("PUT /people/resetquota - DocSpaceAdmin reset a other users quota limit", async ({
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

    const roomAdmin = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminResponse = await roomAdmin.response.json();
    const roomAdminId = roomAdminResponse.response.id;

    const user = await apiSdk.profiles.addMember("owner", "User");
    const userResponse = await user.response.json();
    const userId = userResponse.response.id;

    await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    await api.auth.authenticateDocSpaceAdmin();
    await apiSdk.peopleQuota.changeUserQuotaLimit("docSpaceAdmin", {
      userIds: [ownerId, roomAdminId, userId],
      quota: QuotaPlan.Minimal,
    });
    const response = await apiSdk.peopleQuota.resetUserQuotaLimit(
      "docSpaceAdmin",
      {
        userIds: [ownerId, roomAdminId, userId],
      },
    );
    const body = await response.json();
    expect(body.statusCode).toBe(200);
    expect(body.response[0].isOwner).toBe(true);
    expect(body.response[0].quotaLimit).toBe(
      defaultQuotaToBytes[DefaultQuota.User],
    );
    expect(body.response[1].isRoomAdmin).toBe(true);
    expect(body.response[1].quotaLimit).toBe(
      defaultQuotaToBytes[DefaultQuota.User],
    );
    expect(body.response[2].isCollaborator).toBe(true);
    expect(body.response[2].quotaLimit).toBe(
      defaultQuotaToBytes[DefaultQuota.User],
    );
  });
});
