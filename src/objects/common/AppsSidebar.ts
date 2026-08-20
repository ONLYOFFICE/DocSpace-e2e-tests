import { expect, Locator, Page } from "@playwright/test";

const ARTICLE_CONTAINER = "#article-container";
const NAV = `${ARTICLE_CONTAINER} nav`;
const ITEM_LIST = 'ul[class*="itemList"]';
const ITEM_BUTTON =
  '> [class*="itemWrapper"] > [class*="NavMenu-module__item--"]';
const ITEM_TEXT = 'span[class*="NavMenu-module__itemText"]';
const SUB_ITEM_LIST = '[class*="subItemsInner"] > li';
const SUB_ITEM_BUTTON = '[class*="NavMenu-module__subItem--"]';
const SUB_ITEM_TEXT = 'span[class*="NavMenu-module__subItemText"]';
const ACTIVE_CLASS = /NavMenu-module__active/;
const BACK_BUTTON = `${ARTICLE_CONTAINER} [class*="articleHeader"]`;
const DEV_TOOLS_BAR = "dev-tools-bar";
const BADGE = "badge";

const exactText = (value: string) =>
  new RegExp(`^${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`);

/** Key for `AppsSidebar.legacySelectors`: "Files" or "Files/Trash". */
const legacyKey = (name: string, subItem?: string) =>
  subItem ? `${name}/${subItem}` : name;

class AppsSidebar {
  protected page: Page;

  // Pre-redesign rail items had stable ids (#document_catalog-*). Prod still
  // runs the old UI, so the prod daily check fills this map and the same page
  // objects drive both UIs. Empty (default) = new UI.
  static legacySelectors: Record<string, string> = {};

  constructor(page: Page) {
    this.page = page;
  }

  private legacyItem(name: string, subItem?: string): Locator | null {
    const selector = AppsSidebar.legacySelectors[legacyKey(name, subItem)];
    return selector ? this.page.locator(selector) : null;
  }

  private async clickLegacyItem(item: Locator) {
    await expect(item).toBeVisible();
    await item.click();
    await this.page.waitForLoadState("load");
  }

  get container(): Locator {
    return this.page.locator(ARTICLE_CONTAINER);
  }

  private get nav(): Locator {
    return this.page.locator(NAV);
  }

  /** All top-level nav buttons — apps in the main rail, sections in settings. */
  get items(): Locator {
    return this.nav.locator(`${ITEM_LIST} > li`).locator(ITEM_BUTTON);
  }

  /** Top-level <li> of an app (or of a flat settings section). */
  itemRow(name: string): Locator {
    return this.nav
      .locator(`${ITEM_LIST} > li`)
      .filter({
        has: this.page.locator(ITEM_TEXT).filter({ hasText: exactText(name) }),
      })
      .first();
  }

  itemButton(name: string): Locator {
    return this.itemRow(name).locator(ITEM_BUTTON);
  }

  subItemRow(app: string, item: string): Locator {
    return this.itemRow(app)
      .locator(SUB_ITEM_LIST)
      .filter({
        has: this.page
          .locator(SUB_ITEM_TEXT)
          .filter({ hasText: exactText(item) }),
      })
      .first();
  }

  subItemButton(app: string, item: string): Locator {
    return this.subItemRow(app, item).locator(SUB_ITEM_BUTTON);
  }

  /** Unread-files badge on an app row (e.g. Files). */
  itemBadge(app: string): Locator {
    return this.itemRow(app)
      .locator('> [class*="itemWrapper"]')
      .getByTestId(BADGE);
  }

  /** Unread-files badge on a sub-item row (e.g. Files > Shared with me). */
  subItemBadge(app: string, item: string): Locator {
    return this.subItemRow(app, item).getByTestId(BADGE);
  }

  /**
   * Clicks a top-level item. Works for apps in the main rail and for the flat
   * portal-settings rail.
   */
  async navigate(name: string) {
    const legacy = this.legacyItem(name);
    if (legacy) {
      await this.clickLegacyItem(legacy);
      return;
    }

    const button = this.itemButton(name);
    await expect(button).toBeVisible();
    await button.click();
    await this.page.waitForLoadState("load");
  }

  /** Expands an app without leaving the current page, when possible. */
  async expandApp(app: string) {
    const button = this.itemButton(app);
    await expect(button).toBeVisible();

    if ((await button.getAttribute("aria-expanded")) === "true") {
      return;
    }

    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
  }

  /**
   * Opens a sub-item scoped to its app — required because Recent / Favorites /
   * Trash exist under Files, Rooms, Forms and AI agents at the same time.
   */
  async openSubItem(app: string, item: string) {
    const legacy = this.legacyItem(app, item);
    if (legacy) {
      await this.clickLegacyItem(legacy);
      return;
    }

    await this.expandApp(app);
    const button = this.subItemButton(app, item);
    await expect(button).toBeVisible();
    await button.click();
    await this.page.waitForLoadState("load");
  }

  async checkItemActive(name: string) {
    await expect(this.itemButton(name)).toHaveClass(ACTIVE_CLASS);
  }

  async checkSubItemActive(app: string, item: string) {
    await expect(this.subItemButton(app, item)).toHaveClass(ACTIVE_CLASS);
  }

  async checkItemNotExist(name: string) {
    await expect(this.itemRow(name)).toBeHidden();
  }

  async openDevTools() {
    const bar = this.page.getByTestId(DEV_TOOLS_BAR);
    await expect(bar).toBeVisible();
    await bar.click();
  }

  /** "Back" button at the top of the portal-settings rail. */
  async goBack() {
    const button = this.page.locator(BACK_BUTTON).getByText("Back");
    await expect(button).toBeVisible();
    await button.click();
    await this.page.waitForLoadState("load");
  }
}

export default AppsSidebar;
