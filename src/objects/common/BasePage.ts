import { expect, Locator, Page } from "@playwright/test";
import AppsSidebar from "./AppsSidebar";
import BaseArticle from "./BaseArticle";
import BaseToast from "./BaseToast";

const TARIFF_BAR_TEXT = "tariff_bar_text";
const USER_MENU_ACCOUNTS = "user-menu-accounts";
const USER_MENU_PROFILE = "user-menu-profile";
const USER_MENU_LIVE_CHAT = "user-menu-live-chat";
const TOGGLE_BUTTON = "toggle-button";
const TOGGLE_BUTTON_CONTAINER = "toggle-button-container";
// Third-party chat widget launcher (bottom-right corner), no data-testid.
const LIVE_CHAT_LAUNCHER = "iframe#launcher";
const LIVE_CHAT_WINDOW_FRAME = 'iframe[title="Messaging window"]';
const LIVE_CHAT_WINDOW_NAME = "Messaging window";
const HEADER_AI_CHAT_BUTTON = "#ai-chat-button";

export default class BasePage {
  protected page: Page;
  protected article: BaseArticle;
  protected toast: BaseToast;
  sidebar: AppsSidebar;

  constructor(page: Page) {
    this.page = page;
    this.article = new BaseArticle(page);
    this.toast = new BaseToast(page);
    this.sidebar = new AppsSidebar(page);
  }

  protected get optionsButton(): Locator {
    return this.page.getByTestId("profile_user_icon_button");
  }

  protected get settingsMenuItem(): Locator {
    return this.page.getByTestId("user-menu-settings");
  }

  protected get paymentsMenuItem(): Locator {
    return this.page.getByTestId("user-menu-payments");
  }

  protected get profileMenuItem(): Locator {
    return this.page.getByTestId(USER_MENU_PROFILE);
  }

  protected get accountsMenuItem(): Locator {
    return this.page.getByTestId(USER_MENU_ACCOUNTS);
  }

  async checkAccountsMenuItemVisible() {
    await this.optionsButton.waitFor({ state: "visible", timeout: 10000 });
    await this.optionsButton.click();
    await expect(this.accountsMenuItem).toBeVisible();
    await this.page.keyboard.press("Escape");
  }

  async checkAccountsMenuItemNotVisible() {
    await this.optionsButton.waitFor({ state: "visible", timeout: 10000 });
    await this.optionsButton.click();
    await expect(this.profileMenuItem).toBeVisible();
    await expect(this.accountsMenuItem).not.toBeVisible();
    await this.page.keyboard.press("Escape");
  }

  protected get liveChatMenuItem(): Locator {
    return this.page.getByTestId(USER_MENU_LIVE_CHAT);
  }

  // The toggle state lives in aria-checked on the container; the inner
  // input is hidden.
  protected get liveChatToggle(): Locator {
    return this.liveChatMenuItem.getByTestId(TOGGLE_BUTTON);
  }

  async openUserMenu() {
    if (await this.liveChatMenuItem.isVisible()) {
      return;
    }
    await this.optionsButton.waitFor({ state: "visible", timeout: 10000 });
    await this.optionsButton.click();
    await expect(this.profileMenuItem).toBeVisible();
  }

  async closeUserMenu() {
    await this.page.keyboard.press("Escape");
    await expect(this.profileMenuItem).not.toBeVisible();
  }

  async expectLiveChatEnabled(enabled: boolean) {
    await this.openUserMenu();
    await expect(this.liveChatMenuItem).toBeVisible();
    await expect(this.liveChatToggle).toHaveAttribute(
      "aria-checked",
      String(enabled),
    );
  }

  async setLiveChatEnabled(enabled: boolean) {
    await this.openUserMenu();
    await this.liveChatToggle.getByTestId(TOGGLE_BUTTON_CONTAINER).click();
    await this.expectLiveChatEnabled(enabled);
  }

