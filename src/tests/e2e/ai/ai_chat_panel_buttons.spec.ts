import { test } from "@/src/fixtures";
import { AiAgents } from "@/src/objects/ai/AiAgents";
import AiSettings from "@/src/objects/ai/AiSettings";
import Files from "@/src/objects/files/Files";
import { PaymentApi } from "@/src/api/payment";

test.describe("AI Chat panel: buttons on Files", () => {
  let aiAgents: AiAgents;
  let aiSettings: AiSettings;
  let files: Files;
  let paymentApi: PaymentApi;

  test.beforeEach(async ({ page, api, login }) => {
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    aiAgents = new AiAgents(page, api.portalDomain);
    aiSettings = new AiSettings(page, api.portalDomain);
    files = new Files(page, api.portalDomain);
    await login.loginToPortal();

    await test.step("Precondition: top up wallet and activate AI features", async () => {
      await paymentApi.setupPayment();
      await paymentApi.makeWalletTopUp();
      await aiSettings.open();
      await aiSettings.activate();
    });

    await files.open();
    await files.openAiChat();
    await aiAgents.expectChatOpened();
  });

  test("Model selector lists raw models and switches the active one", async () => {
    await test.step("Verify the model list includes raw models", async () => {
      await aiAgents.expectModelInQuickChatMenu("GPT 5.6 Luna", true);
    });

    await test.step("Select a different model and verify it's reflected", async () => {
      await aiAgents.selectModelInQuickChat("GPT 5.6 Luna");
      await aiAgents.expectQuickChatModelSelected("GPT 5.6 Luna");
    });
  });

  test("Choose AI Agent appears in the model menu only once an agent exists", async ({
    apiSdk,
  }) => {
    await test.step("No agents - Choose AI Agent is not in the model menu", async () => {
      await aiAgents.expectModelInQuickChatMenu("Choose AI Agent", false);
    });

    await test.step("Create an agent via API", async () => {
      await apiSdk.ai.createAgent("owner", {
        title: "Chat Buttons Agent",
        prompt: "Agent for AI Chat panel button tests.",
      });
    });

    // Reload so the chat picks up the new agent
    await test.step("Reopen the chat on Files", async () => {
      await files.open();
      await files.openAiChat();
      await aiAgents.expectChatOpened();
    });

    await test.step("Choose AI Agent is now in the model menu", async () => {
      await aiAgents.expectModelInQuickChatMenu("Choose AI Agent", true);
    });
  });

  test("Attach menu exposes Web search toggle", async () => {
    await test.step("Web search toggle is present but disabled (add-on not purchased)", async () => {
      await aiAgents.openAttachMenu();
      await aiAgents.expectWebSearchToggleDisabled();
    });
  });

  test("Model selector exposes Effort levels", async () => {
    await test.step("Effort submenu in the model menu can be changed", async () => {
      await aiAgents.openQuickChatModelMenu();
      await aiAgents.expectEffortLevel("No thinking");
      await aiAgents.selectEffortLevel("High");
      await aiAgents.openQuickChatModelMenu();
      await aiAgents.expectEffortLevel("High");
    });
  });

  test("Model selector exposes Permissions modes with Auto approve by default", async () => {
    await test.step("Permissions row shows Auto approve by default", async () => {
      await aiAgents.openQuickChatModelMenu();
      await aiAgents.expectPermissionsMode("Auto approve");
    });

    await test.step("Permissions submenu lists all three modes", async () => {
      await aiAgents.openPermissionsSubmenu();
      await aiAgents.expectPermissionsOptions();
    });
  });

  test("Permissions mode can be switched", async () => {
    for (const mode of ["Ask every time", "Allow without asking"] as const) {
      await test.step(`Select ${mode} and verify it's reflected`, async () => {
        await aiAgents.openQuickChatModelMenu();
        await aiAgents.selectPermissionsMode(mode);
        await aiAgents.openQuickChatModelMenu();
        await aiAgents.expectPermissionsMode(mode);
      });
    }
  });
});
