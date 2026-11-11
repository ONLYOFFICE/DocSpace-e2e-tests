import { expect, Page } from "@playwright/test";
import BaseSelector from "../common/BaseSelector";

type FolderType =
  | "ai"
  | "documents"
  | "rooms"
  | "forms"
  | "favorite"
  | "recent";

// Top-level entries in the "Select" panel.
const FOLDER_SELECTORS: Record<FolderType, string> = {
  documents: '[data-testid="selector-item-0"]',
  rooms: '[data-testid="selector-item-1"]',
  forms: '[data-testid="selector-item-2"]',
  ai: '[data-testid="selector-item-3"]',
  // Recent / Favorites are nested one level under "Files" in this panel.
  recent: '[data-testid="selector-item-0"]',
  favorite: '[data-testid="selector-item-1"]',
};

// Used to confirm the panel re-rendered after navigation before clicking the
// next item at the same testid (the ids are reused per nesting level).
const FOLDER_LABELS: Record<FolderType, string> = {
  ai: "AI Workspace",
  documents: "Files",
  rooms: "Rooms",
  forms: "Forms",
  recent: "Recent",
  favorite: "Favorite files",
};

class RoomSelectPanel extends BaseSelector {
  constructor(page: Page) {
    super(page);
  }

  async selectFile(fileName: string) {
    await this.selector.getByText(fileName).click();
    await this.confirmSelection();
  }

  async confirmSelection() {
    await this.submitSelection();
  }

  async select(type: FolderType) {
    if (type === "recent" || type === "favorite") {
      await this.select("documents");
    }
    const selector = FOLDER_SELECTORS[type];
    const element = this.selector.locator(selector);
    // Waits until the item at this testid actually shows the expected
    // label, not just any element from a previous (pre-navigation) render.
    await expect(element).toContainText(FOLDER_LABELS[type]);
    await element.click();
  }

  async verifyAllFolderOptions() {
    await this.selector.waitFor({ state: "visible" });

    const topLevel: FolderType[] = ["documents", "rooms", "forms", "ai"];
    for (const type of topLevel) {
      const optionElement = this.selector.locator(FOLDER_SELECTORS[type]);
      await expect(optionElement).toBeVisible();
      await expect(optionElement).toContainText(FOLDER_LABELS[type]);
    }
  }
}
export default RoomSelectPanel;
