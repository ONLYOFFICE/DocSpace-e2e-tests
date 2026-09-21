import { test } from "@/src/fixtures";
import AiAgents from "@/src/objects/ai/AiAgents";
import AiSettings from "@/src/objects/ai/AiSettings";
import { PaymentApi } from "@/src/api/payment";

const AGENT_NAME = "Viewer Access Agent";

test.describe("AI Agents: Viewer access", () => {
  let aiAgents: AiAgents;
  let aiSettings: AiSettings;
  let paymentApi: PaymentApi;

  test.beforeEach(async ({ page, api, login }) => {
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    aiAgents = new AiAgents(page, api.portalDomain);
    aiSettings = new AiSettings(page, api.portalDomain);
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
        "Test agent for viewer access scenarios.",
      );
      await aiAgents.saveAgent();
      await aiAgents.expectChatOpened();
      await aiAgents.openAndExpectAgentInList(AGENT_NAME);
    });
  });

  // Default invite access to an agent is Viewer - the invited member gets no
  // chat composer, only a feed of other members' chat activity.
  test("Viewer sees the activity placeholder instead of the chat composer", async ({
    page,
    apiSdk,
    login,
  }) => {
    const { userData } = await apiSdk.profiles.addMember("owner", "User");

    await test.step("Owner invites the user to the agent with default (Viewer) access", async () => {
      await aiAgents.inviteUserToAgent(AGENT_NAME, userData.email);
    });

    await test.step("Viewer opens the agent and sees the activity placeholder", async () => {
      // Clear cookies to log out from the owner account
      await page.context().clearCookies();
      await login.loginWithCredentials(userData.email, userData.password);
      await aiAgents.openDirectly();
      await aiAgents.openAgent(AGENT_NAME);
      await aiAgents.expectViewerModeToast();
      await aiAgents.expectViewerChatEmptyState();
    });
  });
});
