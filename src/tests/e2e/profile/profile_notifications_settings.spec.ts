import { test } from "@/src/fixtures";
import ProfileNotifications from "@/src/objects/profile/ProfileNotifications";

test.describe("Profile - Notifications", () => {
  let profileNotifications: ProfileNotifications;

  test.beforeEach(async ({ page, api, login }) => {
    profileNotifications = new ProfileNotifications(page, api.portalDomain);
    await login.loginToPortal();
    await profileNotifications.open();
  });

  test("All notification setting descriptions are visible", async () => {
    await test.step("Verify file activity description", async () => {
      await profileNotifications.expectFileActivityDescriptionVisible();
    });

    await test.step("Verify rooms activity description", async () => {
      await profileNotifications.expectRoomsActivityDescriptionVisible();
    });

    await test.step("Verify daily feed description", async () => {
      await profileNotifications.expectDailyFeedDescriptionVisible();
    });

    await test.step("Verify useful tips description", async () => {
      await profileNotifications.expectUsefulTipsDescriptionVisible();
    });
  });

  test("File activity notifications toggle can be disabled and enabled", async ({
    page,
  }) => {
    await test.step("Verify toggle is on by default", async () => {
      await profileNotifications.expectFileActivityEnabled(true);
    });

    await test.step("Disable the toggle", async () => {
      await profileNotifications.toggleFileActivity();
    });

    await test.step("Verify toggle is off after reload", async () => {
      await page.reload();
      await profileNotifications.expectFileActivityEnabled(false);
    });

    await test.step("Enable the toggle", async () => {
      await profileNotifications.toggleFileActivity();
    });

    await test.step("Verify toggle is on after reload", async () => {
      await page.reload();
      await profileNotifications.expectFileActivityEnabled(true);
    });
  });

  test("Rooms activity toggle can be disabled and enabled", async ({
    page,
  }) => {
    await test.step("Verify toggle is on by default", async () => {
      await profileNotifications.expectRoomsActivityEnabled(true);
    });

    await test.step("Disable the toggle", async () => {
      await profileNotifications.toggleRoomsActivity();
    });

    await test.step("Verify toggle is off after reload", async () => {
      await page.reload();
      await profileNotifications.expectRoomsActivityEnabled(false);
    });

    await test.step("Enable the toggle", async () => {
      await profileNotifications.toggleRoomsActivity();
    });

    await test.step("Verify toggle is on after reload", async () => {
      await page.reload();
      await profileNotifications.expectRoomsActivityEnabled(true);
    });
  });

  test("Daily DocSpace feed toggle can be disabled and enabled", async ({
    page,
  }) => {
    await test.step("Verify toggle is on by default", async () => {
      await profileNotifications.expectDailyFeedEnabled(true);
    });

    await test.step("Disable the toggle", async () => {
      await profileNotifications.toggleDailyFeed();
    });

    await test.step("Verify toggle is off after reload", async () => {
      await page.reload();
      await profileNotifications.expectDailyFeedEnabled(false);
    });

    await test.step("Enable the toggle", async () => {
      await profileNotifications.toggleDailyFeed();
    });

    await test.step("Verify toggle is on after reload", async () => {
      await page.reload();
      await profileNotifications.expectDailyFeedEnabled(true);
    });
  });

  test("Useful DocSpace tips toggle can be disabled and enabled", async ({
    page,
  }) => {
    await test.step("Verify toggle is on by default", async () => {
      await profileNotifications.expectUsefulTipsEnabled(true);
    });

    await test.step("Disable the toggle", async () => {
      await profileNotifications.toggleUsefulTips();
    });

    await test.step("Verify toggle is off after reload", async () => {
      await page.reload();
      await profileNotifications.expectUsefulTipsEnabled(false);
    });

    await test.step("Enable the toggle", async () => {
      await profileNotifications.toggleUsefulTips();
    });

    await test.step("Verify toggle is on after reload", async () => {
      await page.reload();
      await profileNotifications.expectUsefulTipsEnabled(true);
    });
  });
});
