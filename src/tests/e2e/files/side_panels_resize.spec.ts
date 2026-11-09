import { test } from "@/src/fixtures";
import Files from "@/src/objects/files/Files";
import { toastMessages } from "@/src/utils/constants/profile";
import {
  apps,
  filesSubItems,
  roomsSubItems,
} from "@/src/utils/constants/navigation";
import { expect } from "@playwright/test";

const RESIZE_DELTA = -200;
// Min/max width limits may clip the drag, so require only part of it.
const MIN_WIDTH_GAIN = 100;
const NARROW_DELTA = 100;
// Far beyond any sane limit - resizeBy clamps the drag to the window edge.
const DRAG_TO_RIGHT_EDGE = 2000;
const DRAG_TO_LEFT_EDGE = -2000;
// Lower bound for the panel's min width - the exact value is not specified.
const MIN_PANEL_WIDTH_FLOOR = 200;
// At max width the sidebar and part of the section must stay uncovered.
const MIN_LEFT_GAP = 300;

test.describe("Files: side panels resize", () => {
  let files: Files;

  test.beforeEach(async ({ page, api, login }) => {
    files = new Files(page, api.portalDomain);
    await login.loginToPortal();
    await files.open();
  });

  // Width is stored in the browser, not per user, so it survives logout.
  test("Info panel width persists across reopen, sections, reload and re-login", async ({
    login,
  }) => {
    let expectedWidth: number;

    await test.step("Open info panel and widen it", async () => {
      await files.infoPanel.open();
      const initialWidth = (await files.infoPanel.getBounds()).width;
      await files.infoPanel.resizeBy(RESIZE_DELTA);
      expectedWidth = (await files.infoPanel.getBounds()).width;
      expect(expectedWidth).toBeGreaterThan(initialWidth + MIN_WIDTH_GAIN);
    });

    await test.step("Close and reopen info panel", async () => {
      await files.infoPanel.close();
      await files.infoPanel.open();
      await files.infoPanel.expectWidth(expectedWidth);
    });

    await test.step("Files > Recent files keeps the width", async () => {
      await files.navigateToSubItem(apps.files, filesSubItems.recent);
      await files.infoPanel.open();
      await files.infoPanel.expectWidth(expectedWidth);
    });

    await test.step("Files > Trash keeps the width", async () => {
      await files.navigateToSubItem(apps.files, filesSubItems.trash);
      await files.infoPanel.open();
      await files.infoPanel.expectWidth(expectedWidth);
    });

    await test.step("Rooms keeps the width", async () => {
      await files.navigateToArticle(apps.rooms);
      await files.infoPanel.open();
      await files.infoPanel.expectWidth(expectedWidth);
    });

    await test.step("Rooms > Archive keeps the width", async () => {
      await files.navigateToSubItem(apps.rooms, roomsSubItems.archive);
      await files.infoPanel.open();
      await files.infoPanel.expectWidth(expectedWidth);
    });

    await test.step("Back in Files the width is the same", async () => {
      await files.navigateToArticle(apps.files);
      await files.infoPanel.open();
      await files.infoPanel.expectWidth(expectedWidth);
    });

    // Narrowing happens after widening, so it is not blocked by the min width.
    await test.step("Narrow info panel back a bit", async () => {
      const widenedWidth = expectedWidth;
      await files.infoPanel.resizeBy(NARROW_DELTA);
      expectedWidth = (await files.infoPanel.getBounds()).width;
      expect(expectedWidth).toBeLessThan(widenedWidth - NARROW_DELTA / 2);
    });

    await test.step("Narrowed width is kept after page reload", async () => {
      await files.open();
      await files.infoPanel.open();
      await files.infoPanel.expectWidth(expectedWidth);
    });

    await test.step("Width is kept after logout and login", async () => {
      await login.logout();
      await login.loginToPortal();
      await files.open();
      await files.infoPanel.open();
      await files.infoPanel.expectWidth(expectedWidth);
    });
  });

  test("Info panel width is limited by min and max", async () => {
    let initialWidth: number;
    let minWidth: number;
    let maxWidth: number;

    await test.step("Open info panel", async () => {
      await files.infoPanel.open();
      initialWidth = (await files.infoPanel.getBounds()).width;
    });

    await test.step("Drag the edge to the right window border", async () => {
      await files.infoPanel.resizeBy(DRAG_TO_RIGHT_EDGE);
      await files.infoPanel.checkInfoPanelExist();
      minWidth = (await files.infoPanel.getBounds()).width;
      test.info().annotations.push({
        type: "Info panel min width",
        description: String(minWidth),
      });
      expect(minWidth).toBeLessThanOrEqual(initialWidth);
      expect(minWidth).toBeGreaterThanOrEqual(MIN_PANEL_WIDTH_FLOOR);
    });

    await test.step("Dragging further does not shrink it", async () => {
      await files.infoPanel.resizeBy(DRAG_TO_RIGHT_EDGE);
      await files.infoPanel.expectWidth(minWidth);
    });

    await test.step("Drag the edge to the left window border", async () => {
      await files.infoPanel.resizeBy(DRAG_TO_LEFT_EDGE);
      const bounds = await files.infoPanel.getBounds();
      maxWidth = bounds.width;
      test.info().annotations.push({
        type: "Info panel max width",
        description: String(maxWidth),
      });
      expect(bounds.x).toBeGreaterThan(MIN_LEFT_GAP);
    });

    await test.step("Dragging further does not widen it", async () => {
      await files.infoPanel.resizeBy(DRAG_TO_LEFT_EDGE);
      await files.infoPanel.expectWidth(maxWidth);
    });
  });

  // Kept separate: the Zendesk widget loads from a third-party CDN, so its
  // flakiness should not fail the core width checks.
  test("Live chat button follows the info panel edge", async () => {
    await test.step("Enable Live chat", async () => {
      await files.setLiveChatEnabled(true);
      await files.dismissToastSafely(toastMessages.liveChatConnected);
      await files.closeUserMenu();
      await files.expectLiveChatWidgetVisible(true);
    });

    await test.step("Open info panel, Live chat button is left of it", async () => {
      await files.infoPanel.open();
      const bounds = await files.infoPanel.getBounds();
      await files.expectLiveChatLauncherLeftOf(bounds.x);
    });

    await test.step("Widen info panel - Live chat button moves with its edge", async () => {
      const initialWidth = (await files.infoPanel.getBounds()).width;
      await files.infoPanel.resizeBy(RESIZE_DELTA);
      const bounds = await files.infoPanel.getBounds();
      expect(bounds.width).toBeGreaterThan(initialWidth + MIN_WIDTH_GAIN);
      await files.expectLiveChatLauncherLeftOf(bounds.x);
    });

    await test.step("After page reload the button is still left of the panel", async () => {
      await files.open();
      await files.infoPanel.open();
      await files.expectLiveChatWidgetVisible(true);
      const bounds = await files.infoPanel.getBounds();
      await files.expectLiveChatLauncherLeftOf(bounds.x);
    });
  });

  // Info panel and AI chat share the same slot - opening one closes the
  // other, but each keeps its own width. They are resized by different
  // deltas so the two widths can't match by accident.
  test("AI chat resizes independently of the info panel and width persists", async () => {
    let infoPanelWidth: number;
    let chatLeftEdge: number;

    await test.step("Open info panel and widen it", async () => {
      await files.infoPanel.open();
      const initialWidth = (await files.infoPanel.getBounds()).width;
      await files.infoPanel.resizeBy(RESIZE_DELTA);
      infoPanelWidth = (await files.infoPanel.getBounds()).width;
      expect(infoPanelWidth).toBeGreaterThan(initialWidth + MIN_WIDTH_GAIN);
    });

    await test.step("Open AI chat - info panel closes", async () => {
      await files.ensureAiChatPanelOpened();
      await files.infoPanel.checkInfoPanelNotExist();
    });

    await test.step("Widen AI chat by a different delta", async () => {
      const initialLeftEdge = await files.getAiChatPanelLeftEdge();
      await files.resizeAiChatPanelBy(RESIZE_DELTA / 2);
      chatLeftEdge = await files.getAiChatPanelLeftEdge();
      expect(chatLeftEdge).toBeLessThan(initialLeftEdge + RESIZE_DELTA / 4);
    });

    await test.step("AI chat width is kept after page reload", async () => {
      await files.open();
      await files.ensureAiChatPanelOpened();
      await files.expectAiChatPanelLeftEdge(chatLeftEdge);
    });

    await test.step("Open info panel - AI chat closes, panel width is its own", async () => {
      await files.infoPanel.open();
      await files.checkAiChatPanelClosed();
      await files.infoPanel.expectWidth(infoPanelWidth);
    });

    await test.step("Open AI chat again - its width is its own", async () => {
      await files.ensureAiChatPanelOpened();
      await files.infoPanel.checkInfoPanelNotExist();
      await files.expectAiChatPanelLeftEdge(chatLeftEdge);
    });
  });
});
