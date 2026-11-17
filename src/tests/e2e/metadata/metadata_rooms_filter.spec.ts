import { test } from "@/src/fixtures";
import MyRooms from "@/src/objects/rooms/Rooms";
import { CONTRACT_TEMPLATE } from "@/src/utils/constants/metadata";
import {
  createContractTemplate,
  getTemplateField,
  setFolderMetadata,
} from "@/src/utils/helpers/metadata";

const TEMPLATE_NAME = CONTRACT_TEMPLATE.name;
const FIELDS = CONTRACT_TEMPLATE.fields;
const CONDITION_TEXT = "Amount: greater than · 1000";

test.describe("Metadata: rooms filter", () => {
  let myRooms: MyRooms;

  test.beforeEach(async ({ page, api, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    await login.loginToPortal();
  });

  test("Filter rooms by a Number field condition", async ({ apiSdk }) => {
    const bigRoom = "Big project";
    const smallRoom = "Small project";
    let amountFieldId: number;

    await test.step("Seed template and two rooms with different amounts", async () => {
      const template = await createContractTemplate(apiSdk);
      amountFieldId = getTemplateField(template, FIELDS.amount).id;
      for (const [title, amount] of [
        [bigRoom, 15000],
        [smallRoom, 500],
      ] as const) {
        const response = await apiSdk.rooms.createRoom("owner", {
          title,
          roomType: "CustomRoom",
        });
        const roomId = (await response.json()).response.id;
        await setFolderMetadata(apiSdk, {
          folderId: roomId,
          template,
          values: { [FIELDS.amount]: amount },
        });
      }
    });

    await test.step("Both rooms are listed before filtering", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.checkRowExist(bigRoom);
      await myRooms.roomsTable.checkRowExist(smallRoom);
    });

    await test.step("Add metadata condition Amount > 1000", async () => {
      await myRooms.roomsFilter.openFilterDialog();
      await myRooms.roomsFilter.addMetadataCondition({
        template: TEMPLATE_NAME,
        field: FIELDS.amount,
        operator: "greater than",
        value: "1000",
      });
      await myRooms.roomsFilter.checkMetadataConditionChip(
        amountFieldId,
        CONDITION_TEXT,
      );
    });

    await test.step("Apply filter and verify only the matching room is listed", async () => {
      await myRooms.roomsFilter.applyFilter();
      await myRooms.roomsFilter.checkMetadataSelectedFilter(
        amountFieldId,
        CONDITION_TEXT,
      );
      await myRooms.roomsTable.checkRowExist(bigRoom);
      await myRooms.roomsTable.checkRowNotExist(smallRoom);
    });
  });
});
