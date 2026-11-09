import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import AiAgents from "@/src/objects/ai/AiAgents";
import AiSettings from "@/src/objects/ai/AiSettings";
import Rooms from "@/src/objects/rooms/Rooms";
import { PaymentApi } from "@/src/api/payment";
import { aiAgentToastMessages } from "@/src/utils/constants/ai";

test.describe("AI Projects", () => {
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

  // Like Files/Rooms/Forms, the AI rooms section has a header "AI Chat" button.
  test("Header AI Chat button is shown", async () => {
    await aiAgents.open();
    await aiAgents.checkAiChatButtonVisible();
  });

  test("Create AI project", async ({ page, api }) => {
    const projectName = "Test AI Project";
    const rooms = new Rooms(page, api.portalDomain);

    await test.step("Precondition: top up wallet and activate AI features", async () => {
      await paymentApi.setupPayment();
      await paymentApi.makeWalletTopUp();
      await aiSettings.open();
      await aiSettings.activate();
    });

    await test.step("Create AI project", async () => {
      await aiAgents.openDirectly();
      await aiAgents.openCreateAgentDialog();
      await aiAgents.fillAgentName(projectName);
      await aiAgents.saveAgent();
    });

    await test.step("Verify chat with the project is opened", async () => {
      await aiAgents.expectChatOpened();
    });

    await test.step("Verify project appears in the list", async () => {
      await aiAgents.openAndExpectAgentInList(projectName);
    });

    // AI rooms live only in their own section: Rooms of a fresh portal stay empty.
    await test.step("Verify project is not shown in Rooms", async () => {
      await rooms.openRooms();
      await rooms.roomsEmptyView.checkNoRoomsExist();
    });
  });
});

test.describe("AI Projects: management", () => {
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

    await test.step("Precondition: create AI project", async () => {
      await aiAgents.openDirectly();
      await aiAgents.openCreateAgentDialog();
      await aiAgents.fillAgentName(PROJECT_NAME);
      await aiAgents.saveAgent();
      await aiAgents.openAndExpectAgentInList(PROJECT_NAME);
    });
  });

  test("Rename project", async () => {
    const renamed = "Updated Project Title";
    await aiAgents.renameAgent(PROJECT_NAME, renamed);

    await test.step("Verify project renamed", async () => {
      await aiAgents.openDirectly();
      await aiAgents.expectAgentInList(renamed);
      await aiAgents.expectAgentNotInList(PROJECT_NAME);
    });
  });

  test("Invite user to project", async ({ apiSdk }) => {
    const { userData } = await apiSdk.profiles.addMember("owner", "User");

    await test.step("Open invite dialog", async () => {
      await aiAgents.openInviteDialog(PROJECT_NAME);
    });

    await test.step("Search and add user to invite list", async () => {
      await aiAgents.inviteDialog.fillSearchInviteInput(userData.email);
      await aiAgents.inviteDialog.checkUserExist(userData.email);
      await aiAgents.inviteDialog.clickAddUserToInviteList(userData.email);
    });

    await test.step("Send invitation", async () => {
      await aiAgents.inviteDialog.submitInviteDialog();
    });

    await test.step("Verify user appears in project members", async () => {
      await aiAgents.openAgentInfo(PROJECT_NAME);
      await aiAgents.expectMemberInAgentContacts(userData.email);
    });
  });

  test("Delete project", async () => {
    await test.step("Delete project", async () => {
      await aiAgents.deleteAgent(PROJECT_NAME);
      await aiAgents.expectAgentNotInList(PROJECT_NAME);
      // The project was the only AI room, so the section shows its empty view.
      await aiAgents.expectRoomsEmptyView();
    });

    await test.step("Verify project is deleted permanently, not moved to Trash", async () => {
      await aiAgents.openTrashFromNavigation();
      await aiAgents.expectTrashEmpty();
      await aiAgents.expectAgentNotInList(PROJECT_NAME);
    });
  });

  test("Open project and verify chat loads", async () => {
    await aiAgents.openAgent(PROJECT_NAME);
    await aiAgents.expectChatOpened();
  });

  test("Download project", async () => {
    const download = await aiAgents.downloadAgent(PROJECT_NAME);
    expect(download.suggestedFilename()).toBeTruthy();
    await download.delete();
  });

  test("Change project owner", async ({ apiSdk }) => {
    const { userData } = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const userName = `${userData.firstName} ${userData.lastName}`;

    await test.step("Invite Room admin to project", async () => {
      await aiAgents.inviteUserToAgent(PROJECT_NAME, userData.email);
    });

    await test.step("Change owner via context menu", async () => {
      await aiAgents.changeAgentOwner(PROJECT_NAME, userName);
    });
  });

  test("Leave the project", async ({ apiSdk }) => {
    const { userData } = await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const userName = `${userData.firstName} ${userData.lastName}`;

    await test.step("Invite Room admin to project", async () => {
      await aiAgents.inviteUserToAgent(PROJECT_NAME, userData.email);
    });

    await test.step("Leave the project and assign new owner", async () => {
      await aiAgents.leaveAgent(PROJECT_NAME, userName);
    });
  });

  test("Pin project to top", async () => {
    await aiAgents.pinAgent(PROJECT_NAME);
    await aiAgents.removeToast(aiAgentToastMessages.pinned);
  });

  test("Toggle project notifications", async () => {
    await test.step("Disable notifications", async () => {
      await aiAgents.disableAgentNotifications(PROJECT_NAME);
      await aiAgents.removeToast(aiAgentToastMessages.notificationsDisabled);
    });

    await test.step("Enable notifications back", async () => {
      await aiAgents.enableAgentNotifications(PROJECT_NAME);
      await aiAgents.removeToast(aiAgentToastMessages.notificationsEnabled);
    });
  });

  test("Copy project link", async () => {
    await aiAgents.copyAgentLink(PROJECT_NAME);
    await aiAgents.removeToast(aiAgentToastMessages.linkCopied);
  });
});
