import { expect, Locator, Page } from "@playwright/test";

const TILE = 'button[class*="QuickActions-module__tile"]';
const CONTAINER = "quick-actions";
const CLOSE_BUTTON = "quick-actions-close";

class QuickActions {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get container(): Locator {
    return this.page.getByTestId(CONTAINER);
  }

  get closeButton(): Locator {
    return this.page.getByTestId(CLOSE_BUTTON);
  }

  get tiles(): Locator {
    return this.page.locator(TILE);
  }

  tile(name: string): Locator {
    return this.page
      .locator(TILE)
      .and(this.page.getByLabel(name, { exact: true }));
  }

  async click(name: string) {
    const tile = this.tile(name);
    await expect(tile).toBeVisible();
    await tile.click();
  }

  async checkTileExist(name: string) {
    await expect(this.tile(name)).toBeVisible();
  }

  async checkPanelVisible() {
    await expect(this.container).toBeVisible();
  }

  async checkPanelHidden() {
    await expect(this.container).not.toBeVisible();
  }

  /** Hides the panel via the close control that only appears on hover. */
  async hidePanel() {
    await this.container.hover();
    await this.closeButton.click();
  }
}

export default QuickActions;
