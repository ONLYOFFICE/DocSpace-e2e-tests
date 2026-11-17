import { test } from "@/src/fixtures";
import Files from "@/src/objects/files/Files";
import Trash from "@/src/objects/files/trash/Trash";
import {
  createContractTemplate,
  createFileWithMetadata,
} from "@/src/utils/helpers/metadata";
import { CONTRACT_TEMPLATE } from "@/src/utils/constants/metadata";

const FILE_NAME = "Trashed contract";

test.describe("Metadata: Trash", () => {
  let files: Files;
  let trash: Trash;

  test.beforeEach(async ({ page, api, login }) => {
    files = new Files(page, api.portalDomain);
    trash = new Trash(page);
    await login.loginToPortal();
  });

  test("Metadata tab is not shown for a file in Trash", async ({ apiSdk }) => {
    await test.step("Precondition: file with metadata moved to Trash", async () => {
      const template = await createContractTemplate(apiSdk);
      const fileId = await createFileWithMetadata(apiSdk, {
        title: FILE_NAME,
        template,
        values: { [CONTRACT_TEMPLATE.fields.comment]: "Before deletion" },
      });
      await apiSdk.files.deleteFile("owner", fileId);
    });

    await test.step("Open the file details in Trash", async () => {
      await files.open();
      await trash.open();
      await trash.trashTable.selectRow(FILE_NAME);
      await trash.infoPanel.open();
      await trash.infoPanel.checkDocxFileProperties();
    });

    await test.step("Info panel has no Metadata tab", async () => {
      await trash.infoPanel.checkTabNotVisible("Metadata");
    });
  });
});
