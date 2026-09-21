import { test } from "@/src/fixtures";
import { BrowserContext } from "@playwright/test";
import AiAgents from "@/src/objects/ai/AiAgents";
import AiSettings from "@/src/objects/ai/AiSettings";
import Login from "@/src/objects/common/Login";
import { PaymentApi } from "@/src/api/payment";

const AGENT_NAME = "Chat Privacy Agent";
const OWNER_MESSAGE = "Owner's private message";
const USER_MESSAGE = "Invited user's private message";

test.describe("AI Agents: chat is private per member", () => {
  let aiAgents: AiAgents;
  let aiSettings: AiSettings;
  let paymentApi: PaymentApi;
  let portalDomain: string;

  test.beforeEach(async ({ page, api, login }) => {
    portalDomain = api.portalDomain;
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    aiAgents = new AiAgents(page, portalDomain);
    aiSettings = new AiSettings(page, portalDomain);
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
      await aiAgents.fillInstructions("Test agent for chat privacy scenarios.");
      await aiAgents.saveAgent();
      await aiAgents.expectChatOpened();
      await aiAgents.openAndExpectAgentInList(AGENT_NAME);
    });
  });

  test("Invited user does not see the owner's chat, and the owner does not see the invited user's chat", async ({
    apiSdk,
    browser,
  }) => {
    await test.step("Owner sends a message in their own chat", async () => {
      await aiAgents.openAgent(AGENT_NAME);
      await aiAgents.sendChatMessage(OWNER_MESSAGE);
      await aiAgents.expectMessageInChat(OWNER_MESSAGE);
    });

    const { userData } = await apiSdk.profiles.addMember("owner", "User");

    // The owner (fixture page) and the invited user need to stay logged in
    // at the same time, so the user gets its own browser context instead of
    // repeatedly logging in/out on the shared page.
    const userContext: BrowserContext = await browser.newContext();
    try {
      const userPage = await userContext.newPage();
      const userLogin = new Login(userPage, portalDomain);
      const userAiAgents = new AiAgents(userPage, portalDomain);

      await test.step("Owner invites the user to the agent", async () => {
        // Sending the message above left the page on the chat view; the
        // invite flow needs the agents list view for its context menu.
        await aiAgents.openAndExpectAgentInList(AGENT_NAME);
        // Default invite access is Viewer (no chat composer) - grant Content
        // creator so the invited user can send messages in the agent chat.
        await aiAgents.inviteUserToAgent(
          AGENT_NAME,
          userData.email,
          "Content creator",
        );
      });

      await test.step("Invited user opens the agent and does not see the owner's message", async () => {
        await userLogin.loginWithCredentials(userData.email, userData.password);
        await userAiAgents.openDirectly();
        await userAiAgents.openAgent(AGENT_NAME);
        await userAiAgents.expectChatOpened();
        await userAiAgents.expectMessageNotInChat(OWNER_MESSAGE);
      });

      await test.step("Invited user sends their own message", async () => {
        await userAiAgents.sendChatMessage(USER_MESSAGE);
        await userAiAgents.expectMessageInChat(USER_MESSAGE);
      });

      await test.step("Owner still sees only their own message, not the invited user's", async () => {
        await aiAgents.openAndExpectAgentInList(AGENT_NAME);
        await aiAgents.openAgent(AGENT_NAME);
        await aiAgents.expectChatOpened();
        await aiAgents.expectMessageInChat(OWNER_MESSAGE);
        await aiAgents.expectMessageNotInChat(USER_MESSAGE);
      });
    } finally {
      await userContext.close();
    }
  });
});
