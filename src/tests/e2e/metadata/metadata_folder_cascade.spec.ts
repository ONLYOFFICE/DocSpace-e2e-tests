import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import Files from "@/src/objects/files/Files";
import { ApiSDK } from "@/src/services";
import {
  MetadataFieldType,
  TMetadataTemplate,
} from "@/src/services/files/metadata.services";

const TEMPLATE_NAME = "Project info";
const COMMENT_FIELD = "Comment";
const FOLDER_NAME = "Projects";
const FOLDER_VALUE = "Folder value";
const OWN_VALUE = "Own value";

const appliedToast = (template: string, folder: string) =>
  `${template} metadata has been applied to all items in ${folder}`;

const seedTemplate = (apiSdk: ApiSDK) =>
  apiSdk.metadata.createTemplate("owner", {
    name: TEMPLATE_NAME,
    fields: [{ name: COMMENT_FIELD, type: MetadataFieldType.Text }],
  });

const commentFieldId = (template: TMetadataTemplate) =>
  template.fields.find((f) => f.name === COMMENT_FIELD)!.id;

const seedFolder = async (apiSdk: ApiSDK): Promise<number> => {
  const myDocumentsId = await apiSdk.folders.getMyDocumentsFolderId("owner");
  const response = await apiSdk.files.createFolder(
    "owner",
    myDocumentsId,
    FOLDER_NAME,
  );
  return (await response.json()).response.id;
};

const seedFileInFolder = async (
  apiSdk: ApiSDK,
  folderId: number,
  title: string,
): Promise<number> => {
  const response = await apiSdk.files.createFile("owner", folderId, {
    title: `${title}.docx`,
  });
  return (await response.json()).response.id;
};

const getCommentValue = async (apiSdk: ApiSDK, fileId: number) => {
  const metadata = await apiSdk.metadata.getFileMetadata("owner", fileId);
  const template = metadata.templates.find((t) => t.name === TEMPLATE_NAME);
  return template?.fields.find((f) => f.name === COMMENT_FIELD)?.value
    ?.stringValue;
};

test.describe("Metadata: folder cascade", () => {
  let files: Files;

  test.beforeEach(async ({ page, api, login }) => {
    files = new Files(page, api.portalDomain);
    await login.loginToPortal();
  });

  const openItemMetadata = async (name: string) => {
    await files.filesTable.selectRow(name);
    await files.infoPanel.open();
    await files.infoPanel.openTab("Metadata");
  };

  // Assigns the template to the folder via UI and fills the folder value
  const addTemplateToFolder = async () => {
    await files.open();
    await openItemMetadata(FOLDER_NAME);
    await files.infoPanel.metadata.checkEmptyState();
    await files.infoPanel.metadata.checkCascadeToggleHidden();
    await files.infoPanel.metadata.openTemplatePicker();
    await files.infoPanel.metadata.selectTemplateInPicker(TEMPLATE_NAME);
    await files.infoPanel.metadata.fillTextValue(COMMENT_FIELD, FOLDER_VALUE);
    await files.infoPanel.metadata.saveValues();
    await files.infoPanel.metadata.checkCascadeToggleVisible();
    await files.infoPanel.metadata.checkCascadeEnabled(false);
  };

  test("Cascade with Skip fills empty items and keeps existing values", async ({
    apiSdk,
  }) => {
    const emptyItem = "Empty item";
    const ownValueItem = "Own value item";
    let folderId: number;

    await test.step("Seed template, folder and two files via API", async () => {
      const template = await seedTemplate(apiSdk);
      folderId = await seedFolder(apiSdk);
      await seedFileInFolder(apiSdk, folderId, emptyItem);
      const ownFileId = await seedFileInFolder(apiSdk, folderId, ownValueItem);
      await apiSdk.metadata.assignTemplatesToFile("owner", ownFileId, [
        template.id,
      ]);
      await apiSdk.metadata.setFileValues("owner", ownFileId, [
        { fieldId: commentFieldId(template), stringValue: OWN_VALUE },
      ]);
    });

    await test.step("Add template to the folder", async () => {
      await addTemplateToFolder();
    });

    await test.step("Apply to all items with Skip", async () => {
      await files.infoPanel.metadata.enableCascade("skip");
      await files.dismissToastSafely(appliedToast(TEMPLATE_NAME, FOLDER_NAME));
    });

    await test.step("Empty item got the folder value", async () => {
      await files.filesTable.openItem(FOLDER_NAME);
      await openItemMetadata(emptyItem);
      await files.infoPanel.metadata.checkCardValue(
        TEMPLATE_NAME,
        COMMENT_FIELD,
        FOLDER_VALUE,
      );
    });

    await test.step("Item with its own value kept it", async () => {
      await openItemMetadata(ownValueItem);
      await files.infoPanel.metadata.checkCardValue(
        TEMPLATE_NAME,
        COMMENT_FIELD,
        OWN_VALUE,
      );
    });

    await test.step("New file in the folder inherits the template", async () => {
      const newFileId = await seedFileInFolder(apiSdk, folderId, "New item");
      await expect
        .poll(() => getCommentValue(apiSdk, newFileId))
        .toBe(FOLDER_VALUE);
    });
  });

  test("Cascade with Overwrite replaces values; turning it off stops inheritance", async ({
    apiSdk,
  }) => {
    const ownValueItem = "Own value item";
    let folderId: number;
    let ownFileId: number;

    await test.step("Seed template, folder and a file with its own value", async () => {
      const template = await seedTemplate(apiSdk);
      folderId = await seedFolder(apiSdk);
      ownFileId = await seedFileInFolder(apiSdk, folderId, ownValueItem);
      await apiSdk.metadata.assignTemplatesToFile("owner", ownFileId, [
        template.id,
      ]);
      await apiSdk.metadata.setFileValues("owner", ownFileId, [
        { fieldId: commentFieldId(template), stringValue: OWN_VALUE },
      ]);
    });

    await test.step("Add template to the folder", async () => {
      await addTemplateToFolder();
    });

    await test.step("Apply to all items with Overwrite", async () => {
      await files.infoPanel.metadata.enableCascade("overwrite");
      await files.dismissToastSafely(appliedToast(TEMPLATE_NAME, FOLDER_NAME));
    });

    await test.step("Existing value was replaced by the folder value", async () => {
      await files.filesTable.openItem(FOLDER_NAME);
      await openItemMetadata(ownValueItem);
      await files.infoPanel.metadata.checkCardValue(
        TEMPLATE_NAME,
        COMMENT_FIELD,
        FOLDER_VALUE,
      );
    });

    await test.step("Turn cascade off", async () => {
      await files.open();
      await openItemMetadata(FOLDER_NAME);
      await files.infoPanel.metadata.disableCascade();
    });

    await test.step("Existing items keep values, new files get nothing", async () => {
      expect(await getCommentValue(apiSdk, ownFileId)).toBe(FOLDER_VALUE);
      const newFileId = await seedFileInFolder(apiSdk, folderId, "New item");
      const metadata = await apiSdk.metadata.getFileMetadata(
        "owner",
        newFileId,
      );
      expect(metadata.templates).toHaveLength(0);
    });
  });
});
