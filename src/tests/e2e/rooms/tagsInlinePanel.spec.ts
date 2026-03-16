import { test } from "@/src/fixtures";
import MyRooms from "@/src/objects/rooms/Rooms";
import InlineTagsPanel from "@/src/objects/rooms/InlineTagsPanel";

test.describe("Rooms: inline tags panel", () => {
  let myRooms: MyRooms;
  const roomName = "Inline Tag Room";

  test.beforeEach(async ({ page, api, apiSdk, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    await apiSdk.rooms.createRoom("owner", {
      title: roomName,
      roomType: "EditingRoom",
    });
    await login.loginToPortal();
  });

  test("Add, edit and delete tag via inline tags panel", async ({ page }) => {
    const tagName = "InlineTag1";
    const renamedTag = "InlineTag1Edited";

    await test.step("Add tag via inline tags panel", async () => {
      const tagsPanel = new InlineTagsPanel(page);
      await myRooms.roomsTable.openInlineTagsPanel(roomName);
      await tagsPanel.waitForPanel();
      await tagsPanel.addTag(tagName);
      await tagsPanel.expectTagInPanel(tagName);
    });

    await test.step("Edit tag via inline tags panel", async () => {
      const tagsPanel = new InlineTagsPanel(page);
      await tagsPanel.editTag(tagName, renamedTag);
      await tagsPanel.expectTagInPanel(renamedTag);
      await tagsPanel.expectTagNotInPanel(tagName);
    });

    await test.step("Delete tag via inline tags panel", async () => {
      const tagsPanel = new InlineTagsPanel(page);
      await tagsPanel.deleteTag(renamedTag);
      await tagsPanel.expectTagNotInPanel(renamedTag);
    });
  });
});