  async expectLiveChatWidgetVisible(visible: boolean) {
    const launcher = this.page.locator(LIVE_CHAT_LAUNCHER);
    if (visible) {
      // Widget script loads from a third-party CDN - give it extra time.
      await expect(launcher).toBeVisible({ timeout: 30000 });
    } else {
      await expect(launcher).not.toBeVisible();
    }
  }

  // The launcher iframe wraps a single button - clicking the frame center hits it.
  async openLiveChatWindow() {
    await this.page.locator(LIVE_CHAT_LAUNCHER).click();
  }

  async expectLiveChatWindowOpened(title: string) {
    const chatWindow = this.page
      .frameLocator(LIVE_CHAT_WINDOW_FRAME)
      .getByRole("dialog", { name: LIVE_CHAT_WINDOW_NAME });
    await expect(chatWindow).toBeVisible({ timeout: 15000 });
    await expect(chatWindow.getByRole("heading", { name: title })).toBeVisible();
  }

  async removeToast(message?: string, timeout?: number) {
    await this.toast.removeToast(message, timeout);
  }

  async dismissToastSafely(message: string, timeout?: number) {
    await this.toast.dismissToastSafely(message, timeout);
  }

  async checkToastMessage(message: string, timeout?: number) {
    await this.toast.checkToastMessage(message, timeout);
  }

  async removeAllToast() {
    await this.toast.removeAllToast();
  }

  async clickToastLink(linkText?: string, timeout?: number) {
    await this.toast.clickLinkInToast(linkText, timeout);
  }

  async navigateToSettings() {
    await this.optionsButton.waitFor({ state: "visible", timeout: 10000 });
    await this.optionsButton.click();
    await this.page.waitForLoadState("load");
    await this.settingsMenuItem.click();
  }

  async dismissWelcomeTour(timeout = 3000) {
    const maybeLaterButton = this.page.getByRole("button", {
      name: "Maybe later",
    });
    try {
      await maybeLaterButton.waitFor({ state: "visible", timeout });
      await maybeLaterButton.click();
      await maybeLaterButton.waitFor({ state: "hidden", timeout: 5000 });
    } catch {
      // Tour not shown - nothing to dismiss
    }

    const welcomeDialog = this.page.locator(
      '[class*="WelcomeDialog-module__dialog"]',
    );
    try {
      await welcomeDialog.waitFor({ state: "visible", timeout });
      // Dialog closes on mousedown outside its bounds - no close button testid available
      await this.page.mouse.click(1, 1);
      await welcomeDialog.waitFor({ state: "hidden", timeout: 5000 });
    } catch {
      // Welcome dialog not shown - nothing to dismiss
    }
  }

  /** Top-level rail item: an app in the main rail, a section in settings. */
  async navigateToArticle(title: string) {
    await this.sidebar.navigate(title);
  }

  /** Sub-item of an app — scoped, since labels repeat across apps. */
  async navigateToSubItem(app: string, item: string) {
    await this.sidebar.openSubItem(app, item);
  }

  async checkTryBusinessBarVisible() {
    await expect(this.page.getByTestId(TARIFF_BAR_TEXT)).toBeVisible();
  }

  // Section header "AI Chat" button (Files/Rooms/Forms). Deliberately absent
  // on AI Agents, where the chat is the section itself.
  protected get headerAiChatButton(): Locator {
    return this.page.locator(HEADER_AI_CHAT_BUTTON);
  }

  async checkAiChatButtonVisible() {
    await expect(this.headerAiChatButton).toBeVisible();
  }

  async checkAiChatButtonNotExist() {
    await expect(this.headerAiChatButton).toHaveCount(0);
  }

  async openAiChat() {
    await this.headerAiChatButton.click();
  }

  async waitForDownload(action: () => Promise<void>) {
    const [download] = await Promise.all([
      this.page.waitForEvent("download", { timeout: 30000 }),
      action(),
    ]);

    return download;
  }
}
