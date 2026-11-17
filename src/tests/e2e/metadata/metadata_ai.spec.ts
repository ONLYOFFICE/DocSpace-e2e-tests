import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import Files from "@/src/objects/files/Files";
import AiSettings from "@/src/objects/ai/AiSettings";
import { PaymentApi } from "@/src/api/payment";
import { AiLimitsApi } from "@/src/api/aiLimits";
import { CONTRACT_TEMPLATE } from "@/src/utils/constants/metadata";
import { createContractTemplate } from "@/src/utils/helpers/metadata";

// The document states the values plainly, so the model finds them every time:
// Comment: Annual support renewal / Amount: 1500 / Status: Closed / Labels: Urgent
const CONTRACT_FILE = "data/documents/test-contract.docx";
const CONTRACT_TITLE = "test-contract";
const TEMPLATE_NAME = CONTRACT_TEMPLATE.name;
const FIELDS = CONTRACT_TEMPLATE.fields;
// The server checks the estimated request cost against the remaining limit,
// so a US$0.01 limit blocks the very first request
const BLOCKING_LIMIT = 0.01;

test.describe("Metadata: AI tools", () => {
  let files: Files;
  let aiSettings: AiSettings;
  let aiLimitsApi: AiLimitsApi;
  let fileId: number;

  test.beforeEach(async ({ page, api, apiSdk, login }) => {
    files = new Files(page, api.portalDomain);
    aiSettings = new AiSettings(page, api.portalDomain);
    aiLimitsApi = new AiLimitsApi(api.apiRequestContext, api.apisystem);
    const paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    await login.loginToPortal();

    await test.step("Precondition: top up wallet and activate AI features", async () => {
      await paymentApi.setupPayment();
      await paymentApi.makeWalletTopUp();
      await aiSettings.open();
      await aiSettings.activate();
    });

    await test.step("Precondition: contract file with the template assigned", async () => {
      const template = await createContractTemplate(apiSdk);
      const uploaded = await apiSdk.files.uploadToMyDocuments(
        "owner",
        CONTRACT_FILE,
      );
      fileId = uploaded.id;
      await apiSdk.metadata.assignTemplatesToFile("owner", fileId, [
        template.id,
      ]);
    });

    await files.open();
  });

  test("Fill metadata fills template fields from the file content", async () => {
    await test.step("Run Fill metadata", async () => {
      await files.openFillMetadataAi(CONTRACT_TITLE);
      await files.metadataAiPanel.runAi();
      await files.metadataAiPanel.checkReviewNote(/AI filled \d+ fields/);
    });

    await test.step("Save the suggested values", async () => {
      await files.metadataAiPanel.save();
    });

    await test.step("Values from the document are on the metadata card", async () => {
      await files.open();
      await files.openItemMetadata(CONTRACT_TITLE);
      const metadata = files.infoPanel.metadata;
      await metadata.checkCardValue(
        TEMPLATE_NAME,
        FIELDS.comment,
        "Annual support renewal",
      );
      await metadata.checkCardValue(TEMPLATE_NAME, FIELDS.amount, "1,500");
      await metadata.checkCardValue(TEMPLATE_NAME, FIELDS.status, "Closed");
      await metadata.checkCardTags(TEMPLATE_NAME, FIELDS.labels, ["Urgent"]);
    });
  });

  test("Generate metadata adds custom fields from the file content", async ({
    apiSdk,
  }) => {
    await test.step("Run Generate metadata", async () => {
      await files.openGenerateMetadataAi(CONTRACT_TITLE);
      await files.metadataAiPanel.runAi();
      await files.metadataAiPanel.checkReviewNote(/AI generated \d+ fields/);
      await files.metadataAiPanel.checkReviewHasCustomFields();
    });

    await test.step("Save the generated fields", async () => {
      await files.metadataAiPanel.save();
    });

    await test.step("The file has custom fields with values", async () => {
      const metadata = await apiSdk.metadata.getFileMetadata("owner", fileId);
      expect(metadata.customFields.length).toBeGreaterThan(0);
      for (const field of metadata.customFields) {
        expect(field.value).toBeTruthy();
      }
    });
  });

  test("AI spending limit blocks Fill metadata", async () => {
    await test.step("Precondition: portal AI limit is reached", async () => {
      await aiLimitsApi.setPortalLimit(BLOCKING_LIMIT);
    });

    await test.step("Fill metadata shows the limit notice", async () => {
      await files.openFillMetadataAi(CONTRACT_TITLE);
      await files.metadataAiPanel.runAiBlockedByLimit();
      await files.metadataAiPanel.checkLimitNotice("admin");
    });

    await test.step("Change AI limit leads to the AI limits tab", async () => {
      await files.metadataAiPanel.clickChangeLimit();
      await aiSettings.expectLimitsTabOpened();
    });
  });
});
