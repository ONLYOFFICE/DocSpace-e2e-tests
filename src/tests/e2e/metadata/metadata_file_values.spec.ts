import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import Files from "@/src/objects/files/Files";
import { MetadataFieldType } from "@/src/services/files/metadata.services";
import { CONTRACT_TEMPLATE } from "@/src/utils/constants/metadata";
import {
  createContractTemplate,
  createDocxInMyDocuments,
  createFileWithMetadata,
  createMetadataTemplate,
} from "@/src/utils/helpers/metadata";

const TEMPLATE_NAME = CONTRACT_TEMPLATE.name;
const FIELDS = CONTRACT_TEMPLATE.fields;

// 15th of the current month - always visible in the default calendar view
const now = new Date();
const DUE_DATE = new Date(now.getFullYear(), now.getMonth(), 15);
const DUE_DATE_DISPLAY = DUE_DATE.toLocaleDateString("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

test.describe("Metadata: values on files", () => {
  let files: Files;

  test.beforeEach(async ({ page, api, login }) => {
    files = new Files(page, api.portalDomain);
    await login.loginToPortal();
  });

  const openFileMetadata = async (fileName: string) => {
    await files.open();
    await files.openItemMetadata(fileName);
  };

  test("Assign template to a file and fill all field types", async ({
    apiSdk,
  }) => {
    const fileName = "Contract";
    const otherTemplate = "Short note";

    await test.step("Seed two templates and a file via API", async () => {
      await createContractTemplate(apiSdk);
      await createMetadataTemplate(apiSdk, otherTemplate, [
        { name: "Note", type: MetadataFieldType.Text },
      ]);
      await createDocxInMyDocuments(apiSdk, fileName);
    });

    await test.step("Find the template with picker search", async () => {
      await openFileMetadata(fileName);
      await files.infoPanel.metadata.checkEmptyState();
      await files.infoPanel.metadata.openTemplatePicker();
      await files.infoPanel.metadata.checkTemplateInPicker(otherTemplate);
      await files.infoPanel.metadata.searchTemplateInPicker("Contract");
      await files.infoPanel.metadata.checkTemplateInPicker(TEMPLATE_NAME);
      await files.infoPanel.metadata.checkTemplateNotInPicker(otherTemplate);
      await files.infoPanel.metadata.selectTemplateInPicker(TEMPLATE_NAME);
    });

    await test.step("Fill all fields and save", async () => {
      const metadata = files.infoPanel.metadata;
      await metadata.fillTextValue(FIELDS.comment, "First contract");
      await metadata.selectDate(FIELDS.due, DUE_DATE);
      await metadata.fillNumberValue(FIELDS.amount, "15000");
      await metadata.selectSingleOption(FIELDS.status, "Closed");
      await metadata.selectMultiOptions(FIELDS.labels, ["Urgent", "Internal"]);
      await metadata.saveValues();
    });

    await test.step("Verify values on the metadata card", async () => {
      const metadata = files.infoPanel.metadata;
      await metadata.checkCardVisible(TEMPLATE_NAME);
      await metadata.checkCardValue(
        TEMPLATE_NAME,
        FIELDS.comment,
        "First contract",
      );
      await metadata.checkCardValue(
        TEMPLATE_NAME,
        FIELDS.due,
        DUE_DATE_DISPLAY,
      );
      await metadata.checkCardValue(TEMPLATE_NAME, FIELDS.amount, "15,000");
      await metadata.checkCardValue(TEMPLATE_NAME, FIELDS.status, "Closed");
      await metadata.checkCardTags(TEMPLATE_NAME, FIELDS.labels, [
        "Urgent",
        "Internal",
      ]);
    });
  });

  test("Number field accepts whole numbers only", async ({ apiSdk }) => {
    const fileName = "Invoice";
    const wholeNumberError = "Enter a whole number";

    await test.step("Seed template and file via API", async () => {
      await createContractTemplate(apiSdk);
      await createDocxInMyDocuments(apiSdk, fileName);
    });

    await test.step("Open template fill form", async () => {
      await openFileMetadata(fileName);
      await files.infoPanel.metadata.openTemplatePicker();
      await files.infoPanel.metadata.selectTemplateInPicker(TEMPLATE_NAME);
    });

    await test.step("Decimal value is rejected", async () => {
      await files.infoPanel.metadata.fillNumberValue(FIELDS.amount, "12.5");
      await files.infoPanel.metadata.checkFieldError(
        FIELDS.amount,
        wholeNumberError,
      );
      await files.infoPanel.metadata.checkSaveDisabled();
    });

    await test.step("Negative whole value is accepted", async () => {
      await files.infoPanel.metadata.fillNumberValue(FIELDS.amount, "-25");
      await files.infoPanel.metadata.checkFieldNoError(
        FIELDS.amount,
        wholeNumberError,
      );
    });

    await test.step("Large value is saved with a thousands separator", async () => {
      await files.infoPanel.metadata.fillNumberValue(FIELDS.amount, "15000");
      await files.infoPanel.metadata.saveValues();
      await files.infoPanel.metadata.checkCardValue(
        TEMPLATE_NAME,
        FIELDS.amount,
        "15,000",
      );
    });
  });

  test("Edit file values from the metadata card", async ({ apiSdk }) => {
    const fileName = "Estimate";

    await test.step("Seed template, file and values via API", async () => {
      const template = await createContractTemplate(apiSdk);
      await createFileWithMetadata(apiSdk, {
        title: fileName,
        template,
        values: { [FIELDS.comment]: "Initial", [FIELDS.amount]: 10 },
      });
    });

    await test.step("Open the card in edit mode - Save is disabled until a change", async () => {
      await openFileMetadata(fileName);
      await files.infoPanel.metadata.openCardEdit(TEMPLATE_NAME);
      await files.infoPanel.metadata.checkSaveDisabled();
    });

    await test.step("Change one value, clear another and save", async () => {
      await files.infoPanel.metadata.fillNumberValue(FIELDS.amount, "20");
      await files.infoPanel.metadata.fillTextValue(FIELDS.comment, "");
      await files.infoPanel.metadata.saveValues();
    });

    await test.step("Verify updated values on the card", async () => {
      const metadata = files.infoPanel.metadata;
      await metadata.checkCardValue(TEMPLATE_NAME, FIELDS.amount, "20");
      await metadata.checkCardValue(TEMPLATE_NAME, FIELDS.comment, "—");
    });
  });

  test("Remove metadata from a file keeps the template", async ({ apiSdk }) => {
    const fileName = "Memo";
    let fileId: number;

    await test.step("Seed template, file and values via API", async () => {
      const template = await createContractTemplate(apiSdk);
      fileId = await createFileWithMetadata(apiSdk, {
        title: fileName,
        template,
        values: { [FIELDS.comment]: "To remove" },
      });
    });

    await test.step("Remove metadata via the card menu", async () => {
      await openFileMetadata(fileName);
      await files.infoPanel.metadata.removeCard(TEMPLATE_NAME);
      await files.infoPanel.metadata.checkEmptyState();
      const metadata = await apiSdk.metadata.getFileMetadata("owner", fileId);
      expect(metadata.templates).toHaveLength(0);
    });

    await test.step("Template is still offered in the picker", async () => {
      await files.infoPanel.metadata.openTemplatePicker();
      await files.infoPanel.metadata.checkTemplateInPicker(TEMPLATE_NAME);
      await files.infoPanel.metadata.closeTemplatePicker();
    });
  });
});
