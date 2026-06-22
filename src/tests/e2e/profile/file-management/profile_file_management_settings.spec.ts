import { test } from "@/src/fixtures";
import ProfileFileManagement from "@/src/objects/profile/ProfileFileManagement";
import Rooms from "@/src/objects/rooms/Rooms";
import Login from "@/src/objects/common/Login";

test.describe("Profile - File Management settings", () => {
  let profileFileManagement: ProfileFileManagement;
  let myRooms: Rooms;
  let login: Login;

  test.beforeEach(async ({ page, api, login: fixtureLogin }) => {
    profileFileManagement = new ProfileFileManagement(page, api.portalDomain);
    myRooms = new Rooms(page, api.portalDomain);
    login = new Login(page, api.portalDomain);
    await fixtureLogin.loginToPortal();
    await profileFileManagement.open();
  });

  test("Default states of all file management toggles", async () => {
    await test.step("Verify save file copy toggle is on by default", async () => {
      await profileFileManagement.expectSaveCopyOriginalFormatEnabled(true);
    });

    await test.step("Verify display trash notification toggle is on by default", async () => {
      await profileFileManagement.expectDisplayTrashNotificationEnabled(true);
    });

    await test.step("Verify display file extension toggle is off by default", async () => {
      await profileFileManagement.expectDisplayFileExtensionEnabled(false);
    });

    await test.step("Verify cancellation notification toggle is off by default", async () => {
      await profileFileManagement.expectCancellationNotificationEnabled(false);
    });
  });

  test("All toggle changes persist after re-login", async () => {
    await test.step("Change all toggles from their default state", async () => {
      await profileFileManagement.toggleSaveCopyOriginalFormat();
      await profileFileManagement.toggleDisplayTrashNotification();
      await profileFileManagement.toggleDisplayFileExtension();
      await profileFileManagement.toggleCancellationNotification();
    });

    await test.step("Navigate to Rooms, logout and log in again", async () => {
      await myRooms.openWithoutEmptyCheck();
      await login.logout();
      await login.loginToPortal();
    });

    await test.step("Verify all toggles retained their changed state", async () => {
      await profileFileManagement.open();
      await profileFileManagement.expectSaveCopyOriginalFormatEnabled(false);
      await profileFileManagement.expectDisplayTrashNotificationEnabled(false);
      await profileFileManagement.expectDisplayFileExtensionEnabled(true);
      await profileFileManagement.expectCancellationNotificationEnabled(true);
    });
  });

  test("Settings are personal and do not apply to other users", async ({
    apiSdk,
  }) => {
    await test.step("Change all toggles from their default state", async () => {
      await profileFileManagement.toggleSaveCopyOriginalFormat();
      await profileFileManagement.toggleDisplayTrashNotification();
      await profileFileManagement.toggleDisplayFileExtension();
      await profileFileManagement.toggleCancellationNotification();
    });

    await test.step("Navigate to Rooms, logout and login as another user", async () => {
      await myRooms.openWithoutEmptyCheck();
      const { userData } = await apiSdk.profiles.addMember("owner", "User");
      await login.logout();
      await login.loginWithCredentials(userData.email, userData.password);
    });

    await test.step("Verify other user has all default states", async () => {
      await profileFileManagement.open();
      await profileFileManagement.expectSaveCopyOriginalFormatEnabled(true);
      await profileFileManagement.expectDisplayTrashNotificationEnabled(true);
      await profileFileManagement.expectDisplayFileExtensionEnabled(false);
      await profileFileManagement.expectCancellationNotificationEnabled(false);
    });
  });
});
