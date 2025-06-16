import { expect, Page } from "@playwright/test";

class Screenshot {
  page: Page;
  typePage: string;
  typeEntity: string;

  constructor(page: Page, typePage: string, typeEntity: string) {
    this.page = page;
    this.typePage = typePage;
    this.typeEntity = typeEntity;
  }

  async expectHaveScreenshot(subname: string, safe: boolean = true) {
    if (safe) {
      await this.page.mouse.move(0, 0);
      await this.page.waitForTimeout(100);
    }

    await expect(this.page).toHaveScreenshot([
      "client",
      this.typeEntity,
      `${this.typePage}_${subname}.png`,
    ]);
  }
}

export default Screenshot;
