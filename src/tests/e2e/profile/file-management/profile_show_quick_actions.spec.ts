import { test } from "@/src/fixtures";
import ProfileFileManagement from "@/src/objects/profile/ProfileFileManagement";
import Files from "@/src/objects/files/Files";
import Rooms from "@/src/objects/rooms/Rooms";

test.describe("Profile - Show quick actions", () => {
  let profileFileManagement: ProfileFileManagement;
  let files: Files;
  let myRooms: Rooms;

  test.beforeEach(async ({ page, api, login }) => {
    profileFileManagement = new ProfileFileManagement(page, api.portalDomain);
    files = new Files(page, api.portalDomain);
    myRooms = new Rooms(page, api.portalDomain);
    await login.loginToPortal();
  });

  test("Quick actions panel is shown by default", async () => {
    await test.step("Verify panel is visible on Files", async () => {
      await files.open();
      await files.quickActions.checkPanelVisible();
    });

    await test.step("Verify toggle is enabled by default", async () => {
      await profileFileManagement.open();
      await profileFileManagement.expectShowQuickActionsEnabled(true);
    });
  });

  test("Closing the panel hides it and shows an undo toast", async () => {
    await test.step("Open Files and close the quick actions panel", async () => {
      await files.open();
      await files.quickActions.hidePanel();
    });

    await test.step("Verify the hidden toast is shown", async () => {
      await files.checkToastMessage("Quick actions hidden");
    });

    await test.step("Verify panel is no longer visible", async () => {
      await files.quickActions.checkPanelHidden();
    });

    await test.step("Verify toggle reflects the hidden state in profile", async () => {
      await profileFileManagement.open();
      await profileFileManagement.expectShowQuickActionsEnabled(false);
    });
  });

  test("Undo in the toast restores the panel", async () => {
    await test.step("Open Files and close the quick actions panel", async () => {
      await files.open();
      await files.quickActions.hidePanel();
      await files.quickActions.checkPanelHidden();
    });

    await test.step("Click Undo in the toast", async () => {
      await files.clickToastLink("Undo");
    });

    await test.step("Verify panel is visible again", async () => {
      await files.quickActions.checkPanelVisible();
    });
  });

  test("Disabling the toggle in profile hides the panel", async () => {
    await test.step("Disable the show quick actions toggle", async () => {
      await profileFileManagement.open();
      await profileFileManagement.toggleShowQuickActions();
      await profileFileManagement.expectShowQuickActionsEnabled(false);
    });

    await test.step("Verify panel is hidden on Files", async () => {
      await files.open();
      await files.quickActions.checkPanelHidden();
    });
  });

  test("Re-enabling the toggle in profile restores the panel", async () => {
    await test.step("Disable then re-enable the show quick actions toggle", async () => {
      await profileFileManagement.open();
      await profileFileManagement.toggleShowQuickActions();
      await profileFileManagement.expectShowQuickActionsEnabled(false);
      await profileFileManagement.toggleShowQuickActions();
      await profileFileManagement.expectShowQuickActionsEnabled(true);
    });

    await test.step("Verify panel is visible on Files", async () => {
      await files.open();
      await files.quickActions.checkPanelVisible();
    });
  });

  test("Setting persists after re-login", async ({ login }) => {
    await test.step("Hide the quick actions panel", async () => {
      await files.open();
      await files.quickActions.hidePanel();
    });

    await test.step("Navigate to Rooms, logout and log in again", async () => {
      await myRooms.openWithoutEmptyCheck();
      await login.logout();
      await login.loginToPortal();
    });

    await test.step("Verify toggle is still disabled", async () => {
      await profileFileManagement.open();
      await profileFileManagement.expectShowQuickActionsEnabled(false);
    });

    await test.step("Verify panel is still hidden on Files", async () => {
      await files.open();
      await files.quickActions.checkPanelHidden();
    });
  });

  test("Setting is personal and does not apply to other users", async ({
    apiSdk,
    login,
  }) => {
    await test.step("Hide the quick actions panel", async () => {
      await files.open();
      await files.quickActions.hidePanel();
    });

    await test.step("Navigate to Rooms, logout and login as another user", async () => {
      await myRooms.openWithoutEmptyCheck();
      const { userData } = await apiSdk.profiles.addMember("owner", "User");
      await login.logout();
      await login.loginWithCredentials(userData.email, userData.password);
    });

    await test.step("Verify the other user still sees the panel by default", async () => {
      await files.open();
      await files.quickActions.checkPanelVisible();
      await profileFileManagement.open();
      await profileFileManagement.expectShowQuickActionsEnabled(true);
    });
  });
});
