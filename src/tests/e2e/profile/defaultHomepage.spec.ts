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

  test("AI agents - logo navigates to AI agents URL", async () => {
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

  test("My Documents - logo navigates to My Documents URL", async () => {
    await test.step("Select My Documents as default homepage", async () => {
      await profileFileManagement.selectDefaultHomepage(
        defaultHomepageOptions.myDocuments,
      );
      await profileFileManagement.expectDefaultHomepageOption(
        defaultHomepageOptions.myDocuments,
      );
    });

    await test.step("Click logo and verify landing URL", async () => {
      await profileFileManagement.clickLogoAndExpectUrl(
        defaultHomepageUrls.myDocuments,
      );
    });
  });

  test("Recent - logo navigates to Recent URL", async () => {
    await test.step("Select Recent as default homepage", async () => {
      await profileFileManagement.selectDefaultHomepage(
        defaultHomepageOptions.recent,
      );
      await profileFileManagement.expectDefaultHomepageOption(
        defaultHomepageOptions.recent,
      );
    });

    await test.step("Click logo and verify landing URL", async () => {
      await profileFileManagement.clickLogoAndExpectUrl(
        defaultHomepageUrls.recent,
      );
    });
  });

  test("Favorites - logo navigates to Favorites URL", async () => {
    await test.step("Select Favorites as default homepage", async () => {
      await profileFileManagement.selectDefaultHomepage(
        defaultHomepageOptions.favorites,
      );
      await profileFileManagement.expectDefaultHomepageOption(
        defaultHomepageOptions.favorites,
      );
    });

    await test.step("Click logo and verify landing URL", async () => {
      await profileFileManagement.clickLogoAndExpectUrl(
        defaultHomepageUrls.favorites,
      );
    });
  });

  test("Default Homepage setting is personal and does not affect other users", async ({
    apiSdk,
  }) => {
    await test.step("Set My Documents as owner's default homepage", async () => {
      await profileFileManagement.selectDefaultHomepage(
        defaultHomepageOptions.myDocuments,
      );
      await profileFileManagement.expectDefaultHomepageOption(
        defaultHomepageOptions.myDocuments,
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

  test("My Documents option is not available for guests", async () => {
    await profileFileManagement.expectDefaultHomepageOptionNotAvailable(
      defaultHomepageOptions.myDocuments,
    );
  });
});
