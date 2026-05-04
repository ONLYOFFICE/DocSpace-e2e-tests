import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import AiAgents from "@/src/objects/ai/AiAgents";
import AiSettings from "@/src/objects/ai/AiSettings";
import config from "@/config";
import { aiAgentToastMessages } from "@/src/utils/constants/ai";

test.describe("AI Agents", () => {
  let aiAgents: AiAgents;
  let aiSettings: AiSettings;

  test.beforeEach(async ({ page, api, login }) => {
    aiAgents = new AiAgents(page, api.portalDomain);
    aiSettings = new AiSettings(page, api.portalDomain);
    await login.loginToPortal();
  });

  test("Empty providers state", async () => {
    await aiAgents.open();
    await aiAgents.expectNoProvidersMessage();

    await aiAgents.goToSettings();
    await aiSettings.expectLoaded();
  });

  test("Create AI agent with DeepSeek provider", async () => {
    const agentName = "DeepSeek Agent";

    await test.step("Precondition: add DeepSeek provider", async () => {
      await aiSettings.open();
      await aiSettings.clickAddProviderButton();
      await aiSettings.selectProviderType("DeepSeek");
      await aiSettings.fillProviderTitle("DeepSeek");
      await aiSettings.fillProviderKey(config.DEEPSEEK_API_KEY!);
      await aiSettings.selectFirstAvailableModel();
      await aiSettings.saveProvider();
      await aiSettings.expectProviderInList("DeepSeek");
    });

    await test.step("Create AI agent", async () => {
      await aiAgents.openDirectly();
      await aiAgents.openCreateAgentDialog();
      await aiAgents.fillAgentName(agentName);
      await aiAgents.selectProvider("DeepSeek");
      await aiAgents.fillInstructions(
        "You are a helpful assistant for DocSpace e2e tests.",
      );
      await aiAgents.saveAgent();
    });

    await test.step("Verify chat with the agent is opened", async () => {
      await aiAgents.expectChatOpened();
    });

    await test.step("Verify agent appears in the list", async () => {
      await aiAgents.openDirectly();
      await aiAgents.expectAgentInList(agentName);
    });
  });
});

test.describe("AI Agents: management", () => {
  let aiAgents: AiAgents;
  let aiSettings: AiSettings;
  const AGENT_NAME = "DeepSeek Agent";

  test.beforeEach(async ({ page, api, login }) => {
    aiAgents = new AiAgents(page, api.portalDomain);
    aiSettings = new AiSettings(page, api.portalDomain);
    await login.loginToPortal();

    await test.step("Precondition: add DeepSeek provider", async () => {
      await aiSettings.open();
      await aiSettings.clickAddProviderButton();
      await aiSettings.selectProviderType("DeepSeek");
      await aiSettings.fillProviderTitle("DeepSeek");
      await aiSettings.fillProviderKey(config.DEEPSEEK_API_KEY!);
      await aiSettings.selectFirstAvailableModel();
      await aiSettings.saveProvider();
      await aiSettings.expectProviderInList("DeepSeek");
    });

    await test.step("Precondition: create AI agent", async () => {
      await aiAgents.openDirectly();
      await aiAgents.openCreateAgentDialog();
      await aiAgents.fillAgentName(AGENT_NAME);
      await aiAgents.selectProvider("DeepSeek");
      await aiAgents.fillInstructions("Test agent for management scenarios.");
      await aiAgents.saveAgent();
      await aiAgents.openDirectly();
      await aiAgents.expectAgentInList(AGENT_NAME);
    });
  });

  test("Rename agent", async () => {
    const renamed = "Updated Agent Title";
    await aiAgents.renameAgent(AGENT_NAME, renamed);

    await test.step("Verify agent renamed", async () => {
      await aiAgents.openDirectly();
      await aiAgents.expectAgentInList(renamed);
      await aiAgents.expectAgentNotInList(AGENT_NAME);
    });
  });

  test("Invite user to agent", async ({ apiSdk }) => {
    const { userData } = await apiSdk.profiles.addMember("owner", "User");

    await test.step("Open invite dialog", async () => {
      await aiAgents.openInviteDialog(AGENT_NAME);
    });

    await test.step("Search and add user to invite list", async () => {
      await aiAgents.inviteDialog.fillSearchInviteInput(userData.email);
      await aiAgents.inviteDialog.checkUserExist(userData.email);
      await aiAgents.inviteDialog.clickAddUserToInviteList(userData.email);
    });

    await test.step("Send invitation", async () => {
      await aiAgents.inviteDialog.submitInviteDialog();
    });

    await test.step("Verify user appears in agent contacts", async () => {
      await aiAgents.openAgentInfo(AGENT_NAME);
      await aiAgents.expectMemberInAgentContacts(userData.email);
    });
  });

  test("Delete agent", async () => {
    await aiAgents.deleteAgent(AGENT_NAME);
    await aiAgents.expectAgentNotInList(AGENT_NAME);
  });

  test("Open agent and verify chat loads", async () => {
    await aiAgents.openAgent(AGENT_NAME);
    await aiAgents.expectChatOpened();
  });

  test("Download agent", async () => {
    const download = await aiAgents.downloadAgent(AGENT_NAME);
    expect(download.suggestedFilename()).toBeTruthy();
    await download.delete();
  });

  test("Change agent owner", async ({ apiSdk }) => {
    const { userData } = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const userName = `${userData.firstName} ${userData.lastName}`;

    await test.step("Invite Room admin to agent", async () => {
      await aiAgents.inviteUserToAgent(AGENT_NAME, userData.email);
    });

    await test.step("Change owner via context menu", async () => {
      await aiAgents.changeAgentOwner(AGENT_NAME, userName);
    });
  });

  test("Leave the agent", async ({ apiSdk }) => {
    const { userData } = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const userName = `${userData.firstName} ${userData.lastName}`;

    await test.step("Invite Room admin to agent", async () => {
      await aiAgents.inviteUserToAgent(AGENT_NAME, userData.email);
    });

    await test.step("Leave the agent and assign new owner", async () => {
      await aiAgents.leaveAgent(AGENT_NAME, userName);
    });
  });

  test("Pin agent to top", async () => {
    await aiAgents.pinAgent(AGENT_NAME);
    await aiAgents.removeToast(aiAgentToastMessages.pinned);
  });

  test("Toggle agent notifications", async () => {
    await test.step("Disable notifications", async () => {
      await aiAgents.disableAgentNotifications(AGENT_NAME);
      await aiAgents.removeToast(aiAgentToastMessages.notificationsDisabled);
    });

    await test.step("Enable notifications back", async () => {
      await aiAgents.enableAgentNotifications(AGENT_NAME);
      await aiAgents.removeToast(aiAgentToastMessages.notificationsEnabled);
    });
  });

  test("Copy agent link", async () => {
    await aiAgents.copyAgentLink(AGENT_NAME);
    await aiAgents.removeToast(aiAgentToastMessages.linkCopied);
  });
});
