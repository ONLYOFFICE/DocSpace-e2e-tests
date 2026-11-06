import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import { AiAgents } from "@/src/objects/ai/AiAgents";
import AiSettings, { TAiLimitForm } from "@/src/objects/ai/AiSettings";
import Contacts from "@/src/objects/contacts/Contacts";
import Files from "@/src/objects/files/Files";
import { PaymentApi } from "@/src/api/payment";
import { AiLimit, AiLimitsApi } from "@/src/api/aiLimits";
import { aiLimitPeriods, TAiLimitPeriod } from "@/src/utils/constants/ai";

// The first test sets the limit the way an admin does - in the AI limits tab.
// The UI minimum is US$1, which does not block a chat message, so the amount
// is then lowered to a sub-dollar value via API (PUT by id accepts it). The
// other tests set the limits they need straight via API and check only the UI
// they are about. The server checks the estimated request cost against the
// remaining limit, so a US$0.01 limit blocks the very first message. The
// wallet is topped up, so the block is caused by the limit, not by a lack of
// credits.
const UI_MIN_LIMIT = 1;
const BLOCKING_LIMIT = 0.01;
const RAISED_LIMIT = 10;
const COMMON_LIMIT = 10;
const CHANGED_COMMON_LIMIT = 20;
const INDIVIDUAL_LIMIT = 5;
const PERIOD_TEST_LIMIT = 5;
const INVALID_AMOUNT = 0;
const DISCARDED_AMOUNT = 7;
const MESSAGE = "Write a short greeting for a new colleague";
const PERIODS_TO_SWITCH: TAiLimitPeriod[] = [
  "week",
  "month",
  "lifetime",
  "day",
];

