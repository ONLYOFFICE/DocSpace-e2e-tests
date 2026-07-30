import { expect, Locator, Page } from "@playwright/test";

const TILE = 'button[class*="QuickActions-module__tile"]';

class QuickActions {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
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
}

export default QuickActions;
