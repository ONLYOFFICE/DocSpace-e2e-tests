import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import Files from "@/src/objects/files/Files";
import { MetadataFieldType } from "@/src/services/files/metadata.services";
import { metadataToastMessages } from "@/src/utils/constants/metadata";
import {
  createDocxInFolder,
  createFileWithMetadata,
  createFolderInMyDocuments,
  createMetadataTemplate,
  getFileFieldValue,
} from "@/src/utils/helpers/metadata";

const TEMPLATE_NAME = "Project info";
const COMMENT_FIELD = "Comment";
const FOLDER_NAME = "Projects";
const FOLDER_VALUE = "Folder value";
const OWN_VALUE = "Own value";
const APPLIED_TOAST = metadataToastMessages.appliedToFolder(
  TEMPLATE_NAME,
  FOLDER_NAME,
);

test.describe("Metadata: folder cascade", () => {
  let files: Files;

  test.beforeEach(async ({ page, api, login }) => {
    files = new Files(page, api.portalDomain);
    await login.loginToPortal();
  });

  // Assigns the template to the folder via UI and fills the folder value
  const addTemplateToFolder = async () => {
    await files.open();
    await files.openItemMetadata(FOLDER_NAME);
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
      const template = await createMetadataTemplate(apiSdk, TEMPLATE_NAME, [
        { name: COMMENT_FIELD, type: MetadataFieldType.Text },
      ]);
      folderId = await createFolderInMyDocuments(apiSdk, FOLDER_NAME);
      await createDocxInFolder(apiSdk, folderId, emptyItem);
      await createFileWithMetadata(apiSdk, {
        title: ownValueItem,
        folderId,
        template,
        values: { [COMMENT_FIELD]: OWN_VALUE },
      });
    });

    await test.step("Add template to the folder", async () => {
      await addTemplateToFolder();
    });

    await test.step("Apply to all items with Skip", async () => {
      await files.infoPanel.metadata.enableCascade("skip");
      await files.dismissToastSafely(APPLIED_TOAST);
    });

    await test.step("Empty item got the folder value", async () => {
      await files.filesTable.openItem(FOLDER_NAME);
      await files.openItemMetadata(emptyItem);
      await files.infoPanel.metadata.checkCardValue(
        TEMPLATE_NAME,
        COMMENT_FIELD,
        FOLDER_VALUE,
      );
    });

    await test.step("Item with its own value kept it", async () => {
      await files.openItemMetadata(ownValueItem);
      await files.infoPanel.metadata.checkCardValue(
        TEMPLATE_NAME,
        COMMENT_FIELD,
        OWN_VALUE,
      );
    });

    await test.step("New file in the folder inherits the template", async () => {
      const newFileId = await createDocxInFolder(apiSdk, folderId, "New item");
      await expect
        .poll(
          async () =>
            (
              await getFileFieldValue(
                apiSdk,
                newFileId,
                TEMPLATE_NAME,
                COMMENT_FIELD,
              )
            )?.stringValue,
        )
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
      const template = await createMetadataTemplate(apiSdk, TEMPLATE_NAME, [
        { name: COMMENT_FIELD, type: MetadataFieldType.Text },
      ]);
      folderId = await createFolderInMyDocuments(apiSdk, FOLDER_NAME);
      ownFileId = await createFileWithMetadata(apiSdk, {
        title: ownValueItem,
        folderId,
        template,
        values: { [COMMENT_FIELD]: OWN_VALUE },
      });
    });

    await test.step("Add template to the folder", async () => {
      await addTemplateToFolder();
    });

    await test.step("Apply to all items with Overwrite", async () => {
      await files.infoPanel.metadata.enableCascade("overwrite");
      await files.dismissToastSafely(APPLIED_TOAST);
    });

    await test.step("Existing value was replaced by the folder value", async () => {
      await files.filesTable.openItem(FOLDER_NAME);
      await files.openItemMetadata(ownValueItem);
      await files.infoPanel.metadata.checkCardValue(
        TEMPLATE_NAME,
        COMMENT_FIELD,
        FOLDER_VALUE,
      );
    });

    await test.step("Turn cascade off", async () => {
      await files.open();
      await files.openItemMetadata(FOLDER_NAME);
      await files.infoPanel.metadata.disableCascade();
    });

    await test.step("Existing items keep values, new files get nothing", async () => {
      const ownValue = await getFileFieldValue(
        apiSdk,
        ownFileId,
        TEMPLATE_NAME,
        COMMENT_FIELD,
      );
      expect(ownValue?.stringValue).toBe(FOLDER_VALUE);
      const newFileId = await createDocxInFolder(apiSdk, folderId, "New item");
      const metadata = await apiSdk.metadata.getFileMetadata(
        "owner",
        newFileId,
      );
      expect(metadata.templates).toHaveLength(0);
    });
  });
});
