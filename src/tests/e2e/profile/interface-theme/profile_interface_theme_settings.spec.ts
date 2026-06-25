import { test } from "@/src/fixtures";
import { Profile } from "@/src/objects/profile/Profile";
import Login from "@/src/objects/common/Login";

test.describe("Profile - Interface theme settings", () => {
  let profile: Profile;
  let login: Login;

  test.beforeEach(async ({ page, api, login: fixtureLogin }) => {
    profile = new Profile(page);
    login = new Login(page, api.portalDomain);
    await fixtureLogin.loginToPortal();
    await profile.open();
    await profile.selectInterfaceThemeTabs();
  });

  test("Light theme is active and system theme is enabled by default", async () => {
    await test.step("Verify Light theme radio is selected", async () => {
      await profile.expectThemeSelected("Light");
    });

    await test.step("Verify system theme checkbox is checked", async () => {
      await profile.expectSystemThemeEnabled(true);
    });
  });

  test("Dark theme can be selected manually", async () => {
    await test.step("Select Dark theme", async () => {
      await profile.selectTheme("Dark");
    });

    await test.step("Verify Dark theme is applied and system theme is off", async () => {
      await profile.expectThemeApplied("Dark");
      await profile.expectSystemThemeEnabled(false);
    });
  });

  test("System theme checkbox can be disabled and re-enabled", async () => {
    await test.step("Disable system theme", async () => {
      await profile.toggleSystemThemeCheckbox(false);
      await profile.expectSystemThemeEnabled(false);
    });

    await test.step("Re-enable system theme", async () => {
      await profile.toggleSystemThemeCheckbox(true);
      await profile.expectSystemThemeEnabled(true);
    });
  });

  test("Selecting manual theme unchecks system theme checkbox", async () => {
    await test.step("Select Dark theme manually", async () => {
      await profile.selectTheme("Dark");
    });

    await test.step("Verify system theme is unchecked and Dark theme is applied", async () => {
      await profile.expectSystemThemeEnabled(false);
      await profile.expectThemeApplied("Dark");
    });
  });

  test("Selected theme persists after page reload", async () => {
    await test.step("Select Dark theme", async () => {
      await profile.selectTheme("Dark");
      await profile.expectThemeApplied("Dark");
    });

    await test.step("Reload page and verify Dark theme is still applied", async () => {
      await profile.open();
      await profile.expectThemeApplied("Dark");
    });
  });

  test("Theme setting is personal and does not affect other users", async ({
    apiSdk,
  }) => {
    await test.step("Select Dark theme for owner", async () => {
      await profile.selectTheme("Dark");
      await profile.expectThemeApplied("Dark");
    });

    await test.step("Logout and login as another user", async () => {
      await login.logout();
      const { userData } = await apiSdk.profiles.addMember("owner", "User");
      await login.loginWithCredentials(userData.email, userData.password);
    });

    await test.step("Verify other user has default theme settings", async () => {
      await profile.open();
      await profile.selectInterfaceThemeTabs();
      await profile.expectThemeSelected("Light");
      await profile.expectSystemThemeEnabled(true);
    });
  });
});
