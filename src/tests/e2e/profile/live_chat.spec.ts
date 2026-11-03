import { test } from "@/src/fixtures";
import Files from "@/src/objects/files/Files";
import {
  liveChatWindowTitle,
  toastMessages,
} from "@/src/utils/constants/profile";

test.describe("User menu - Live chat", () => {
  let files: Files;

  test.beforeEach(async ({ page, api, login }) => {
    files = new Files(page, api.portalDomain);
    await login.loginToPortal();
    await files.open();
  });

  test("Live chat toggle can be enabled and disabled", async () => {
    await test.step("Live chat is disabled by default", async () => {
      await files.expectLiveChatEnabled(false);
      await files.expectLiveChatWidgetVisible(false);
    });

    await test.step("Enable Live chat", async () => {
      await files.setLiveChatEnabled(true);
      await files.dismissToastSafely(toastMessages.liveChatConnected);
      await files.expectLiveChatWidgetVisible(true);
    });

    await test.step("Open Live chat messaging window", async () => {
      await files.openLiveChatWindow();
      await files.expectLiveChatWindowOpened(liveChatWindowTitle);
    });

    await test.step("Disable Live chat", async () => {
      await files.setLiveChatEnabled(false);
      await files.dismissToastSafely(toastMessages.liveChatDisconnected);
      await files.expectLiveChatWidgetVisible(false);
    });

    await test.step("Close user menu", async () => {
      await files.closeUserMenu();
    });
  });
});
