import { Page, Locator, expect } from "@playwright/test";

export type TMenuItem = {
  type: "text" | "id" | "data-testid" | "class";
  value: string;
  exact?: boolean;
};

export abstract class BaseMenu {
  page: Page;
  menu: Locator;
  submenu: Locator;

  constructor(page: Page, menu: Locator, submenu: Locator) {
    this.page = page;
    this.menu = menu;
    this.submenu = submenu;
  }

  protected getMenuItem(
    menuRoot: Locator,
    selector: TMenuItem | string,
  ): Locator {
    let menuItem: Locator;
    if (typeof selector === "string") {
      menuItem = menuRoot.getByText(selector, { exact: true });
    } else {
      switch (selector.type) {
        case "text":
          menuItem = menuRoot.getByText(selector.value, {
            exact: selector.exact ?? true,
          });
          break;
        case "id":
          menuItem = menuRoot.locator(`#${selector.value}`);
          break;
        case "data-testid":
          menuItem = menuRoot.locator(`[data-testid="${selector.value}"]`);
          break;
        case "class":
          menuItem = menuRoot.locator(`.${selector.value}`);
          break;
        default:
          throw new Error(`Unsupported selector type: ${selector}`);
      }
    }
    return menuItem;
  }

  protected async scrollUntilVisible(item: Locator, container: Locator) {
    // Даем элементу шанс появиться самому
    if (await item.isVisible({ timeout: 2000 }).catch(() => false)) {
      return;
    }

    try {
      // Пробуем просто подождать
      await this.page.waitForTimeout(1000);

      // Если элемент все еще не виден, пробуем скроллить
      if (!(await item.isVisible({ timeout: 500 }).catch(() => false))) {
        // Пробуем скроллить с помощью клавиш
        for (let i = 0; i < 5; i++) {
          await this.page.keyboard.press("ArrowDown");
          await this.page.waitForTimeout(200);

          if (await item.isVisible({ timeout: 500 }).catch(() => false)) {
            return;
          }
        }
      }

      // Последняя попытка - кликнуть в центр экрана
      const viewport = this.page.viewportSize();
      if (viewport) {
        await this.page.mouse.click(viewport.width / 2, viewport.height / 2);
      }
    } catch (error) {
      console.warn("Error during scroll:", error);
      // Продолжаем выполнение, даже если что-то пошло не так
    }
  }

  async hoverOption(selector: TMenuItem | string, isSubmenu = false) {
    const root = isSubmenu ? this.submenu : this.menu;
    const item = this.getMenuItem(root, selector);
    await this.scrollUntilVisible(item, root);
    await item.hover();
  }

  async clickOption(selector: TMenuItem | string, isSubmenu = false) {
    const root = isSubmenu ? this.submenu : this.menu;
    const item = this.getMenuItem(root, selector);
    await this.scrollUntilVisible(item, root);
    await item.click();
  }

  async clickSubmenuOption(
    parentSelector: TMenuItem | string,
    childSelector: TMenuItem | string,
  ) {
    await this.hoverOption(parentSelector);
    const child = this.getMenuItem(this.submenu, childSelector);
    await this.scrollUntilVisible(child, this.submenu);
    await child.click();
  }

  async close() {
    await expect(async () => {
      await this.page.mouse.click(1, 1);
      await expect(this.menu).not.toBeVisible({
        timeout: 500,
      });
    }).toPass();
  }
  async checkMenuExists(timeout?: number) {
    await expect(this.menu).toBeVisible({
      timeout,
    });
  }
}
