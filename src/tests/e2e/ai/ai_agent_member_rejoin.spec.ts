import { test } from "@/src/fixtures";
import { BrowserContext } from "@playwright/test";
import AiAgents from "@/src/objects/ai/AiAgents";
import AiSettings from "@/src/objects/ai/AiSettings";
import RoomInfoPanel from "@/src/objects/rooms/RoomInfoPanel";
import Login from "@/src/objects/common/Login";
import { PaymentApi } from "@/src/api/payment";

const AGENT_NAME = "Rejoin History Agent";
const USER_MESSAGE = "Message from the invited user before removal";

test.describe("AI Agents: member rejoin keeps chat history", () => {
  let aiAgents: AiAgents;
  let aiSettings: AiSettings;
  let paymentApi: PaymentApi;
  let portalDomain: string;
  // AI agents are backed by the same room infrastructure as Rooms - the
  // agent's info panel reuses the shared InfoPanel/Contacts tab component.
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

    await test.step("Precondition: create AI agent", async () => {
      await aiAgents.openDirectly();
      await aiAgents.openCreateAgentDialog();
      await aiAgents.fillAgentName(AGENT_NAME);
      await aiAgents.fillInstructions(
        "Test agent for member rejoin scenarios.",
      );
      await aiAgents.saveAgent();
      await aiAgents.expectChatOpened();
      await aiAgents.openAndExpectAgentInList(AGENT_NAME);
    });
  });

  test("User keeps own chat history after being removed and re-invited to the agent", async ({
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

      await test.step("Owner invites the user to the agent", async () => {
        // Default invite access is Viewer (no chat composer) - grant Content
        // creator via the invite dialog's role selector so the user can
        // actually send messages in the agent chat. (Escalating access
        // afterwards through the rooms/share API doesn't stick for AI agent
        // rooms - it returns 200 but the role silently stays Viewer.)
        await aiAgents.inviteUserToAgent(
          AGENT_NAME,
          userData.email,
          "Content creator",
        );
      });

      await test.step("User sends a message in the agent chat", async () => {
        await userLogin.loginWithCredentials(userData.email, userData.password);
        await userAiAgents.openDirectly();
        await userAiAgents.openAgent(AGENT_NAME);
        await userAiAgents.expectChatOpened();
        await userAiAgents.sendChatMessage(USER_MESSAGE);
        await userAiAgents.expectMessageInChat(USER_MESSAGE);
      });

      await test.step("Owner removes the user from the agent", async () => {
        await aiAgents.openAndExpectAgentInList(AGENT_NAME);
        await aiAgents.openAgentInfo(AGENT_NAME);
        await roomInfoPanel.openTab("Contacts");
        await roomInfoPanel.removeMemberByName(userName);
      });

      await test.step("Owner re-invites the user to the agent", async () => {
        await aiAgents.inviteUserToAgent(
          AGENT_NAME,
          userData.email,
          "Content creator",
        );
      });

      await test.step("User still sees their previous message in the chat", async () => {
        await userAiAgents.openDirectly();
        await userAiAgents.openAgent(AGENT_NAME);
        await userAiAgents.expectChatOpened();
        await userAiAgents.expectMessageInChat(USER_MESSAGE);
      });
    } finally {
      await userContext.close();
    }
  });
});
