import { test } from "@/src/fixtures";
import { BrowserContext } from "@playwright/test";
import AiAgents from "@/src/objects/ai/AiAgents";
import AiSettings from "@/src/objects/ai/AiSettings";
import RoomInfoPanel from "@/src/objects/rooms/RoomInfoPanel";
import Login from "@/src/objects/common/Login";
import { PaymentApi } from "@/src/api/payment";

const PROJECT_NAME = "Rejoin History Project";
const USER_MESSAGE = "Message from the member before removal";

test.describe("AI Projects: member rejoin keeps chat history", () => {
  let aiAgents: AiAgents;
  let aiSettings: AiSettings;
  let paymentApi: PaymentApi;
  let portalDomain: string;
  // AI projects are AI rooms - their info panel reuses the shared
  // InfoPanel/Contacts tab component of Rooms.
  let roomInfoPanel: RoomInfoPanel;

  test.beforeEach(async ({ page, api, login }) => {
    portalDomain = api.portalDomain;
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    aiAgents = new AiAgents(page, portalDomain);
    aiSettings = new AiSettings(page, portalDomain);
    roomInfoPanel = new RoomInfoPanel(page);
    await login.loginToPortal();

    await test.step("Precondition: top up wallet and activate AI features", async () => {
      await paymentApi.setupPayment();
      await paymentApi.makeWalletTopUp();
      await aiSettings.open();
      await aiSettings.activate();
    });

    await test.step("Precondition: create AI project", async () => {
      await aiAgents.openDirectly();
      await aiAgents.openCreateAgentDialog();
      await aiAgents.fillAgentName(PROJECT_NAME);
      await aiAgents.saveAgent();
      await aiAgents.expectChatOpened();
      await aiAgents.openAndExpectAgentInList(PROJECT_NAME);
    });
  });

  test("Member keeps own chat history after being removed and re-invited to the project", async ({
    apiSdk,
    browser,
  }) => {
    const { userData } = await apiSdk.profiles.addMember("owner", "User");
    const userName = `${userData.firstName} ${userData.lastName}`;

    // The owner (fixture page) and the invited user need to stay logged in
    // at the same time, so the user gets its own browser context instead of
    // repeatedly logging in/out on the shared page.
    const userContext: BrowserContext = await browser.newContext();
    try {
      const userPage = await userContext.newPage();
      const userLogin = new Login(userPage, portalDomain);
      const userAiAgents = new AiAgents(userPage, portalDomain);

      await test.step("Owner invites the user to the project as Member", async () => {
        await aiAgents.inviteUserToAgent(
          PROJECT_NAME,
          userData.email,
          "Member",
        );
      });

      await test.step("Member sends a message in the project chat", async () => {
        await userLogin.loginWithCredentials(userData.email, userData.password);
        await userAiAgents.openDirectly();
        await userAiAgents.openAgent(PROJECT_NAME);
        await userAiAgents.expectChatOpened();
        await userAiAgents.sendChatMessage(USER_MESSAGE);
        await userAiAgents.expectMessageInChat(USER_MESSAGE);
      });

      await test.step("Owner removes the member from the project", async () => {
        await aiAgents.openAndExpectAgentInList(PROJECT_NAME);
        await aiAgents.openAgentInfo(PROJECT_NAME);
        await roomInfoPanel.openTab("Contacts");
        await roomInfoPanel.removeMemberByName(userName);
      });

      await test.step("Owner re-invites the user to the project as Member", async () => {
        await aiAgents.inviteUserToAgent(
          PROJECT_NAME,
          userData.email,
          "Member",
        );
      });

      await test.step("Member still sees their previous message in the chat", async () => {
        await userAiAgents.openDirectly();
        await userAiAgents.openAgent(PROJECT_NAME);
        await userAiAgents.expectChatOpened();
        await userAiAgents.expectMessageInChat(USER_MESSAGE);
      });
    } finally {
      await userContext.close();
    }
  });
});
