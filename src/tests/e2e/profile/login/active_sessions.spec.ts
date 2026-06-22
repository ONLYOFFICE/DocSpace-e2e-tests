import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import { Profile } from "@/src/objects/profile/Profile";
import ActiveSessions from "@/src/objects/profile/ActiveSessions";

test.describe("Profile: Active sessions", () => {
  let profile: Profile;
  let sessions: ActiveSessions;

  test.beforeEach(async ({ page, login }) => {
    profile = new Profile(page);
    sessions = new ActiveSessions(page);

    await login.loginToPortal();
    await profile.open();
    await sessions.openLoginTab();
  });

  test("Current session is displayed", async () => {
    const count = await sessions.getSessionCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("Logout a specific session", async ({ api, page }) => {
    const countBefore = await sessions.getSessionCount();

    await test.step("Create additional session and reload", async () => {
      await api.auth.authenticateOwner();
      await page.reload();
      await sessions.openLoginTab();
      await expect(sessions.sessionRows).toHaveCount(countBefore + 1);
    });

    await test.step("Logout the non-current session", async () => {
      await sessions.logoutSession(1);
      await expect(sessions.sessionRows).toHaveCount(countBefore, {
        timeout: 10000,
      });
    });
  });

  test("Terminate all sessions except current", async ({ api, page }) => {
    await test.step("Create additional session and reload", async () => {
      await api.auth.authenticateOwner();
      await page.reload();
      await sessions.openLoginTab();
      const count = await sessions.getSessionCount();
      expect(count).toBeGreaterThanOrEqual(2);
    });

    await test.step("Terminate all except current", async () => {
      await sessions.terminateAllExceptCurrent();
      await expect(sessions.sessionRows).toHaveCount(1, { timeout: 10000 });
    });
  });

  test("Logout from all sessions with change password and redirect to login page", async ({
    api,
    page,
  }) => {
    await test.step("Create additional session and reload", async () => {
      await api.auth.authenticateOwner();
      await page.reload();
      await sessions.openLoginTab();
      const count = await sessions.getSessionCount();
      expect(count).toBeGreaterThanOrEqual(2);
    });

    await test.step("Terminate all sessions and verify redirect", async () => {
      await sessions.terminateAllSessions();
      await expect(page).toHaveURL(/.*login.*/, { timeout: 15000 });
    });
  });
});
