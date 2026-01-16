import { expect, Page } from "@playwright/test";
import BaseSelector from "../common/BaseSelector";

type FolderType = 'ai' | 'documents' | 'rooms' | 'favorite' | 'recent';
const FOLDER_SELECTORS: Record<FolderType, string> = {
  "ai": '[data-testid="selector-item-0"]',
  "documents": '[data-testid="selector-item-1"]',
  "rooms": '[data-testid="selector-item-2"]',
  "favorite": '[data-testid="selector-item-3"]',
  "recent": '[data-testid="selector-item-4"]'
} as const;

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
    await this.page.getByLabel('Select').click();
  }
  
  async select(type: FolderType) {
    const selector = FOLDER_SELECTORS[type];
    const element = this.selector.locator(selector);
    await expect(element).toBeVisible();
    await element.click();
  }
  
  async verifyAllFolderOptions() {
    await this.selector.waitFor({ state: 'visible' });
  
    const expectedOptions: Array<{ type: FolderType; text: string }> = [
      { type: 'ai', text: 'AI' },
      { type: 'documents', text: 'My documents' },
      { type: 'rooms', text: 'Rooms' },
      { type: 'recent', text: 'Recent' },
      { type: 'favorite', text: 'Favorite' }
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