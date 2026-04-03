import { test } from "@/src/fixtures";
import Webhooks from "@/src/objects/settings/developerTools/Webhooks";

test.describe("Webhooks tests", () => {
  let webhooks: Webhooks;

  test.beforeEach(async ({ page, login }) => {
    webhooks = new Webhooks(page);

    await login.loginToPortal();
    await webhooks.open();
  });

  test("Create and verify webhook", async () => {
    await webhooks.createWebhook(
      "AutotestWebhook",
      "https://httpbin.org/status/200",
    );
    await webhooks.checkWebhookVisible("AutotestWebhook");
  });

  test("Edit webhook name", async () => {
    await webhooks.createWebhook(
      "AutotestWebhook",
      "https://httpbin.org/status/200",
    );
    await webhooks.checkWebhookVisible("AutotestWebhook");
    await webhooks.editWebhook("AutotestWebhook", "AutotestWebhookRenamed");
    await webhooks.checkWebhookVisible("AutotestWebhookRenamed");
  });

  test("Delete webhook", async () => {
    await webhooks.createWebhook(
      "AutotestWebhookDelete",
      "https://httpbin.org/status/200",
    );
    await webhooks.checkWebhookVisible("AutotestWebhookDelete");
    await webhooks.deleteWebhook("AutotestWebhookDelete");
  });
});
