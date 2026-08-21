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
  ai: '[data-testid="selector-item-0"]',
  documents: '[data-testid="selector-item-1"]',
  rooms: '[data-testid="selector-item-2"]',
  forms: '[data-testid="selector-item-3"]',
  // Recent / Favorites are nested one level under "Files" in this panel.
  recent: '[data-testid="selector-item-0"]',
  favorite: '[data-testid="selector-item-1"]',
};

// Used to confirm the panel re-rendered after navigation before clicking the
// next item at the same testid (the ids are reused per nesting level).
const FOLDER_LABELS: Record<FolderType, string> = {
  ai: "AI agents",
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
    await expect(this.page.getByLabel("Select")).toBeVisible();
    await this.page.getByLabel("Select").click();
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

    const expectedOptions: Array<{ type: FolderType; text: string }> = [
      { type: "ai", text: "AI agents" },
      { type: "documents", text: "Files" },
      { type: "rooms", text: "Rooms" },
      { type: "forms", text: "Forms" },
    ];
    for (const option of expectedOptions) {
      const selector = FOLDER_SELECTORS[option.type];
      const optionElement = this.selector.locator(selector);
      await expect(optionElement).toBeVisible();
      await expect(optionElement).toContainText(option.text);
    }
  }
}
export default RoomSelectPanel;
