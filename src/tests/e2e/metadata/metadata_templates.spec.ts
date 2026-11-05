import { test } from "@/src/fixtures";
import Customization from "@/src/objects/settings/customization/Customization";
import MetadataTemplates, {
  TMetadataField,
} from "@/src/objects/settings/customization/MetadataTemplates";
import Files from "@/src/objects/files/Files";
import { toastMessages } from "@/src/utils/constants/settings";

const ALL_TYPES_FIELDS: TMetadataField[] = [
  { name: "Description", type: "Text" },
  { name: "Amount", type: "Number" },
  { name: "Due date", type: "Date" },
  { name: "Status", type: "Single select", options: ["Open", "Closed"] },
  { name: "Labels", type: "Multi select", options: ["Urgent", "Internal"] },
];

const TEXT_FIELD: TMetadataField = { name: "Note", type: "Text" };

test.describe("Settings - Customization: Metadata templates", () => {
  let customization: Customization;
  let metadataTemplates: MetadataTemplates;

  test.beforeEach(async ({ page, login }) => {
    customization = new Customization(page);
    metadataTemplates = customization.metadataTemplates;
    await login.loginToPortal();
    await customization.open();
    await customization.openTab("Metadata templates");
  });

  test("Create template with all field types", async ({ apiSdk }) => {
    const templateName = "Contract details";
    let ownerName: string;

    await test.step("Get owner display name", async () => {
      const response = await apiSdk.profiles.returnHimselfInformation("owner");
      ownerName = (await response.json()).response.displayName;
    });

    await test.step("Fill template name and add fields of every type", async () => {
      await metadataTemplates.openCreatePanel();
      await metadataTemplates.fillTemplateName(templateName);
      for (const field of ALL_TYPES_FIELDS) {
        await metadataTemplates.addField(field);
      }
      await metadataTemplates.checkFieldsCountInPanel(ALL_TYPES_FIELDS.length);
    });

    await test.step("Save template", async () => {
      await metadataTemplates.saveTemplate();
      await customization.dismissToastSafely(
        toastMessages.metadataTemplateSaved,
      );
    });

    await test.step("Verify template row in the table", async () => {
      await metadataTemplates.checkTemplateRow(templateName, {
        fieldsCount: ALL_TYPES_FIELDS.length,
        author: ownerName,
      });
      await metadataTemplates.checkVisibilityInTable(templateName, true);
    });

    await test.step("Verify saved fields in the edit panel", async () => {
      await metadataTemplates.openEditPanel(templateName);
      await metadataTemplates.checkFieldsCountInPanel(ALL_TYPES_FIELDS.length);
      for (const field of ALL_TYPES_FIELDS) {
        await metadataTemplates.checkFieldInPanel(field);
      }
    });
  });

  test("Add field and Save are blocked until required data is filled", async () => {
    await test.step("Empty template - Save is disabled", async () => {
      await metadataTemplates.openCreatePanel();
      await metadataTemplates.checkSaveDisabled();
    });

    await test.step("Field without name - Add is disabled", async () => {
      await metadataTemplates.openAddFieldPanel();
      await metadataTemplates.selectFieldType("Text");
      await metadataTemplates.checkFieldSubmitDisabled();
    });

    await test.step("Select field without options - Add is disabled", async () => {
      await metadataTemplates.fillFieldName("Status");
      await metadataTemplates.selectFieldType("Single select");
      await metadataTemplates.checkFieldSubmitDisabled();
    });

    await test.step("Select field with an option - Add is enabled", async () => {
      await metadataTemplates.fillOptions(["Open"]);
      await metadataTemplates.checkFieldSubmitEnabled();
      await metadataTemplates.submitField();
    });

    await test.step("Template with field but without name - Save is disabled", async () => {
      await metadataTemplates.checkSaveDisabled();
    });

    await test.step("Template with name and field - Save is enabled", async () => {
      await metadataTemplates.fillTemplateName("Validation template");
      await metadataTemplates.checkSaveEnabled();
    });

    await test.step("Template with name but without fields - Save is disabled", async () => {
      await metadataTemplates.deleteFieldInPanel("Status");
      await metadataTemplates.checkFieldsCountInPanel(0);
      await metadataTemplates.checkSaveDisabled();
    });
  });

  test("Hidden template is not shown in the info panel template picker", async ({
    page,
    api,
    apiSdk,
  }) => {
    const visibleTemplate = "Visible template";
    const hiddenTemplate = "Hidden template";
    const fileName = "Metadata file";

    await test.step("Create two templates", async () => {
      await metadataTemplates.createTemplate(visibleTemplate, [TEXT_FIELD]);
      await customization.dismissToastSafely(
        toastMessages.metadataTemplateSaved,
      );
      await metadataTemplates.createTemplate(hiddenTemplate, [TEXT_FIELD]);
      await customization.dismissToastSafely(
        toastMessages.metadataTemplateSaved,
      );
    });

    await test.step("Hide one template with the table toggle", async () => {
      await metadataTemplates.setVisibilityInTable(hiddenTemplate, false);
      await metadataTemplates.checkVisibilityInTable(visibleTemplate, true);
    });

    await test.step("Create a file in My Documents", async () => {
      await apiSdk.files.createFileInMyDocuments("owner", {
        title: `${fileName}.docx`,
      });
    });

    const files = new Files(page, api.portalDomain);

    await test.step("Open Metadata tab of the file", async () => {
      await files.open();
      await files.filesTable.selectRow(fileName);
      await files.infoPanel.open();
      await files.infoPanel.openTab("Metadata");
    });

    await test.step("Verify only the visible template is offered", async () => {
      await files.infoPanel.metadata.openTemplatePicker();
      await files.infoPanel.metadata.checkTemplateInPicker(visibleTemplate);
      await files.infoPanel.metadata.checkTemplateNotInPicker(hiddenTemplate);
      await files.infoPanel.metadata.closeTemplatePicker();
    });
  });

  test("Edit and delete template", async ({ apiSdk }) => {
    const templateName = "Invoice";
    const renamedTemplate = "Invoice renamed";
    let ownerName: string;

    await test.step("Get owner display name", async () => {
      const response = await apiSdk.profiles.returnHimselfInformation("owner");
      ownerName = (await response.json()).response.displayName;
    });

    await test.step("Create template", async () => {
      await metadataTemplates.createTemplate(templateName, [TEXT_FIELD]);
      await customization.dismissToastSafely(
        toastMessages.metadataTemplateSaved,
      );
      await metadataTemplates.checkTemplateRow(templateName, {
        fieldsCount: 1,
        author: ownerName,
      });
    });

    await test.step("Rename template and add a field", async () => {
      await metadataTemplates.openEditPanel(templateName);
      await metadataTemplates.checkSaveDisabled();
      await metadataTemplates.fillTemplateName(renamedTemplate);
      await metadataTemplates.addField({ name: "Total", type: "Number" });
      await metadataTemplates.saveTemplate();
      await customization.dismissToastSafely(
        toastMessages.metadataTemplateSaved,
      );
    });

    await test.step("Verify updated row", async () => {
      await metadataTemplates.checkTemplateNotInTable(templateName);
      await metadataTemplates.checkTemplateRow(renamedTemplate, {
        fieldsCount: 2,
        author: ownerName,
      });
    });

    await test.step("Delete template", async () => {
      await metadataTemplates.deleteTemplate(renamedTemplate);
      await customization.dismissToastSafely(
        toastMessages.metadataTemplateDeleted,
      );
    });

    await test.step("Verify table is empty", async () => {
      await metadataTemplates.checkTemplateNotInTable(renamedTemplate);
      await metadataTemplates.checkTableHidden();
    });
  });
});
