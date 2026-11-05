import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import Files from "@/src/objects/files/Files";
import Customization from "@/src/objects/settings/customization/Customization";
import { toastMessages } from "@/src/utils/constants/settings";
import { CONTRACT_TEMPLATE } from "@/src/utils/constants/metadata";
import {
  createContractTemplate,
  createFileWithMetadata,
} from "@/src/utils/helpers/metadata";

const TEMPLATE_NAME = CONTRACT_TEMPLATE.name;
const FIELDS = CONTRACT_TEMPLATE.fields;

// Changes to a template in settings and how they reach files using it
test.describe("Metadata: template lifecycle on files", () => {
  let files: Files;
  let customization: Customization;

  test.beforeEach(async ({ page, api, login }) => {
    files = new Files(page, api.portalDomain);
    customization = new Customization(page);
    await login.loginToPortal();
  });

  const openFileMetadata = async (fileName: string) => {
    await files.open();
    await files.openItemMetadata(fileName);
  };

  const openTemplatesSettings = async () => {
    await customization.open();
    await customization.openTab("Metadata templates");
  };

  test("Hidden template keeps file values and shows them again when visible", async ({
    apiSdk,
  }) => {
    const fileName = "Report";

    await test.step("Seed template, file and values via API", async () => {
      const template = await createContractTemplate(apiSdk);
      await createFileWithMetadata(apiSdk, {
        title: fileName,
        template,
        values: { [FIELDS.comment]: "Q3" },
      });
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
      const template = await createContractTemplate(apiSdk);
      fileId = await createFileWithMetadata(apiSdk, {
        title: fileName,
        template,
        values: { [FIELDS.comment]: "Signed" },
      });
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
      const template = await createContractTemplate(apiSdk);
      await createFileWithMetadata(apiSdk, {
        title: fileName,
        template,
        values: {
          [FIELDS.comment]: "Draft",
          [FIELDS.status]: "Closed",
          [FIELDS.labels]: ["Urgent"],
        },
      });
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
});
