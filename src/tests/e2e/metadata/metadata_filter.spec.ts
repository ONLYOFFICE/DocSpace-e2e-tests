import { test } from "@/src/fixtures";
import Files from "@/src/objects/files/Files";
import { CONTRACT_TEMPLATE } from "@/src/utils/constants/metadata";
import {
  createContractTemplate,
  createFileWithMetadata,
  getTemplateField,
} from "@/src/utils/helpers/metadata";

const TEMPLATE_NAME = CONTRACT_TEMPLATE.name;
const FIELDS = CONTRACT_TEMPLATE.fields;

test.describe("Metadata: files filter", () => {
  let files: Files;

  test.beforeEach(async ({ page, api, login }) => {
    files = new Files(page, api.portalDomain);
    await login.loginToPortal();
  });

  test("Filter files by a Number field condition", async ({ apiSdk }) => {
    const bigFile = "Big deal";
    const smallFile = "Small deal";
    let amountFieldId: number;

    await test.step("Seed template and two files with different amounts", async () => {
      const template = await createContractTemplate(apiSdk);
      amountFieldId = getTemplateField(template, FIELDS.amount).id;
      await createFileWithMetadata(apiSdk, {
        title: bigFile,
        template,
        values: { [FIELDS.amount]: 15000 },
      });
      await createFileWithMetadata(apiSdk, {
        title: smallFile,
        template,
        values: { [FIELDS.amount]: 500 },
      });
    });

    await test.step("Both files are listed before filtering", async () => {
      await files.open();
      await files.filesTable.expectItemVisible(bigFile);
      await files.filesTable.expectItemVisible(smallFile);
    });

    await test.step("Add metadata condition Amount > 1000", async () => {
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
