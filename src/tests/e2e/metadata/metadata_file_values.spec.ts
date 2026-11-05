import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import Files from "@/src/objects/files/Files";
import Customization from "@/src/objects/settings/customization/Customization";
import { ApiSDK } from "@/src/services";
import {
  MetadataFieldType,
  TMetadataTemplate,
} from "@/src/services/files/metadata.services";
import { toastMessages } from "@/src/utils/constants/settings";

const TEMPLATE_NAME = "Contract details";
const FIELDS = {
  comment: "Comment",
  due: "Due",
  amount: "Amount",
  status: "Status",
  labels: "Labels",
} as const;

// 15th of the current month - always visible in the default calendar view
const now = new Date();
const DUE_DATE = new Date(now.getFullYear(), now.getMonth(), 15);
const DUE_DATE_DISPLAY = DUE_DATE.toLocaleDateString("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const seedTemplate = (apiSdk: ApiSDK, name = TEMPLATE_NAME) =>
  apiSdk.metadata.createTemplate("owner", {
    name,
    fields: [
      { name: FIELDS.comment, type: MetadataFieldType.Text },
      { name: FIELDS.due, type: MetadataFieldType.Date },
      { name: FIELDS.amount, type: MetadataFieldType.Number },
      {
        name: FIELDS.status,
        type: MetadataFieldType.SingleSelect,
        options: ["Open", "Closed"],
      },
      {
        name: FIELDS.labels,
        type: MetadataFieldType.MultiSelect,
        options: ["Urgent", "Internal"],
      },
    ],
  });

const getField = (template: TMetadataTemplate, name: string) => {
  const field = template.fields.find((f) => f.name === name);
  if (!field) throw new Error(`Field "${name}" not found in template`);
  return field;
};

const getOptionId = (
  template: TMetadataTemplate,
  field: string,
  value: string,
) => {
  const option = getField(template, field).options?.find(
    (o) => o.value === value,
  );
  if (!option) throw new Error(`Option "${value}" not found in "${field}"`);
  return option.id;
};

const seedFile = async (apiSdk: ApiSDK, title: string): Promise<number> => {
  const response = await apiSdk.files.createFileInMyDocuments("owner", {
    title: `${title}.docx`,
  });
  return (await response.json()).response.id;
};

test.describe("Metadata: values on files", () => {
  let files: Files;
  let customization: Customization;

  test.beforeEach(async ({ page, api, login }) => {
    files = new Files(page, api.portalDomain);
    customization = new Customization(page);
    await login.loginToPortal();
  });

  const openFileMetadata = async (fileName: string) => {
    await files.open();
    await files.filesTable.selectRow(fileName);
    await files.infoPanel.open();
    await files.infoPanel.openTab("Metadata");
  };

  const openTemplatesSettings = async () => {
    await customization.open();
    await customization.openTab("Metadata templates");
  };

  test("Assign template to a file and fill all field types", async ({
    apiSdk,
  }) => {
    const fileName = "Contract";
    const otherTemplate = "Short note";

    await test.step("Seed two templates and a file via API", async () => {
      await seedTemplate(apiSdk);
      await apiSdk.metadata.createTemplate("owner", {
        name: otherTemplate,
        fields: [{ name: "Note", type: MetadataFieldType.Text }],
      });
      await seedFile(apiSdk, fileName);
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
      await seedTemplate(apiSdk);
      await seedFile(apiSdk, fileName);
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

  test("Hidden template keeps file values and shows them again when visible", async ({
    apiSdk,
  }) => {
    const fileName = "Report";

    await test.step("Seed template, file and values via API", async () => {
      const template = await seedTemplate(apiSdk);
      const fileId = await seedFile(apiSdk, fileName);
      await apiSdk.metadata.assignTemplatesToFile("owner", fileId, [
        template.id,
      ]);
      await apiSdk.metadata.setFileValues("owner", fileId, [
        { fieldId: getField(template, FIELDS.comment).id, stringValue: "Q3" },
      ]);
    });

    await test.step("Hide the template in settings", async () => {
      await openTemplatesSettings();
      await customization.metadataTemplates.setVisibilityInTable(
        TEMPLATE_NAME,
        false,
      );
    });

    await test.step("File shows no metadata", async () => {
      await openFileMetadata(fileName);
      await files.infoPanel.metadata.checkEmptyState();
    });

    await test.step("Show the template again in settings", async () => {
      await openTemplatesSettings();
      await customization.metadataTemplates.setVisibilityInTable(
        TEMPLATE_NAME,
        true,
      );
    });

    await test.step("File shows the saved value again", async () => {
      await openFileMetadata(fileName);
      await files.infoPanel.metadata.checkCardValue(
        TEMPLATE_NAME,
        FIELDS.comment,
        "Q3",
      );
    });
  });

  test("Deleting a template removes its values from files", async ({
    apiSdk,
  }) => {
    const fileName = "Agreement";
    let fileId: number;

    await test.step("Seed template, file and values via API", async () => {
      const template = await seedTemplate(apiSdk);
      fileId = await seedFile(apiSdk, fileName);
      await apiSdk.metadata.assignTemplatesToFile("owner", fileId, [
        template.id,
      ]);
      await apiSdk.metadata.setFileValues("owner", fileId, [
        {
          fieldId: getField(template, FIELDS.comment).id,
          stringValue: "Signed",
        },
      ]);
    });

    await test.step("File shows the metadata card", async () => {
      await openFileMetadata(fileName);
      await files.infoPanel.metadata.checkCardValue(
        TEMPLATE_NAME,
        FIELDS.comment,
        "Signed",
      );
    });

    await test.step("Delete the template in settings", async () => {
      await openTemplatesSettings();
      await customization.metadataTemplates.deleteTemplate(TEMPLATE_NAME);
      await customization.dismissToastSafely(
        toastMessages.metadataTemplateDeleted,
      );
    });

    await test.step("File has no metadata left", async () => {
      await openFileMetadata(fileName);
      await files.infoPanel.metadata.checkEmptyState();
      const metadata = await apiSdk.metadata.getFileMetadata("owner", fileId);
      expect(metadata.templates).toHaveLength(0);
    });
  });

  test("Editing a used template updates file metadata", async ({ apiSdk }) => {
    const fileName = "Purchase order";
    const metadataTemplates = () => customization.metadataTemplates;

    await test.step("Seed template, file and values via API", async () => {
      const template = await seedTemplate(apiSdk);
      const fileId = await seedFile(apiSdk, fileName);
      await apiSdk.metadata.assignTemplatesToFile("owner", fileId, [
        template.id,
      ]);
      await apiSdk.metadata.setFileValues("owner", fileId, [
        {
          fieldId: getField(template, FIELDS.comment).id,
          stringValue: "Draft",
        },
        {
          fieldId: getField(template, FIELDS.status).id,
          optionIds: [getOptionId(template, FIELDS.status, "Closed")],
        },
        {
          fieldId: getField(template, FIELDS.labels).id,
          optionIds: [getOptionId(template, FIELDS.labels, "Urgent")],
        },
      ]);
    });

    await test.step("Rename a field and a used option", async () => {
      await openTemplatesSettings();
      await metadataTemplates().openEditPanel(TEMPLATE_NAME);
      await metadataTemplates().openEditFieldPanel(FIELDS.comment);
      await metadataTemplates().fillFieldName("Remark");
      await metadataTemplates().submitField();
      await metadataTemplates().openEditFieldPanel(FIELDS.status);
      await metadataTemplates().renameOption("Closed", "Done");
      await metadataTemplates().submitField();
      await metadataTemplates().saveTemplate();
      await customization.dismissToastSafely(
        toastMessages.metadataTemplateSaved,
      );
    });

    await test.step("Used option cannot be removed", async () => {
      await metadataTemplates().openEditPanel(TEMPLATE_NAME);
      await metadataTemplates().openEditFieldPanel(FIELDS.labels);
      await metadataTemplates().deleteOption("Urgent");
      await metadataTemplates().submitField();
      await metadataTemplates().clickSaveTemplate();
      await customization.checkToastMessage(toastMessages.metadataOptionInUse);
      await metadataTemplates().cancelTemplatePanel();
    });

    await test.step("File card shows renamed field and option, values kept", async () => {
      await openFileMetadata(fileName);
      const metadata = files.infoPanel.metadata;
      await metadata.checkCardValue(TEMPLATE_NAME, "Remark", "Draft");
      await metadata.checkCardValue(TEMPLATE_NAME, FIELDS.status, "Done");
      await metadata.checkCardTags(TEMPLATE_NAME, FIELDS.labels, ["Urgent"]);
    });
  });

  test("Filter files by a Number field condition", async ({ apiSdk }) => {
    const bigFile = "Big deal";
    const smallFile = "Small deal";
    let amountFieldId: number;

    await test.step("Seed template and two files with different amounts", async () => {
      const template = await seedTemplate(apiSdk);
      amountFieldId = getField(template, FIELDS.amount).id;
      for (const [title, amount] of [
        [bigFile, 15000],
        [smallFile, 500],
      ] as const) {
        const fileId = await seedFile(apiSdk, title);
        await apiSdk.metadata.assignTemplatesToFile("owner", fileId, [
          template.id,
        ]);
        await apiSdk.metadata.setFileValues("owner", fileId, [
          { fieldId: amountFieldId, numberValue: amount },
        ]);
      }
    });

    await test.step("Add metadata condition Amount > 1000", async () => {
      await files.open();
      await files.filesFilter.openFilterDialog();
      await files.filesFilter.addMetadataCondition({
        template: TEMPLATE_NAME,
        field: FIELDS.amount,
        operator: "greater than",
        value: "1000",
      });
      await files.filesFilter.checkMetadataConditionChip(
        amountFieldId,
        "Amount: greater than · 1000",
      );
    });

    await test.step("Apply filter and verify only the matching file is listed", async () => {
      await files.filesFilter.applyFilter();
      await files.filesFilter.checkMetadataSelectedFilter(
        amountFieldId,
        "Amount: greater than · 1000",
      );
      await files.filesTable.expectItemVisible(bigFile);
      await files.filesTable.expectItemNotVisible(smallFile);
    });
  });
});
