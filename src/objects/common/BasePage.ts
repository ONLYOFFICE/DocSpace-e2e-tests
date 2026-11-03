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
const LIVE_CHAT_NAME_LABEL = "Name";
const LIVE_CHAT_SEND_BUTTON = "Send";
const HEADER_AI_CHAT_BUTTON = "#ai-chat-button";
const CHAT_PANEL_RESIZER = "chat-panel-resizer";

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

  // The app shifts the launcher so it never overlaps a side panel - its right
  // edge must stay left of the given x (e.g. the info panel's left edge).
  async expectLiveChatLauncherLeftOf(x: number) {
    const launcher = this.page.locator(LIVE_CHAT_LAUNCHER);
    await expect
      .poll(async () => {
        const box = await launcher.boundingBox();
        return box ? box.x + box.width : Number.POSITIVE_INFINITY;
      })
      .toBeLessThanOrEqual(x);
  }

  // The launcher iframe wraps a single button - clicking the frame center hits it.
  async openLiveChatWindow() {
    await this.page.locator(LIVE_CHAT_LAUNCHER).click();
  }

  protected get liveChatWindow(): Locator {
    return this.page
      .frameLocator(LIVE_CHAT_WINDOW_FRAME)
      .getByRole("dialog", { name: LIVE_CHAT_WINDOW_NAME });
  }

  async expectLiveChatWindowOpened(title: string) {
    await expect(this.liveChatWindow).toBeVisible({ timeout: 15000 });
    await expect(
      this.liveChatWindow.getByRole("heading", { name: title }),
    ).toBeVisible();
  }

  // Greeting comes from the live Zendesk backend, so it proves the chat is
  // connected, not just rendered.
  async expectLiveChatGreeting(greeting: string) {
    await expect(
      this.liveChatWindow.getByRole("log").getByText(greeting),
    ).toBeVisible({ timeout: 15000 });
  }

  // Fills the name form but does not submit it - submitting would open a
  // real conversation in the support queue.
  async fillLiveChatName(name: string) {
    const nameInput = this.liveChatWindow.getByRole("textbox", {
      name: LIVE_CHAT_NAME_LABEL,
    });
    await nameInput.fill(name);
    await expect(nameInput).toHaveValue(name);
    await expect(
      this.liveChatWindow.getByRole("button", { name: LIVE_CHAT_SEND_BUTTON }),
    ).toBeEnabled();
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

  // The resizer sits on the chat panel's left edge, so its x is the panel's
  // left edge - no need for a separate panel container locator.
  protected get chatPanelResizer(): Locator {
    return this.page.getByTestId(CHAT_PANEL_RESIZER);
  }

  // The header button toggles the panel, so click only if it is closed.
  async ensureAiChatPanelOpened() {
    if (!(await this.chatPanelResizer.isVisible())) {
      await this.openAiChat();
    }
    await expect(this.chatPanelResizer).toBeVisible();
  }

  async checkAiChatPanelClosed() {
    await expect(this.chatPanelResizer).not.toBeVisible();
  }

  async getAiChatPanelLeftEdge(): Promise<number> {
    await expect(this.chatPanelResizer).toBeVisible();
    const box = await this.chatPanelResizer.boundingBox();
    if (!box) throw new Error("AI chat panel resizer is not visible");
    return box.x;
  }

  // Negative deltaX widens the chat panel, positive narrows it.
  async resizeAiChatPanelBy(deltaX: number) {
    await expect(this.chatPanelResizer).toBeVisible();
    const box = await this.chatPanelResizer.boundingBox();
    if (!box) throw new Error("AI chat panel resizer is not visible");
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await this.page.mouse.move(x, y);
    await this.page.mouse.down();
    await this.page.mouse.move(x + deltaX, y, { steps: 10 });
    await this.page.mouse.up();
  }

  // Width is restored from saved state, allow 1px for sub-pixel rounding.
  async expectAiChatPanelLeftEdge(expected: number) {
    await expect
      .poll(async () =>
        Math.abs((await this.getAiChatPanelLeftEdge()) - expected),
      )
      .toBeLessThanOrEqual(1);
  }

  async waitForDownload(action: () => Promise<void>) {
    const [download] = await Promise.all([
      this.page.waitForEvent("download", { timeout: 30000 }),
      action(),
    ]);

    return download;
  }
}
