import { test } from "@/src/fixtures";
import { AiAgents } from "@/src/objects/ai/AiAgents";
import Files from "@/src/objects/files/Files";
import MyRooms from "@/src/objects/rooms/Rooms";
import { apps, filesSubItems } from "@/src/utils/constants/navigation";

test.describe("AI Chat: AI features not activated", () => {
  let aiAgents: AiAgents;
  let files: Files;
  let myRooms: MyRooms;

  test.beforeEach(async ({ page, api, login }) => {
    aiAgents = new AiAgents(page, api.portalDomain);
    files = new Files(page, api.portalDomain);
    myRooms = new MyRooms(page, api.portalDomain);
    await login.loginToPortal();
  });

  // A fresh portal never had AI features activated, so the AI Chat panel
  // shows the not-active screen instead of the composer.
  test("Owner and user see the not-active screen in AI Chat, guest has no AI Chat", async ({
    page,
    apiSdk,
    login,
  }) => {
    const { userData } = await apiSdk.profiles.addMember("owner", "User");
    const { userData: guestData } = await apiSdk.profiles.addMember(
      "owner",
      "Guest",
    );

    await test.step("Owner opens AI Chat in Files", async () => {
      await files.open();
      await files.openAiChat();
    });

    await test.step("Owner sees the not-active screen with Top up & activate", async () => {
      await aiAgents.expectQuickChatNotActiveScreen("admin");
    });

    await test.step("User opens AI Chat in Files", async () => {
      // Clear cookies to log out from the owner account
      await page.context().clearCookies();
      await login.loginWithCredentials(userData.email, userData.password);
      await files.open();
      await files.openAiChat();
    });

    await test.step("User sees the not-active screen asking to contact a Full admin", async () => {
      await aiAgents.expectQuickChatNotActiveScreen("user");
    });

    await test.step("Guest logs in", async () => {
      await page.context().clearCookies();
      await login.loginWithCredentials(guestData.email, guestData.password);
      await myRooms.openWithoutEmptyCheck();
    });

    // AI agents is left out: its page never has the header AI Chat button.
    // A guest has no My documents, so Files opens on Shared with me.
    const guestSections = [
      { app: apps.rooms },
      { app: apps.files, landsOn: filesSubItems.sharedWithMe },
      { app: apps.forms },
    ];
    for (const { app, landsOn } of guestSections) {
      await test.step(`Guest has no AI Chat button in ${app}`, async () => {
        await myRooms.sidebar.navigate(app);
        // Confirms the section rendered before checking for an absent button.
        if (landsOn) {
          await myRooms.sidebar.checkSubItemActive(app, landsOn);
        } else {
          await myRooms.sidebar.checkItemActive(app);
        }
        await myRooms.checkAiChatButtonNotExist();
      });
    }
  });
});
