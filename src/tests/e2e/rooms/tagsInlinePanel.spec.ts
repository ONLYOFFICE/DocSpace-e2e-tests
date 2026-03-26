import { test } from "@/src/fixtures";
import MyRooms from "@/src/objects/rooms/Rooms";
import InlineTagsPanel from "@/src/objects/rooms/InlineTagsPanel";

// Most tests open the inline tags panel via context menu -> "Select" (openInlineTagsPanel).
// This selects the row and reveals the + tag button without relying on hover,
// which is flaky in Firefox - mouseenter on nested elements requires a graduated
// multi-step mouse movement. The dedicated hover test (openInlineTagsPanelByHover)
// covers that scenario explicitly.
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
    await page.waitForLoadState("load");
    await myRooms.roomsTable.checkRowExist(roomName);
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

  test("Cancel delete tag in confirmation dialog - tag remains", async ({
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

    await test.step("Cancel delete in dialog - tag should remain", async () => {
      await tagsPanel.cancelDeleteTag(tagName);
      await tagsPanel.expectTagInPanel(tagName);
    });
  });

  test("Cancel rename tag in confirmation dialog - original name remains", async ({
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

    await test.step("Cancel rename in dialog - original name should remain", async () => {
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
    });

    await test.step("Reopen inline tags panel to confirm tags were added", async () => {
      await tagsPanel.closePanelByClickingOutside();
      await myRooms.roomsTable.openInlineTagsPanel(roomName);
      await tagsPanel.waitForPanel();
      await tagsPanel.expectTagInPanel(tag1);
      await tagsPanel.expectTagInPanel(tag2);
    });

    await test.step("Delete first tag with 'don't show again' checkbox", async () => {
      await tagsPanel.deleteTagWithoutConfirm(tag1);
      await tagsPanel.expectTagNotInPanel(tag1);
    });

    await test.step("Reopen inline tags panel", async () => {
      await myRooms.roomsTable.openInlineTagsPanel(roomName);
      await tagsPanel.waitForPanel();
    });

    await test.step("Delete second tag - confirmation dialog should not appear", async () => {
      await tagsPanel.deleteTagNoModal(tag2);
    });

    await test.step("Verify second tag is deleted after panel reopen", async () => {
      await tagsPanel.closePanelByClickingOutside();
      await myRooms.roomsTable.openInlineTagsPanel(roomName);
      await tagsPanel.waitForPanel();
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
    });

    await test.step("Reopen inline tags panel to confirm tags were added", async () => {
      await tagsPanel.closePanelByClickingOutside();
      await myRooms.roomsTable.openInlineTagsPanel(roomName);
      await tagsPanel.waitForPanel();
      await tagsPanel.expectTagInPanel(tag1);
      await tagsPanel.expectTagInPanel(tag2);
    });

    await test.step("Rename first tag with 'don't show again' checkbox", async () => {
      await tagsPanel.editTagWithoutConfirm(tag1, tag1Renamed);
      await tagsPanel.expectTagInPanel(tag1Renamed);
      await tagsPanel.expectTagNotInPanel(tag1);
    });

    await test.step("Rename second tag - confirmation dialog should not appear", async () => {
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
        const tagName = `ScrollTag${i}`;
        await tagsPanel.addTag(tagName);
        await tagsPanel.expectTagDropdownItemVisible(tagName);
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

    await test.step("Type same name - create button hidden, matching item visible", async () => {
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

  test("Open inline tags panel by hovering over the Tags column area", async ({
    page,
  }) => {
    const tagName = "HoverTag";
    const tagsPanel = new InlineTagsPanel(page);

    await test.step("Hover over Tags column area and open panel", async () => {
      await myRooms.roomsTable.openInlineTagsPanelByHover(roomName);
      await tagsPanel.waitForPanel();
    });

    await test.step("Add tag and verify it appears in panel", async () => {
      await tagsPanel.addTag(tagName);
      await tagsPanel.expectTagInPanel(tagName);
    });
  });

  test("Added tag appears in Tags column of the rooms table", async ({
    page,
  }) => {
    const tagName = "ColumnTag";
    const tagsPanel = new InlineTagsPanel(page);

    await test.step("Add tag via inline panel", async () => {
      await myRooms.roomsTable.openInlineTagsPanel(roomName);
      await tagsPanel.waitForPanel();
      await tagsPanel.addTag(tagName);
      await tagsPanel.closePanel();
    });

    await test.step("Tag is visible in the Tags column of the room row", async () => {
      await myRooms.roomsTable.expectTagInRow(roomName, tagName);
    });

    await test.step("Deleted tag disappears from the Tags column", async () => {
      await myRooms.roomsTable.openInlineTagsPanel(roomName);
      await tagsPanel.waitForPanel();
      await tagsPanel.deleteTag(tagName);
      await tagsPanel.closePanel();
      await myRooms.roomsTable.expectTagNotInRow(roomName, tagName);
    });
  });

  test("Inline tags panel closes when clicking outside", async ({ page }) => {
    const tagsPanel = new InlineTagsPanel(page);

    await test.step("Open inline tags panel", async () => {
      await myRooms.roomsTable.openInlineTagsPanel(roomName);
      await tagsPanel.waitForPanel();
    });

    await test.step("Click outside - panel should close", async () => {
      await tagsPanel.closePanelByClickingOutside();
    });
  });

  test("Add tag by selecting from dropdown suggestions", async ({
    page,
    apiSdk,
  }) => {
    const tagName = "SharedTag";
    const secondRoom = "Inline Tag Room 2";
    const tagsPanel = new InlineTagsPanel(page);

    await test.step("Add tag to first room", async () => {
      await myRooms.roomsTable.openInlineTagsPanel(roomName);
      await tagsPanel.waitForPanel();
      await tagsPanel.addTag(tagName);
      await tagsPanel.closePanel();
    });

    await test.step("Create second room", async () => {
      await apiSdk.rooms.createRoom("owner", {
        title: secondRoom,
        roomType: "EditingRoom",
      });
      await myRooms.roomsTable.checkRowExist(secondRoom);
    });

    await test.step("Open panel for second room and select tag from dropdown", async () => {
      await myRooms.roomsTable.openInlineTagsPanel(secondRoom);
      await tagsPanel.waitForPanel();
      await tagsPanel.typeTagName(tagName);
      await tagsPanel.expectTagDropdownItemVisible(tagName);
      await tagsPanel.selectTagFromDropdown(tagName);
      await tagsPanel.expectTagInPanel(tagName);
    });
  });
});
