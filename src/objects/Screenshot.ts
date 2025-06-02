import { expect, Page } from "@playwright/test";

class Screenshot {
  page: Page;
  typePage: string; // TODO union litteral type
  typeEntity: string; // TODO union litteral type

  constructor(page: Page, typePage: string, typeEntity: string) {
    this.page = page;
    this.typePage = typePage;
    this.typeEntity = typeEntity;
  }

  async expectHaveScreenshot(subname: string) {
    await expect(this.page).toHaveScreenshot([
      "client",
      this.typeEntity,
      `${this.typePage}_${subname}.png`,
    ]);
  }
}

export default Screenshot;
