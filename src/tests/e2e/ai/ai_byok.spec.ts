import { test } from "@/src/fixtures";
import AiSettings from "@/src/objects/ai/AiSettings";
import { PaymentApi } from "@/src/api/payment";
import config from "@/config";

const PROVIDER = "DeepSeek";
const BYOK_MODEL = "DeepSeek V4 Pro";
const OTHER_MODEL = "DeepSeek V4.1 Flash";
const INVALID_KEY_ERROR =
  "The specified API key is invalid or does not have access rights";
const KEY_SAVED_TOAST = "API key saved";
const KEY_DELETED_TOAST = "API key deleted";

test.describe("AI settings: BYOK", () => {
  test.skip(!config.DEEPSEEK_API_KEY, "DEEPSEEK_API_KEY is not set");

  let aiSettings: AiSettings;

  test.beforeEach(async ({ page, api, login }) => {
    aiSettings = new AiSettings(page, api.portalDomain);
    const paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    await login.loginToPortal();

    await test.step("Precondition: top up wallet and activate AI features", async () => {
      await paymentApi.setupPayment();
      await paymentApi.makeWalletTopUp();
      await aiSettings.open();
      await aiSettings.activate();
    });

    await aiSettings.openByokTab();
  });

  test("Own provider key runs the model on it", async () => {
    await test.step("Add a DeepSeek key for DeepSeek V4 Pro", async () => {
      await aiSettings.byok.addKey(
        PROVIDER,
        BYOK_MODEL,
        config.DEEPSEEK_API_KEY!,
      );
      await aiSettings.checkToastMessage(KEY_SAVED_TOAST);
      await aiSettings.byok.checkCard(BYOK_MODEL, PROVIDER);
    });

    await test.step("The model is no longer offered for a new key", async () => {
      await aiSettings.byok.openAddForm(PROVIDER);
      await aiSettings.byok.openModelList();
      await aiSettings.byok.checkModelOffered(OTHER_MODEL, true);
      await aiSettings.byok.checkModelOffered(BYOK_MODEL, false);
    });

    await test.step("AI models mark only this model as BYOK", async () => {
      await aiSettings.openModelsTab();
      await aiSettings.expectModelByokBadge(BYOK_MODEL, true);
      await aiSettings.expectModelByokBadge(OTHER_MODEL, false);
    });
  });

  test("Invalid key is rejected under the key field", async () => {
    await test.step("Submit a key the provider does not accept", async () => {
      await aiSettings.byok.addKey(PROVIDER, BYOK_MODEL, "sk-invalid-key");
    });

    await test.step("The error is shown and nothing is connected", async () => {
      await aiSettings.byok.checkKeyError(INVALID_KEY_ERROR);
      await aiSettings.byok.cancel();
      await aiSettings.byok.checkNoCards();
    });
  });

  test("Deleting the key removes the card and the BYOK badge", async () => {
    await test.step("Precondition: DeepSeek key is connected", async () => {
      await aiSettings.byok.addKey(
        PROVIDER,
        BYOK_MODEL,
        config.DEEPSEEK_API_KEY!,
      );
      await aiSettings.byok.checkCard(BYOK_MODEL, PROVIDER);
    });

    await test.step("Delete the key from the card menu", async () => {
      await aiSettings.byok.deleteKey(BYOK_MODEL);
      await aiSettings.checkToastMessage(KEY_DELETED_TOAST);
      await aiSettings.byok.checkNoCards();
    });

    await test.step("AI models no longer mark the model as BYOK", async () => {
      await aiSettings.openModelsTab();
      await aiSettings.expectModelByokBadge(BYOK_MODEL, false);
    });
  });
});
