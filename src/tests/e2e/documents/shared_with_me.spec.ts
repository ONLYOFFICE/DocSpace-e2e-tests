import SharedWithMe from "@/src/objects/files/SharedWithMe";
import { test } from "@/src/fixtures";

test.describe("Shared with me", () => {
  let sharedWithMe: SharedWithMe;

  test.beforeEach(async ({ page, api, login }) => {
    sharedWithMe = new SharedWithMe(page, api.portalDomain);

    await login.loginToPortal();
  });

  test("Empty view is shown when nothing is shared", async () => {
    await test.step("Open Shared with me", async () => {
      await sharedWithMe.open();
    });

    await test.step("Check empty view", async () => {
      await sharedWithMe.checkEmptyViewVisible();
    });
  });
});
