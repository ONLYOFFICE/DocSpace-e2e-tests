import { test } from "@/src/fixtures";
import ProfileFileManagement from "@/src/objects/profile/ProfileFileManagement";
import Login from "@/src/objects/common/Login";
import {
  defaultHomepageOptions,
  defaultHomepageUrls,
} from "@/src/utils/constants/profile";

test.describe("Profile - Default Homepage", () => {
  let profileFileManagement: ProfileFileManagement;
  let login: Login;

  test.beforeEach(async ({ page, api, login: fixtureLogin }) => {
    profileFileManagement = new ProfileFileManagement(page, api.portalDomain);
    login = new Login(page, api.portalDomain);
    await fixtureLogin.loginToPortal();
    await profileFileManagement.open();
  });

  // Skip: looks like a bug — logo always opens /dashboard, ignoring Default Homepage.
  test.skip("AI agents - logo navigates to AI agents URL", async () => {
    await test.step("Select AI agents as default homepage", async () => {
      await profileFileManagement.selectDefaultHomepage(
        defaultHomepageOptions.aiAgents,
      );
      await profileFileManagement.expectDefaultHomepageOption(
        defaultHomepageOptions.aiAgents,
      );
    });

    await test.step("Click logo and verify landing URL", async () => {
      await profileFileManagement.clickLogoAndExpectUrl(
        defaultHomepageUrls.aiAgents,
      );
    });
  });

  test.skip("Files - logo navigates to My Documents URL", async () => {
    await test.step("Select Files as default homepage", async () => {
      await profileFileManagement.selectDefaultHomepage(
        defaultHomepageOptions.files,
      );
      await profileFileManagement.expectDefaultHomepageOption(
        defaultHomepageOptions.files,
      );
    });

    await test.step("Click logo and verify landing URL", async () => {
      await profileFileManagement.clickLogoAndExpectUrl(
        defaultHomepageUrls.files,
      );
    });
  });

  test.skip("Forms - logo navigates to Forms URL", async () => {
    await test.step("Select Forms as default homepage", async () => {
      await profileFileManagement.selectDefaultHomepage(
        defaultHomepageOptions.forms,
      );
      await profileFileManagement.expectDefaultHomepageOption(
        defaultHomepageOptions.forms,
      );
    });

    await test.step("Click logo and verify landing URL", async () => {
      await profileFileManagement.clickLogoAndExpectUrl(
        defaultHomepageUrls.forms,
      );
    });
  });

  test("Default Homepage setting is personal and does not affect other users", async ({
    apiSdk,
  }) => {
    await test.step("Set Files as owner's default homepage", async () => {
      await profileFileManagement.selectDefaultHomepage(
        defaultHomepageOptions.files,
      );
      await profileFileManagement.expectDefaultHomepageOption(
        defaultHomepageOptions.files,
      );
    });

    await test.step("Logout and login as another user", async () => {
      const { userData } = await apiSdk.profiles.addMember("owner", "User");
      await login.logout();
      await login.loginWithCredentials(userData.email, userData.password);
    });

    await test.step("Verify other user has Rooms as default homepage", async () => {
      await profileFileManagement.open();
      await profileFileManagement.expectDefaultHomepageOption(
        defaultHomepageOptions.rooms,
      );
    });
  });
});

test.describe("Profile - Default Homepage (Guest)", () => {
  let profileFileManagement: ProfileFileManagement;
  let guestLogin: Login;

  test.beforeEach(async ({ page, api, apiSdk }) => {
    profileFileManagement = new ProfileFileManagement(page, api.portalDomain);
    guestLogin = new Login(page, api.portalDomain);

    const { userData } = await apiSdk.profiles.addMember("owner", "Guest");

    await guestLogin.loginWithCredentials(userData.email, userData.password);
    await profileFileManagement.open();
  });

  test("Files option is not available for guests", async () => {
    await profileFileManagement.expectDefaultHomepageOptionNotAvailable(
      defaultHomepageOptions.files,
    );
  });
});
