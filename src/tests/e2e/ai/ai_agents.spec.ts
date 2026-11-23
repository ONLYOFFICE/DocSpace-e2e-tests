import { test } from "@/src/fixtures";
import AiAgents from "@/src/objects/ai/AiAgents";
import AiSettings from "@/src/objects/ai/AiSettings";
import Rooms from "@/src/objects/rooms/Rooms";
import { PaymentApi } from "@/src/api/payment";
import { aiAgentToastMessages } from "@/src/utils/constants/ai";

test.describe("AI Agents", () => {
  let aiAgents: AiAgents;
  let aiSettings: AiSettings;
  let paymentApi: PaymentApi;

  test.beforeEach(async ({ page, api, login }) => {
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    aiAgents = new AiAgents(page, api.portalDomain);
    aiSettings = new AiSettings(page, api.portalDomain);
    await login.loginToPortal();
  });

  test("AI features not active state", async () => {
    await aiAgents.open();
    await aiAgents.expectAiNotActive();
  });

  // Like Files/Rooms/Forms, the Agents list has a header "AI Chat" button.
  test("Header AI Chat button is shown", async () => {
    await aiAgents.open();
    await aiAgents.checkAiChatButtonVisible();
  });

  test("Create AI agent", async ({ page, api }) => {
    const projectName = "Test AI Project";
    const rooms = new Rooms(page, api.portalDomain);

    await test.step("Precondition: top up wallet and activate AI features", async () => {
      await paymentApi.setupPayment();
      await paymentApi.makeWalletTopUp();
      await aiSettings.open();
      await aiSettings.activate();
    });

    await test.step("Create AI agent", async () => {
      await aiAgents.openDirectly();
      await aiAgents.openCreateAgentDialog();
      await aiAgents.fillAgentName(projectName);
      await aiAgents.saveAgent();
    });

    await test.step("Verify chat with the agent is opened", async () => {
      await aiAgents.expectChatOpened();
    });

    await test.step("Verify agent appears in the list", async () => {
      await aiAgents.openAndExpectAgentInList(projectName);
    });

    // AI rooms live only in their own section: Rooms of a fresh portal stay empty.
    await test.step("Verify agent is not shown in Rooms", async () => {
      await rooms.openRooms();
      await rooms.roomsEmptyView.checkNoRoomsExist();
    });
  });
});

test.describe("AI Agents: management", () => {
  let aiAgents: AiAgents;
  let aiSettings: AiSettings;
  let paymentApi: PaymentApi;
  const PROJECT_NAME = "Test AI Project";

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
      await aiAgents.fillAgentName(PROJECT_NAME);
      await aiAgents.saveAgent();
      await aiAgents.openAndExpectAgentInList(PROJECT_NAME);
    });
  });

  test("Rename agent", async () => {
    const renamed = "Updated Project Title";
    await aiAgents.renameAgent(PROJECT_NAME, renamed);

    await test.step("Verify agent renamed", async () => {
      await aiAgents.openDirectly();
      await aiAgents.expectAgentInList(renamed);
      await aiAgents.expectAgentNotInList(PROJECT_NAME);
    });
  });

  test("Invite user to agent", async ({ apiSdk }) => {
    const { userData } = await apiSdk.profiles.addMember("owner", "User");

    await test.step("Open invite dialog", async () => {
      await aiAgents.openInviteDialog(PROJECT_NAME);
    });

    await test.step("Select Member access", async () => {
      // The dialog defaults to "Agent manager", which a User-type account
      // cannot get: the role stays empty and "Send invitation" is disabled.
      // The access must be set before the user is added.
      await aiAgents.inviteDialog.openAccessOptions();
      await aiAgents.inviteDialog.selectAccessOption("Member");
    });

    await test.step("Search and add user to invite list", async () => {
      await aiAgents.inviteDialog.fillSearchInviteInput(userData.email);
      await aiAgents.inviteDialog.checkUserExist(userData.email);
      await aiAgents.inviteDialog.clickAddUserToInviteList(userData.email);
    });

    await test.step("Send invitation", async () => {
      await aiAgents.inviteDialog.submitInviteDialog();
    });

    await test.step("Verify user appears in agent members", async () => {
      await aiAgents.openAgentInfo(PROJECT_NAME);
      await aiAgents.expectMemberInAgentContacts(userData.email);
    });
  });

  // Agents have no Trash: deletion is permanent.
  test("Delete agent", async () => {
    await aiAgents.deleteAgent(PROJECT_NAME);
    await aiAgents.expectAgentNotInList(PROJECT_NAME);
    // The agent was the only agent, so the list shows its empty view.
    await aiAgents.expectAgentsEmptyView();
  });

  test("Open agent and verify chat loads", async () => {
    await aiAgents.openAgent(PROJECT_NAME);
    await aiAgents.expectChatOpened();
  });

  test("Change agent owner", async ({ apiSdk }) => {
    const { userData } = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const userName = `${userData.firstName} ${userData.lastName}`;

    await test.step("Invite Room admin to agent", async () => {
      await aiAgents.inviteUserToAgent(PROJECT_NAME, userData.email);
    });

    await test.step("Change owner via context menu", async () => {
      await aiAgents.changeAgentOwner(PROJECT_NAME, userName);
    });
  });

  // The owner cannot leave an agent directly: only by handing it over with
  // "Leave agent" ticked in the Change owner panel.
  // Bug (number pending): after Change owner with "Leave agent" ticked the
  // Agents list keeps the former owner's menu (Edit agent, Share agent,
  // Disable notifications) until the page is reloaded; the server already
  // returns inRoom=false, EditRoom=false. The client does not refetch the
  // agent's rights after leaving.
  test.skip("[Bug] Leave the agent", async ({ apiSdk }) => {
    const { userData } = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const userName = `${userData.firstName} ${userData.lastName}`;

    await test.step("Invite Room admin to agent", async () => {
      await aiAgents.inviteUserToAgent(PROJECT_NAME, userData.email);
    });

    await test.step("Change owner with Leave agent ticked", async () => {
      await aiAgents.changeAgentOwner(PROJECT_NAME, userName, { leave: true });
    });

    await test.step("Former owner is no longer a member of the agent", async () => {
      await aiAgents.open();
      await aiAgents.expectAgentMenuForNonMemberAdmin(PROJECT_NAME);
    });
  });

  test("Pin agent to top", async () => {
    await aiAgents.pinAgent(PROJECT_NAME);
    await aiAgents.removeToast(aiAgentToastMessages.pinned);
  });

  test("Toggle agent notifications", async () => {
    await test.step("Disable notifications", async () => {
      await aiAgents.disableAgentNotifications(PROJECT_NAME);
      await aiAgents.removeToast(aiAgentToastMessages.notificationsDisabled);
    });

    await test.step("Enable notifications back", async () => {
      await aiAgents.enableAgentNotifications(PROJECT_NAME);
      await aiAgents.removeToast(aiAgentToastMessages.notificationsEnabled);
    });
  });

  test("Copy agent link", async () => {
    await aiAgents.copyAgentLink(PROJECT_NAME);
    await aiAgents.removeToast(aiAgentToastMessages.linkCopied);
  });
});