test.describe("AI limits", () => {
  // Each scenario switches users several times and waits for real AI replies,
  // or walks through every period with reloads - far beyond the default 240s.
  test.slow();

  let aiAgents: AiAgents;
  let aiSettings: AiSettings;
  let contacts: Contacts;
  let files: Files;
  let paymentApi: PaymentApi;
  let aiLimitsApi: AiLimitsApi;

  test.beforeEach(async ({ page, api, login }) => {
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    aiLimitsApi = new AiLimitsApi(api.apiRequestContext, api.apisystem);
    aiAgents = new AiAgents(page, api.portalDomain);
    aiSettings = new AiSettings(page, api.portalDomain);
    contacts = new Contacts(page, api.portalDomain);
    files = new Files(page, api.portalDomain);
    await login.loginToPortal();

    await test.step("Precondition: top up wallet and activate AI features", async () => {
      await paymentApi.setupPayment();
      await paymentApi.makeWalletTopUp();
      await aiSettings.open();
      await aiSettings.activate();
    });
  });

  const openQuickChat = async () => {
    await files.open();
    await files.openAiChat();
    await aiAgents.expectChatOpened();
  };

  const expectChatBlocked = async (viewer: "admin" | "user") => {
    await openQuickChat();
    await aiAgents.sendChatMessage(MESSAGE);
    await aiAgents.expectAiLimitReachedBanner(viewer);
  };

  // Opening the quick chat from Files always starts an empty chat (New chat
  // is disabled there), so a previously blocked chat is not restored.
  const expectChatWorks = async () => {
    await openQuickChat();
    await aiAgents.sendChatMessage(MESSAGE);
    await aiAgents.waitForAssistantReply();
    await aiAgents.expectNoChatError();
  };

  const getScopeLimit = (form: TAiLimitForm): Promise<AiLimit | null> =>
    form === "portal"
      ? aiLimitsApi.getPortalLimit()
      : aiLimitsApi.getUserLimit();

  const expectApiScopeLimit = async (
    form: TAiLimitForm,
    expected: Partial<AiLimit>,
  ) => {
    await expect.poll(() => getScopeLimit(form)).toMatchObject(expected);
  };

  const expectApiUserLimit = async (
    userId: string,
    expected: Partial<AiLimit>,
  ) => {
    await expect
      .poll(() => aiLimitsApi.getEffectiveUserLimit(userId))
      .toMatchObject(expected);
  };

  // Turns the limit on in the AI limits tab, checks the min-amount validation
  // and the Cancel of an unsaved change, saves the amount.
  const setLimitInUi = async (form: TAiLimitForm, amount: number) => {
    await aiSettings.openLimitsTab();
    await aiSettings.expectLimitEnabled(form, false);
    await aiSettings.setLimitEnabled(form, true);

    await aiSettings.fillLimitAmount(form, INVALID_AMOUNT);
    await aiSettings.expectLimitAmountInvalid(form);

    await aiSettings.fillLimitAmount(form, amount);
    await aiSettings.expectLimitAmountValid(form);
    await aiSettings.expectUnsavedChanges(form, true);
    await aiSettings.saveLimit(form);
    await aiSettings.expectUnsavedChanges(form, false);

    await aiSettings.fillLimitAmount(form, DISCARDED_AMOUNT);
    await aiSettings.expectUnsavedChanges(form, true);
    await aiSettings.cancelLimitChanges(form);
    await aiSettings.expectLimitAmount(form, amount);

    await expectApiScopeLimit(form, {
      scope: form === "portal" ? "Total" : "Global",
      amountValue: amount,
      period: "Day",
      enabled: true,
    });
  };

  test("Portal limit set in AI settings blocks every user until it is raised", async ({
    page,
    apiSdk,
    login,
  }) => {
    const { userData } = await apiSdk.profiles.addMemberWithId("owner", "User");

    await test.step("Owner sets the portal limit in AI limits tab", async () => {
      await setLimitInUi("portal", UI_MIN_LIMIT);
      await aiSettings.expectPortalLimitStatus(UI_MIN_LIMIT);
    });

    await test.step("Lower the portal limit below the UI minimum via API", async () => {
      await aiLimitsApi.setPortalLimit(BLOCKING_LIMIT);
    });

    await test.step("Regular user is blocked and has no Change AI limit button", async () => {
      await page.context().clearCookies();
      await login.loginWithCredentials(userData.email, userData.password);
      await expectChatBlocked("user");
    });

    await test.step("Owner is blocked by the same portal limit", async () => {
      await page.context().clearCookies();
      await login.loginToPortal();
      await expectChatBlocked("admin");
    });

    await test.step("Change AI limit opens the AI limits tab", async () => {
      await aiAgents.clickChangeAiLimit();
      await aiSettings.expectLimitsTabOpened();
      await aiSettings.expectLimitEnabled("portal", true);
    });

    await test.step("Owner raises the portal limit", async () => {
      await aiSettings.fillLimitAmount("portal", RAISED_LIMIT);
      await aiSettings.saveLimit("portal");
      await aiSettings.expectPortalLimitStatus(RAISED_LIMIT);
      await expectApiScopeLimit("portal", { amountValue: RAISED_LIMIT });
    });

    await test.step("Owner's chat answers again", async () => {
      await expectChatWorks();
    });

    await test.step("Regular user's chat answers again", async () => {
      await page.context().clearCookies();
      await login.loginWithCredentials(userData.email, userData.password);
      await expectChatWorks();
    });

    await test.step("Owner turns the portal limit off", async () => {
      await page.context().clearCookies();
      await login.loginToPortal();
      await aiSettings.openLimitsTab();
      await aiSettings.disableLimit("portal");
      await expectApiScopeLimit("portal", { enabled: false });
      await aiSettings.openLimitsTab();
      await aiSettings.expectLimitEnabled("portal", false);
    });
  });

  test("Individual limit blocks only its user, limit per user blocks everyone", async ({
    page,
    apiSdk,
    login,
  }) => {
    const { userData, userId } = await apiSdk.profiles.addMemberWithId(
      "owner",
      "User",
    );
    const userName = `${userData.firstName} ${userData.lastName}`;

    await test.step("Precondition: limit per user and a blocking individual limit for the user", async () => {
      await aiLimitsApi.setUserLimit(COMMON_LIMIT);
      await aiLimitsApi.setIndividualLimit(userId, BLOCKING_LIMIT);
      await expectApiUserLimit(userId, {
        scope: "Custom",
        amountValue: BLOCKING_LIMIT,
      });
    });

    await test.step("Owner is not affected by another user's individual limit", async () => {
      await expectChatWorks();
    });

    await test.step("The user with the individual limit is blocked", async () => {
      await page.context().clearCookies();
      await login.loginWithCredentials(userData.email, userData.password);
      await expectChatBlocked("user");
    });

    await test.step("Owner resets the individual limit with Set to default in Contacts", async () => {
      await page.context().clearCookies();
      await login.loginToPortal();
      await contacts.open();
      await contacts.aiLimit.showColumn();
      await contacts.aiLimit.openMenu(userName);
      await contacts.aiLimit.expectMenuItems(true);
      await contacts.aiLimit.closeMenu();
      await contacts.aiLimit.setToDefault(userName);
      await contacts.aiLimit.expectLimit(userName, {
        spent: 0,
        amount: COMMON_LIMIT,
        period: "day",
      });
      await expectApiUserLimit(userId, {
        scope: "Global",
        amountValue: COMMON_LIMIT,
      });
    });

    await test.step("Precondition: blocking limit per user", async () => {
      await aiLimitsApi.setUserLimit(BLOCKING_LIMIT);
    });

    // The limit per user applies to every user type, the owner included,
    // unless the user has an individual limit.
    await test.step("Owner is blocked by the limit per user", async () => {
      await expectChatBlocked("admin");
    });

    await test.step("The user is blocked by the limit per user too", async () => {
      await page.context().clearCookies();
      await login.loginWithCredentials(userData.email, userData.password);
      await expectChatBlocked("user");
    });
  });

  test("Change the limit period in AI limits tab", async () => {
    await test.step("Precondition: portal limit and limit per user", async () => {
      await aiLimitsApi.setPortalLimit(PERIOD_TEST_LIMIT);
      await aiLimitsApi.setUserLimit(PERIOD_TEST_LIMIT);
    });

    for (const form of ["portal", "user"] as const) {
      await test.step(`${form}: day is selected among all periods`, async () => {
        await aiSettings.openLimitsTab();
        await aiSettings.expectLimitPeriod(form, "day");
        await aiSettings.expectLimitPeriodOptions(form, "day");
      });

      await test.step(`${form}: Cancel discards an unsaved period`, async () => {
        await aiSettings.selectLimitPeriod(form, "week");
        await aiSettings.expectUnsavedChanges(form, true);
        await aiSettings.cancelLimitChanges(form);
        await aiSettings.expectLimitPeriod(form, "day");
      });

      for (const period of PERIODS_TO_SWITCH) {
        const { label, api } = aiLimitPeriods[period];
        await test.step(`${form}: switch the period to "${label}" and reload`, async () => {
          await aiSettings.selectLimitPeriod(form, period);
          await aiSettings.expectUnsavedChanges(form, true);
          await aiSettings.saveLimit(form);
          // Changing the period re-creates the limit - the amount must survive.
          await expectApiScopeLimit(form, {
            amountValue: PERIOD_TEST_LIMIT,
            period: api,
            enabled: true,
          });
          await aiSettings.openLimitsTab();
          await aiSettings.expectLimitPeriod(form, period);
          await aiSettings.expectLimitAmount(form, PERIOD_TEST_LIMIT);
          if (form === "portal") {
            await aiSettings.expectPortalLimitStatus(PERIOD_TEST_LIMIT);
          }
          await aiSettings.expectLimitResets(form, period !== "lifetime");
        });
      }
    }

    await test.step("Contacts link of the limit per user opens Contacts", async () => {
      await aiSettings.expectContactsLinkVisible(true);
      await aiSettings.openContactsFromUserLimit();
    });

    await test.step("Turning the limit per user off hides the Contacts link", async () => {
      await aiSettings.openLimitsTab();
      await aiSettings.disableLimit("user");
      await expectApiScopeLimit("user", { enabled: false });
      await aiSettings.openLimitsTab();
      await aiSettings.expectLimitEnabled("user", false);
      await aiSettings.expectContactsLinkVisible(false);
    });
  });

  test("Change AI limit dialog in Contacts: close, Cancel and period change", async ({
    apiSdk,
  }) => {
    const { userData, userId } = await apiSdk.profiles.addMemberWithId(
      "owner",
      "User",
    );
    const userName = `${userData.firstName} ${userData.lastName}`;

    await test.step("Precondition: limit per user", async () => {
      await aiLimitsApi.setUserLimit(COMMON_LIMIT);
    });

    await test.step("AI spending column shows the common limit, menu has no Set to default", async () => {
      await contacts.open();
      await contacts.aiLimit.showColumn();
      await contacts.aiLimit.expectLimit(userName, {
        spent: 0,
        amount: COMMON_LIMIT,
        period: "day",
      });
      await contacts.aiLimit.openMenu(userName);
      await contacts.aiLimit.expectMenuItems(false);
      await contacts.aiLimit.closeMenu();
    });

    await test.step("Dialog shows the current limit; the close button discards changes", async () => {
      await contacts.aiLimit.openChangeLimitDialog(userName);
      await contacts.aiLimit.expectDialogContent({
        spent: 0,
        amount: COMMON_LIMIT,
        period: "day",
      });
      await contacts.aiLimit.expectDialogPeriodHint("day");
      await contacts.aiLimit.fillDialogAmount(DISCARDED_AMOUNT);
      await contacts.aiLimit.closeDialog();
    });

    await test.step("Cancel discards an unsaved amount and period", async () => {
      await contacts.aiLimit.openChangeLimitDialog(userName);
      await contacts.aiLimit.expectDialogAmount(COMMON_LIMIT);
      await contacts.aiLimit.fillDialogAmount(DISCARDED_AMOUNT);
      await contacts.aiLimit.selectDialogPeriod("lifetime");
      await contacts.aiLimit.expectDialogPeriodHint("lifetime");
      await contacts.aiLimit.cancelDialog();
      await contacts.aiLimit.expectLimit(userName, {
        spent: 0,
        amount: COMMON_LIMIT,
        period: "day",
      });
      await expectApiUserLimit(userId, {
        scope: "Global",
        amountValue: COMMON_LIMIT,
      });
    });

    for (const period of PERIODS_TO_SWITCH) {
      const { label, api } = aiLimitPeriods[period];
      await test.step(`OK sets the individual limit "${label}", kept after reload`, async () => {
        await contacts.aiLimit.openChangeLimitDialog(userName);
        await contacts.aiLimit.fillDialogAmount(PERIOD_TEST_LIMIT);
        await contacts.aiLimit.selectDialogPeriod(period);
        if (period === "day" || period === "lifetime") {
          await contacts.aiLimit.expectDialogPeriodHint(period);
        }
        await contacts.aiLimit.submitDialog();
        await expectApiUserLimit(userId, {
          scope: "Custom",
          amountValue: PERIOD_TEST_LIMIT,
          period: api,
        });
        await contacts.open();
        await contacts.aiLimit.expectLimit(userName, {
          spent: 0,
          amount: PERIOD_TEST_LIMIT,
          period,
        });
      });
    }
  });

  test("AI spending column is offered in Contacts only when the limit per user is on", async () => {
    await test.step("Limit per user is off: no AI spending in the table settings", async () => {
      await contacts.open();
      await contacts.aiLimit.expectColumnAvailable(false);
    });

    await test.step("Precondition: turn the limit per user on", async () => {
      await aiLimitsApi.setUserLimit(COMMON_LIMIT);
    });

    await test.step("Limit per user is on: AI spending appears in the table settings", async () => {
      await contacts.open();
      await contacts.aiLimit.expectColumnAvailable(true);
    });
  });

  test("Individual limit is kept when the limit per user is changed", async ({
    apiSdk,
  }) => {
    const first = await apiSdk.profiles.addMemberWithId("owner", "User");
    const second = await apiSdk.profiles.addMemberWithId("owner", "User");
    const firstName = `${first.userData.firstName} ${first.userData.lastName}`;
    const secondName = `${second.userData.firstName} ${second.userData.lastName}`;

    await test.step("Precondition: limit per user and an individual limit for the first user", async () => {
      await aiLimitsApi.setUserLimit(COMMON_LIMIT);
      await aiLimitsApi.setIndividualLimit(first.userId, INDIVIDUAL_LIMIT);
    });

    await test.step("Owner changes the amount of the limit per user", async () => {
      await aiSettings.openLimitsTab();
      await aiSettings.fillLimitAmount("user", CHANGED_COMMON_LIMIT);
      await aiSettings.saveLimit("user");
      await expectApiUserLimit(second.userId, {
        scope: "Global",
        amountValue: CHANGED_COMMON_LIMIT,
      });
      await expectApiUserLimit(first.userId, {
        scope: "Custom",
        amountValue: INDIVIDUAL_LIMIT,
        period: "Day",
      });
    });

    // A period change re-creates the limit per user - it must not drop the
    // individual limits either.
    await test.step("Owner changes the period of the limit per user", async () => {
      await aiSettings.selectLimitPeriod("user", "week");
      await aiSettings.saveLimit("user");
      await expectApiUserLimit(second.userId, {
        scope: "Global",
        amountValue: CHANGED_COMMON_LIMIT,
        period: "Week",
      });
      await expectApiUserLimit(first.userId, {
        scope: "Custom",
        amountValue: INDIVIDUAL_LIMIT,
        period: "Day",
      });
    });

    await test.step("Contacts: the first user keeps the own limit, the second follows the common one", async () => {
      await contacts.open();
      await contacts.aiLimit.showColumn();
      await contacts.aiLimit.expectLimit(firstName, {
        spent: 0,
        amount: INDIVIDUAL_LIMIT,
        period: "day",
      });
      await contacts.aiLimit.expectLimit(secondName, {
        spent: 0,
        amount: CHANGED_COMMON_LIMIT,
        period: "week",
      });
    });
  });
});
