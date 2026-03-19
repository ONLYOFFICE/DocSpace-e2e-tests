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

  test("Cancel delete tag in confirmation dialog — tag remains", async ({
    page,
  }) => {
    const tagName = "TagCancelDelete";
    const tagsPanel = new InlineTagsPanel(page);

    await test.step("Open panel and add tag", async () => {
      await myRooms.roomsTable.openInlineTagsPanel(roomName);
      await tagsPanel.waitForPanel();
      await tagsPanel.addTag(tagName);
      await tagsPanel.expectTagInPanel(tagName);
    });

    await test.step("Cancel delete in dialog — tag should remain", async () => {
      await tagsPanel.cancelDeleteTag(tagName);
      await tagsPanel.expectTagInPanel(tagName);
    });
  });

  test("Cancel rename tag in confirmation dialog — original name remains", async ({
    page,
  }) => {
    const tagName = "TagCancelEdit";
    const newName = "TagCancelEditRenamed";
    const tagsPanel = new InlineTagsPanel(page);

    await test.step("Open panel and add tag", async () => {
      await myRooms.roomsTable.openInlineTagsPanel(roomName);
      await tagsPanel.waitForPanel();
      await tagsPanel.addTag(tagName);
      await tagsPanel.expectTagInPanel(tagName);
    });

    await test.step("Cancel rename in dialog — original name should remain", async () => {
      await tagsPanel.cancelEditTagInModal(tagName, newName);
      await tagsPanel.expectTagInPanel(tagName);
      await tagsPanel.expectTagNotInPanel(newName);
    });
  });

  test("Delete confirmation checkbox suppresses dialog for subsequent deletes", async ({
    page,
  }) => {
    const tag1 = "TagDeleteCheckbox1";
    const tag2 = "TagDeleteCheckbox2";
    const tagsPanel = new InlineTagsPanel(page);

    await test.step("Open panel and add two tags", async () => {
      await myRooms.roomsTable.openInlineTagsPanel(roomName);
      await tagsPanel.waitForPanel();
      await tagsPanel.addTag(tag1);
      await tagsPanel.addTag(tag2);
      await tagsPanel.expectTagInPanel(tag1);
      await tagsPanel.expectTagInPanel(tag2);
    });

    await test.step("Delete first tag with 'don't show again' checkbox", async () => {
      await tagsPanel.deleteTagWithoutConfirm(tag1);
      await tagsPanel.expectTagNotInPanel(tag1);
    });

    await test.step("Delete second tag — confirmation dialog should not appear", async () => {
      await tagsPanel.deleteTagNoModal(tag2);
      await tagsPanel.expectTagNotInPanel(tag2);
    });
  });

  test("Rename confirmation checkbox suppresses dialog for subsequent renames", async ({
    page,
  }) => {
    const tag1 = "TagEditCheckbox1";
    const tag1Renamed = "TagEditCheckbox1Renamed";
    const tag2 = "TagEditCheckbox2";
    const tag2Renamed = "TagEditCheckbox2Renamed";
    const tagsPanel = new InlineTagsPanel(page);

    await test.step("Open panel and add two tags", async () => {
      await myRooms.roomsTable.openInlineTagsPanel(roomName);
      await tagsPanel.waitForPanel();
      await tagsPanel.addTag(tag1);
      await tagsPanel.addTag(tag2);
      await tagsPanel.expectTagInPanel(tag1);
      await tagsPanel.expectTagInPanel(tag2);
    });

    await test.step("Rename first tag with 'don't show again' checkbox", async () => {
      await tagsPanel.editTagWithoutConfirm(tag1, tag1Renamed);
      await tagsPanel.expectTagInPanel(tag1Renamed);
      await tagsPanel.expectTagNotInPanel(tag1);
    });

    await test.step("Rename second tag — confirmation dialog should not appear", async () => {
      await tagsPanel.editTagNoModal(tag2, tag2Renamed);
      await tagsPanel.expectTagInPanel(tag2Renamed);
      await tagsPanel.expectTagNotInPanel(tag2);
    });
  });

  test("Scrollbar appears in panel when tag list exceeds 7 items", async ({
    page,
  }) => {
    const tagsPanel = new InlineTagsPanel(page);

    await test.step("Open panel and add 8 tags", async () => {
      await myRooms.roomsTable.openInlineTagsPanel(roomName);
      await tagsPanel.waitForPanel();
      for (let i = 1; i <= 8; i++) {
        await tagsPanel.addTag(`ScrollTag${i}`);
      }
    });

    await test.step("Verify scrollbar is visible", async () => {
      await tagsPanel.expectScrollbarVisible();
    });
  });

  test("Typing existing tag name hides create button and shows matching dropdown item", async ({
    page,
  }) => {
    const tagName = "DuplicateTag";
    const tagsPanel = new InlineTagsPanel(page);

    await test.step("Open panel and add tag", async () => {
      await myRooms.roomsTable.openInlineTagsPanel(roomName);
      await tagsPanel.waitForPanel();
      await tagsPanel.addTag(tagName);
      await tagsPanel.expectTagInPanel(tagName);
    });

    await test.step("Type same name — create button hidden, matching item visible", async () => {
      await tagsPanel.typeTagName(tagName);
      await tagsPanel.expectCreateButtonNotVisible();
      await tagsPanel.expectTagDropdownItemVisible(tagName);
    });
  });

  test("Add tag via info panel Details tab", async ({ page }) => {
    const firstTag = "InfoPanelTag1";
    const secondTag = "InfoPanelTag2";
    const tagsPanel = new InlineTagsPanel(page);

    await test.step("Add first tag via inline panel in table view", async () => {
      await myRooms.roomsTable.openInlineTagsPanel(roomName);
      await tagsPanel.waitForPanel();
      await tagsPanel.addTag(firstTag);
      await tagsPanel.expectTagInPanel(firstTag);
      await tagsPanel.closePanel();
    });

    await test.step("Open info panel and navigate to Details tab", async () => {
      await myRooms.infoPanel.open();
      await myRooms.roomsTable.selectRow(roomName);
      await myRooms.infoPanel.openTab("Details");
    });

    await test.step("Add second tag from Details tab and verify", async () => {
      await myRooms.infoPanel.openInlineTagsPanel();
      await tagsPanel.waitForPanel();
      await tagsPanel.addTag(secondTag);
      await tagsPanel.expectTagInPanel(secondTag);
    });
  });

  test("Add tag via inline tags panel in thumbnail view", async ({ page }) => {
    const tagName = "ThumbnailViewTag";
    const tagsPanel = new InlineTagsPanel(page);

    await test.step("Switch to thumbnail view", async () => {
      await myRooms.roomsFilter.switchToThumbnailView();
    });

    await test.step("Open inline tags panel from thumbnail", async () => {
      await myRooms.roomsTable.openInlineTagsPanelInThumbnailView(roomName);
      await tagsPanel.waitForPanel();
    });

    await test.step("Add tag and verify it appears in panel", async () => {
      await tagsPanel.addTag(tagName);
      await tagsPanel.expectTagInPanel(tagName);
    });
  });
});
