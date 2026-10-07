import { getPortalUrl } from "../../../config";
import BasePage from "../common/BasePage";
import { BaseContextMenu } from "../common/BaseContextMenu";
import type { TMenuItem } from "../common/BaseMenu";
import BaseInviteDialog from "../common/BaseInviteDialog";
import BaseNavigation from "../common/BaseNavigation";
import FilesTable from "../files/FilesTable";
import BaseSelector from "../common/BaseSelector";
import { apps, aiAgentsSubItems, TApp } from "@/src/utils/constants/navigation";
import {
  aiSectionEmptyView,
  aiAgentViewerChatEmptyView,
  aiAgentViewerModeToastMessage,
  aiAgentToastMessages,
  aiDeletePromptDialog,
  aiDeletePromptFolderDialog,
  aiDeleteChatDialog,
  aiDefaultChatTitle,
  aiSaveAsDocxSections,
  aiChatNotActiveScreen,
  aiChatExportFormats,
  TAiChatExportFormat,
} from "@/src/utils/constants/ai";
import { setupClipboardPermissions } from "@/src/utils/helpers/linkTest";
import { expect, Page } from "@playwright/test";

const RADIX_MENU_CONTENT = "[data-radix-menu-content]";
const CHAT_AI_BENEFITS = "chat-ai-benefits";
const EFFORT_MENU_ITEM = "effort-menu-item";
const EFFORT_MENU_OPTION_PREFIX = "effort-menu-option-";
const PERMISSIONS_MENU_ITEM = "permissions-menu-item";
const PERMISSIONS_OPTIONS = [
  "Ask every time",
  "Auto approve",
  "Allow without asking",
] as const;
export type TPermissionsMode = (typeof PERMISSIONS_OPTIONS)[number];
const SUGGESTIONS = "suggestions";
const SUGGESTION_BUTTON = "suggestion-button";
const PROMPTS_BUTTON = "prompts-button";
const PROMPTS_MENU = "prompts-menu";
const PROMPTS_MENU_PROMPT = "prompts-menu-prompt";
const PROMPTS_MENU_PROMPT_SUBMENU_BUTTON = "prompts-menu-prompt-submenu-button";
const PROMPT_MENU_EDIT = "prompt-menu-edit";
const PROMPT_MENU_DELETE = "prompt-menu-delete";
const PROMPT_MENU_MOVE = "prompt-menu-move";
const PROMPT_MENU_MOVE_TO_ROOT = "prompt-menu-move-to-root";
const PROMPT_MENU_MOVE_TO_FOLDER = "prompt-menu-move-to-folder";
const PROMPTS_MENU_FOLDER = "prompts-menu-folder";
const PROMPTS_MENU_RENAME_FOLDER = "prompts-menu-rename-folder";
const PROMPTS_MENU_DELETE_FOLDER = "prompts-menu-delete-folder";
const EDIT_PROMPT_DIALOG_TITLE = "Edit AI Prompt";
const USER_MESSAGE_CONTENT = "user-message-content";
const USER_MESSAGE_MORE_BUTTON = "user-message-more-button";
const USER_MESSAGE_MENU = "user-message-menu";
const USER_MESSAGE_MENU_SAVE_PROMPT = "user-message-menu-save-prompt";
const USER_MESSAGE_MENU_SAVE_TO_FOLDER = "user-message-menu-save-to-folder";
const USER_MESSAGE_MENU_FOLDER = "user-message-menu-folder";
const USER_MESSAGE_MENU_NEW_FOLDER = "user-message-menu-new-folder";
const NEW_PROMPT_FOLDER_DIALOG_TITLE = "New AI Prompt folder";
const RENAME_PROMPT_FOLDER_DIALOG_TITLE = "Rename folder";
const USER_MESSAGE_COPY_BUTTON = "user-message-copy-button";
const USER_MESSAGE_COPIED_INDICATOR = "user-message-copied-indicator";
const ASSISTANT_MESSAGE = "assistant-message";
const ASSISTANT_MESSAGE_ACTIONS = "assistant-message-actions";
const ASSISTANT_MESSAGE_CONTENT = "assistant-message-content";
const ASSISTANT_MESSAGE_COPY_BUTTON = "assistant-message-copy-button";
const ASSISTANT_MESSAGE_COPIED_INDICATOR = "assistant-message-copied-indicator";
const ASSISTANT_MESSAGE_REGENERATE_BUTTON =
  "assistant-message-regenerate-button";
const ASSISTANT_MESSAGE_DOWNLOAD_BUTTON = "assistant-message-download-button";
const SELECTOR_ITEMS = '[data-testid^="selector-item-"]';
const NEW_CHAT_BUTTON = "new-chat-button";
const NEW_CHAT_BUTTON_LABEL = '[aria-label="New chat"]';
const CHAT_LIST = "chat-list";
const CHAT_LIST_COLUMN = '[class*="historyColumn"]';
const CHAT_LIST_EMPTY = "chat-list-empty";
const CHAT_LIST_SEARCH_INPUT = "chat-list-search-input";
const CHAT_ITEM = "chat-item";
const CHAT_ITEM_FALLBACK = "div.cursor-pointer";
const CHAT_ITEM_TITLE = "chat-item-title";
const CHAT_ITEM_RENAME_INPUT = "chat-item-rename-input";
const CHAT_ITEM_MENU_BUTTON = "chat-item-menu-button";
const CHAT_ITEM_MENU = "chat-item-menu";
const CHAT_ITEM_MENU_OPEN = "chat-item-menu-open";
const CHAT_ITEM_MENU_EXPORT = "chat-item-menu-export";
const CHAT_ITEM_MENU_EXPORT_FORMATS =
  '[role="menuitem"][data-testid^="chat-item-menu-export-"]';
const CHAT_ITEM_MENU_RENAME = "chat-item-menu-rename";
const CHAT_ITEM_MENU_DELETE = "chat-item-menu-delete";

export class AiAgents extends BasePage {
  private portalDomain: string;
  contextMenu: BaseContextMenu;
  inviteDialog: BaseInviteDialog;
  navigation: BaseNavigation;
  filesTable: FilesTable;
  saveAsDocxSelector: BaseSelector;

  constructor(page: Page, portalDomain: string) {
    super(page);
    this.portalDomain = portalDomain;
    this.contextMenu = new BaseContextMenu(page);
    this.inviteDialog = new BaseInviteDialog(page);
    this.navigation = new BaseNavigation(page, {});
    this.filesTable = new FilesTable(page);
    this.saveAsDocxSelector = new BaseSelector(page);
  }

  private get emptyProvidersHeading() {
    return this.page.getByText("AI provider is not available yet");
  }

  private get goToSettingsButton() {
    return this.page.locator("#go-to-ai-provider-settings");
  }

  private get aiNotActiveHeading() {
    return this.page.getByRole("heading", {
      name: /AI features aren.t active yet/,
    });
  }

  private get topUpAndActivateButton() {
    return this.page.locator("#top-up-and-activate-ai");
  }

  // The inline AI Chat panel opened from a section's quick actions (Forms,
  // etc.) shows its own not-active state, distinct from the full AI Agents
  // page's "AI features aren't active yet".
  private get quickChatNotActiveHeading() {
    return this.page.getByRole("heading", {
      name: /AI Chat isn.t active yet/,
    });
  }

  private get quickChatTopUpButton() {
    return this.page.getByRole("button", { name: "Top up & activate" });
  }

  async expectQuickChatNotActive() {
    await expect(this.quickChatNotActiveHeading).toBeVisible();
    await expect(this.quickChatTopUpButton).toBeVisible();
  }

  // Full not-active screen of the AI Chat panel, and no message composer.
  // A Full admin gets the OpenRouter pricing benefit and the Top up button;
  // a regular user only gets a "contact your Full admin" note.
  async expectQuickChatNotActiveScreen(viewer: "admin" | "user") {
    const { accessNote, pricingLinkText, pricingUrl } = aiChatNotActiveScreen;
    const { description, benefits } = aiChatNotActiveScreen[viewer];
    await expect(this.quickChatNotActiveHeading).toBeVisible();
    await expect(
      this.page.getByText(description, { exact: true }),
    ).toBeVisible();
    await expect(
      this.page.getByText(accessNote, { exact: true }),
    ).toBeVisible();

    const benefitsList = this.page.getByTestId(CHAT_AI_BENEFITS);
    for (const benefit of benefits) {
      await expect(benefitsList).toContainText(benefit);
    }
    await expect(benefitsList.getByRole("listitem")).toHaveCount(
      benefits.length,
    );

    const pricingLink = benefitsList.getByRole("link", {
      name: pricingLinkText,
    });
    if (viewer === "admin") {
      await expect(this.quickChatTopUpButton).toBeVisible();
      await expect(pricingLink).toHaveAttribute("href", pricingUrl);
    } else {
      await expect(this.quickChatTopUpButton).toHaveCount(0);
      await expect(pricingLink).toHaveCount(0);
    }
    await expect(this.chatComposerInput).toHaveCount(0);
  }

  private get agentNameInput() {
    return this.page.getByTestId("create_edit_agent_input");
  }

  private get modelCombobox() {
    return this.page.getByTestId("create_agent_profile_combobox");
  }

  private get instructionsTextarea() {
    return this.page.getByTestId("create_agent_instructions_textarea");
  }

  private get createAgentButton() {
    return this.page.getByTestId("create_agent_dialog_save");
  }

  private agentNameCell(name: string) {
    return this.page
      .locator('[data-testid^="rooms-cell-name-"]')
      .filter({ hasText: name });
  }

  // The message composer is the reliable "chat is loaded" marker: the old
  // chat-input-buttons wrapper is gone from the redesigned chat.
  private get chatComposerInput() {
    return this.page.getByTestId("composer-input");
  }

  async openDirectly() {
    await this.page.goto(`${getPortalUrl(this.portalDomain)}/ai-agents/filter`);
    await this.waitForAiAgentsPage();
  }

  async open() {
    await this.sidebar.navigate(apps.aiAgents);
    await this.waitForAiAgentsPage();
  }

  // Checks the sidebar item, not links to agents: an `a[href*="/ai-agents"]`
  // locator matches the agent rows in the list, so it used to pass for the wrong
  // reason whenever the user simply had no agents.
  async checkNotAvailable() {
    await this.sidebar.checkItemNotExist(apps.aiAgents);
  }

  async expectNoProvidersMessage() {
    await expect(this.emptyProvidersHeading).toBeVisible();
  }

  async goToSettings() {
    await this.goToSettingsButton.click();
  }

  // When AI features are not activated, the agents page shows a
  // "AI features aren't active yet" empty view with a "Top up & activate" CTA.
  async expectAiNotActive() {
    await expect(this.aiNotActiveHeading).toBeVisible();
    await expect(this.topUpAndActivateButton).toBeVisible();
  }

  private async waitForAiAgentsPage() {
    await expect(this.page).toHaveURL(/\/ai-agents/);
  }

  private get emptyView() {
    return this.page.getByTestId("empty-view");
  }

  async sendChatMessage(text: string) {
    const composer = this.page.getByTestId("composer-input");
    await composer.click();
    await composer.fill(text);
    await this.sendComposerMessage();
  }

  async sendComposerMessage() {
    await this.page.getByTestId("send-button").click();
  }

  async openRecentFromNavigation() {
    await this.sidebar.openSubItem(apps.aiAgents, aiAgentsSubItems.recent);
    await expect(this.page).toHaveURL(/\/ai-agents\/recent/);
  }

  async openFavoritesFromNavigation() {
    await this.sidebar.openSubItem(apps.aiAgents, aiAgentsSubItems.favorites);
    await expect(this.page).toHaveURL(/\/ai-agents\/favorites/);
  }

  async expectRecentSubItemActive() {
    await this.sidebar.checkSubItemActive(
      apps.aiAgents,
      aiAgentsSubItems.recent,
    );
  }

  async expectFavoritesSubItemActive() {
    await this.sidebar.checkSubItemActive(
      apps.aiAgents,
      aiAgentsSubItems.favorites,
    );
  }

  getAgentFolderIdFromChat(): number {
    const folder = new URL(this.page.url()).searchParams.get("folder");
    if (!folder) {
      throw new Error(`No "folder" param in chat URL: ${this.page.url()}`);
    }
    return Number(folder);
  }

  // Opening a file in the editor is what registers it in the Recent section.
  async openFileInEditor(fileId: number) {
    await this.page.goto(
      `${getPortalUrl(this.portalDomain)}/doceditor?fileId=${fileId}`,
      { waitUntil: "domcontentloaded" },
    );
    await expect(this.page).toHaveURL(/\/doceditor/);
    await this.page
      .locator("iframe")
      .first()
      .waitFor({ state: "attached", timeout: 60000 });
    await this.page.waitForTimeout(12000);
  }

  async expectFileInRecent(fileTitle: string) {
    await this.openRecentFromNavigation();
    await this.expectFileVisibleInList(fileTitle);
  }

  async expectFileInFavorites(fileTitle: string) {
    await this.openFavoritesFromNavigation();
    await this.expectFileVisibleInList(fileTitle);
  }

  private async expectFileVisibleInList(fileTitle: string) {
    await expect(
      this.page.getByRole("main").getByText(fileTitle).first(),
    ).toBeVisible({ timeout: 30000 });
  }

  private get resultStorageTab() {
    return this.page.getByTestId("result_tab");
  }

  async openResultStorageTab() {
    await expect(this.resultStorageTab).toBeVisible();
    await this.resultStorageTab.click();
    await expect(this.filesTable.tableContainer).toBeVisible();
  }

  async expectRecentEmptyView() {
    await this.expectSectionEmptyView(aiSectionEmptyView.recent);
  }

  async expectFavoritesEmptyView() {
    await this.expectSectionEmptyView(aiSectionEmptyView.favorites);
  }

  private async expectSectionEmptyView(section: {
    heading: string;
    title: string;
    description: string;
  }) {
    await expect(
      this.page.getByRole("heading", { name: section.heading, exact: true }),
    ).toBeVisible();
    await expect(this.emptyView).toBeVisible();
    await expect(this.emptyView.getByText(section.title)).toBeVisible();
    await expect(this.emptyView.getByText(section.description)).toBeVisible();
  }

  async openCreateAgentDialog() {
    // Right after AI activation the empty view can still render the
    // "Top up & activate" state; reload so the create-agent action shows.
    await this.page.reload();
    await this.waitForAiAgentsPage();
    // Goes through the state-aware create button ("New agent" in the toolbar when
    // agents exist, "+" in the header when the list is empty).
    await this.navigation.clickAddButton();
    await expect(this.agentNameInput).toBeVisible();
  }

  async fillAgentName(name: string) {
    await this.agentNameInput.fill(name);
  }

  // The create-agent dialog no longer has a provider step; it exposes a single
  // model combobox that is pre-filled with a default model. Use this only when a
  // test needs a specific model — otherwise the default is fine.
  async selectModel(modelName: string) {
    await this.modelCombobox.click();
    await this.page
      .getByRole("listbox")
      .filter({ hasText: modelName })
      .getByText(modelName, { exact: true })
      .click();
  }

  async fillInstructions(text: string) {
    await this.instructionsTextarea.fill(text);
  }

  async saveAgent() {
    await expect(this.createAgentButton).toBeEnabled();
    await expect(this.modelCombobox).toBeVisible();
    await this.createAgentButton.click();
  }

  async expectAgentInList(name: string) {
    await expect(this.agentNameCell(name).first()).toBeVisible();
  }

  // Right after creation the list may not include the new agent yet (CI)
  async openAndExpectAgentInList(name: string) {
    await expect(async () => {
      await this.openDirectly();
      await expect(this.agentNameCell(name).first()).toBeVisible({
        timeout: 5000,
      });
    }).toPass({ timeout: 60000 });
  }

  async expectChatOpened() {
    await expect(this.chatComposerInput).toBeVisible();
  }

  async createAgent(
    name: string,
    opts: { model?: string; instructions?: string } = {},
  ) {
    await this.openDirectly();
    await this.openCreateAgentDialog();
    await this.fillAgentName(name);
    if (opts.model) {
      await this.selectModel(opts.model);
    }
    if (opts.instructions) {
      await this.fillInstructions(opts.instructions);
    }
    await this.saveAgent();
    await this.expectChatOpened();
  }

  // Asks the agent to generate a document and approves the tool call. The
  // built-in "resume" tool completes reliably (free-form requests often stall);
  // pair with the GPT model, as the default DeepSeek often skips the tool call.
  // `pollFiles` returns the Result Storage contents so this can wait for the
  // generated file without coupling the page object to the API layer.
  async openAttachmentPanel() {
    await this.page.getByTestId("attachment-button").click();
    await this.page.getByText("Add files from storage").click();
    await expect(this.page.getByTestId("selector")).toBeVisible();
  }

  async expectAttachedFile(name: string) {
    await expect(this.page.getByText(name).first()).toBeVisible();
  }

  // The quick-chat panel (opened from "Ask AI" on a file) defaults to a raw
  // model. Its model-selector dropdown also offers "Choose AI Agent", whose
  // submenu lists custom agents so the chat can be bound to one of them instead.
  private get quickChatModelSelectorButton() {
    return this.page.getByTestId("model-selector");
  }

  private get quickChatAgentSubmenu() {
    return this.page.locator(
      '[data-radix-menu-content][role="menu"][data-side="left"]',
    );
  }

  // The "Choose AI Agent" submenu sometimes opens automatically once the
  // dropdown gets initial keyboard focus, and sometimes needs an explicit
  // hover - in that case Radix's own reopened submenu overlaps the trigger
  // and fails a plain hover's actionability check, so force it.
  // The click can also occasionally fail to open the model-selector dropdown
  // at all (no "Choose AI Agent" trigger ever appears). actionTimeout is 0
  // project-wide, so an unbounded hover there would hang until the global
  // test timeout instead of failing fast - bound each attempt and retry the
  // click once before giving up with a clear error.
  private async openQuickChatAgentSubmenu() {
    const submenu = this.quickChatAgentSubmenu;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      await this.quickChatModelSelectorButton.click();
      const alreadyOpen = await submenu
        .waitFor({ state: "visible", timeout: 3000 })
        .then(() => true)
        .catch(() => false);
      if (alreadyOpen) return submenu;

      const triggerHovered = await this.page
        .getByText("Choose AI Agent", { exact: true })
        .hover({ force: true, timeout: 5000 })
        .then(() => true)
        .catch(() => false);
      if (triggerHovered) {
        await submenu.waitFor({ state: "visible" });
        return submenu;
      }

      await this.page.keyboard.press("Escape").catch(() => {});
    }
    throw new Error(
      "Quick chat 'Choose AI Agent' submenu did not open after clicking the model selector",
    );
  }

  async selectAgentInQuickChat(agentName: string) {
    const submenu = await this.openQuickChatAgentSubmenu();
    await submenu.getByText(agentName, { exact: true }).click();
  }

  async expectQuickChatAgentSelected(agentName: string) {
    await expect(this.quickChatModelSelectorButton).toHaveText(agentName);
  }

  // The submenu scrolls via plain CSS overflow (overflow-y: auto), not the
  // app's custom Scrollbar component - so a scrollbar affordance isn't the
  // signal to check. Verify the list is actually scrollable instead, once it
  // has more agents than fit.
  async expectQuickChatAgentSubmenuScrollable() {
    const submenu = await this.openQuickChatAgentSubmenu();
    const isScrollable = await submenu.evaluate(
      (el) => el.scrollHeight > el.clientHeight,
    );
    expect(isScrollable).toBe(true);
  }

  // Suggestion chips shown above the composer on a fresh chat. Each section
  // and sub-section has its own set (see aiChatSuggestions), matched by label.
  private get chatSuggestionButtons() {
    return this.page.getByTestId(SUGGESTIONS).getByTestId(SUGGESTION_BUTTON);
  }

  private chatSuggestionButton(label: string) {
    return this.chatSuggestionButtons.filter({
      has: this.page.getByText(label, { exact: true }),
    });
  }

  // The chat panel stays open across sidebar navigation, and the header
  // button toggles it - so only click it while the panel is closed.
  async openSectionWithChat(app: TApp, subItem?: string) {
    if (subItem) {
      await this.sidebar.openSubItem(app, subItem);
    } else {
      await this.sidebar.navigate(app);
    }
    if (!(await this.chatComposerInput.isVisible())) {
      await this.openAiChat();
    }
    await this.expectChatOpened();
  }

  // Exactly this set - checks every label and that no other chip is shown.
  async expectChatSuggestions(labels: readonly string[]) {
    for (const label of labels) {
      await expect(this.chatSuggestionButton(label)).toBeVisible();
    }
    await expect(this.chatSuggestionButtons).toHaveCount(labels.length);
  }

  async expectNoChatSuggestions() {
    await expect(this.chatSuggestionButtons).toHaveCount(0);
  }

  // Only fills the composer with a fuller prompt for that suggestion - it
  // does not auto-send. Call sendComposerMessage() to actually submit it.
  async clickChatSuggestion(label: string) {
    await this.chatSuggestionButton(label).click();
  }

  // Picking a chip fills the composer; picking another replaces that text.
  // The composer keeps its text across sections, so compare after each click.
  async expectSuggestionsFillComposer(first: string, second: string) {
    const before = await this.chatComposerInput.inputValue();
    await this.clickChatSuggestion(first);
    await expect(this.chatComposerInput).not.toHaveValue(before);
    await expect(this.chatComposerInput).not.toBeEmpty();
    const firstPrompt = await this.chatComposerInput.inputValue();
    await this.clickChatSuggestion(second);
    await expect(this.chatComposerInput).not.toHaveValue(firstPrompt);
    await expect(this.chatComposerInput).not.toBeEmpty();
  }

  async expectComposerFilled() {
    await expect(this.chatComposerInput).not.toBeEmpty();
  }

  // The model-selector button's own dropdown lists raw models (its top-level
  // menu, data-side="top") separately from the "Choose AI Agent" submenu
  // (nested, data-side="left") reached by hovering that entry.
  private get quickChatModelMenu() {
    return this.page.locator(
      '[data-radix-menu-content][role="menu"][data-side="top"]',
    );
  }

  async openQuickChatModelMenu() {
    // Closes any menu already left open - a second click on the trigger would
    // toggle an open dropdown closed instead of reopening it.
    await this.page.keyboard.press("Escape");
    await this.quickChatModelSelectorButton.click();
    await expect(this.quickChatModelMenu).toBeVisible();
  }

  async selectModelInQuickChat(modelName: string) {
    await this.openQuickChatModelMenu();
    await this.quickChatModelMenu.getByText(modelName, { exact: true }).click();
  }

  async expectQuickChatModelSelected(modelName: string) {
    await expect(this.quickChatModelSelectorButton).toHaveText(modelName);
  }

  async expectModelInQuickChatMenu(modelName: string, visible: boolean) {
    await this.openQuickChatModelMenu();
    const item = this.quickChatModelMenu.getByText(modelName, {
      exact: true,
    });
    if (visible) {
      await expect(item).toBeVisible();
    } else {
      await expect(item).toHaveCount(0);
    }
    await this.page.keyboard.press("Escape");
  }

  // The "+" attach menu: file-attach entries and a Web search toggle (disabled
  // unless the Web search add-on is purchased).
  private get attachMenu() {
    return this.page.locator('[data-radix-menu-content][role="menu"]').last();
  }

  async openAttachMenu() {
    // Closes any menu already left open from a previous call - otherwise its
    // Radix overlay can intercept the click meant for the trigger button.
    await this.page.keyboard.press("Escape");
    await this.page.getByTestId("attachment-button").click();
    await expect(this.attachMenu).toBeVisible();
  }

  async clickAddFilesFromDevice() {
    await this.attachMenu
      .getByText("Add files from device", { exact: true })
      .click();
  }

  private get webSearchToggle() {
    return this.attachMenu.getByRole("switch");
  }

  async expectWebSearchToggleDisabled() {
    await expect(this.webSearchToggle).toBeDisabled();
  }

  // Effort levels by their visible label -> the option testid suffix.
  private static readonly EFFORT_OPTION_IDS: Record<string, string> = {
    "No thinking": "off",
    Low: "low",
    Medium: "medium",
    High: "high",
    Maximum: "max",
  };

  private effortOption(level: string) {
    const id = AiAgents.EFFORT_OPTION_IDS[level];
    if (!id) throw new Error(`Unknown effort level: ${level}`);
    return this.page.getByTestId(`${EFFORT_MENU_OPTION_PREFIX}${id}`);
  }

  // The "Effort" row lives in the model-selector dropdown and holds both its
  // label and the currently selected level.
  private get effortMenuItem() {
    return this.quickChatModelMenu.getByTestId(EFFORT_MENU_ITEM);
  }

  // Hover-opened submenu; it can open over its own row, so the hover is forced.
  // Available levels depend on the selected model, so wait for the target one.
  private async openEffortSubmenu(level: string) {
    await this.effortMenuItem.hover({ force: true });
    await expect(this.effortOption(level)).toBeVisible();
  }

  async selectEffortLevel(level: string) {
    await this.openEffortSubmenu(level);
    await this.effortOption(level).click();
  }

  // The currently selected level is echoed as secondary text on the "Effort"
  // row itself, not just inside the submenu (which always lists all levels).
  async expectEffortLevel(level: string) {
    await expect(
      this.effortMenuItem.getByText(level, { exact: true }),
    ).toBeVisible();
  }

  // The "Permissions" row sits under "Effort" in the model-selector dropdown
  // and echoes the current mode as secondary text.
  private get permissionsMenuItem() {
    return this.quickChatModelMenu.getByTestId(PERMISSIONS_MENU_ITEM);
  }

  // Its submenu is portaled separately and its options have no testids. The
  // parent row only shows one mode at a time, so a menu holding two mode
  // labels at once is the submenu.
  private get permissionsSubmenu() {
    return this.page
      .locator(RADIX_MENU_CONTENT)
      .filter({ hasText: PERMISSIONS_OPTIONS[0] })
      .filter({ hasText: PERMISSIONS_OPTIONS[2] });
  }

  private permissionsOption(mode: TPermissionsMode) {
    return this.permissionsSubmenu.getByText(mode, { exact: true });
  }

  // Hover-opened submenu; it can open over its own row, so the hover is forced.
  async openPermissionsSubmenu() {
    await this.permissionsMenuItem.hover({ force: true });
    await expect(this.permissionsSubmenu).toBeVisible();
  }

  async selectPermissionsMode(mode: TPermissionsMode) {
    await this.openPermissionsSubmenu();
    await this.permissionsOption(mode).click();
  }

  async expectPermissionsMode(mode: TPermissionsMode) {
    await expect(
      this.permissionsMenuItem.getByText(mode, { exact: true }),
    ).toBeVisible();
  }

  async expectPermissionsOptions() {
    for (const mode of PERMISSIONS_OPTIONS) {
      await expect(this.permissionsOption(mode)).toBeVisible();
    }
  }

  // Chat toolbar toggle button - it has no aria-expanded attribute, its
  // pressed/open state is only reflected by a CSS module class containing
  // "active".
  private get chatHistoryToggle() {
    return this.page.locator('[aria-label="Chat history"]');
  }

  // Past messages render inside a collapsible "Chat history" panel that isn't
  // expanded by default - expand it (best-effort: a chat with no messages yet
  // never renders the toggle button at all) before asserting on message content.
  async openChatHistoryPanel() {
    const toggle = this.chatHistoryToggle;
    if (!(await toggle.isVisible().catch(() => false))) {
      return;
    }
    const className = (await toggle.getAttribute("class")) ?? "";
    if (!className.includes("active")) {
      await toggle.click();
      await expect(toggle).toHaveClass(/active/);
    }
  }

  // Expanding the "Chat history" toggle reveals a list of past sessions
  // (grouped by date, e.g. "Today"), not the message content itself - a
  // session that already has messages keeps rendering in the main pane on
  // reopen, unless membership was revoked and re-granted, which resets the
  // main pane to a blank new chat while the old session survives as an
  // entry in this list. No stable testid on the row, so match on the
  // Tailwind utility class instead of the hashed CSS-module column class.
  private get chatHistorySessionItems() {
    return this.page.locator('[class*="historyColumn"] div.cursor-pointer');
  }

  async expectMessageInChat(text: string) {
    await expect(async () => {
      const alreadyVisible = await this.page
        .getByText(text)
        .first()
        .isVisible()
        .catch(() => false);
      if (!alreadyVisible) {
        await this.openChatHistoryPanel();
        const previousSession = this.chatHistorySessionItems.first();
        if (await previousSession.isVisible().catch(() => false)) {
          await previousSession.click();
        }
      }
      await expect(this.page.getByText(text).first()).toBeVisible({
        timeout: 5000,
      });
    }).toPass({ timeout: 20000 });
  }

  // Confirms a message bubble the test just sent has actually rendered,
  // without expectMessageInChat's chat-history fallback (meant for messages
  // from an earlier session, not one still in view).
  async expectUserMessageVisible(text: string) {
    await expect(
      this.page.getByText(text, { exact: true }).first(),
    ).toBeVisible({
      timeout: 30000,
    });
  }

  async expectMessageNotInChat(text: string) {
    await this.openChatHistoryPanel();
    await expect(this.page.getByText(text)).toHaveCount(0);
  }

  // Viewer-access members don't get a chat composer - they only ever see the
  // results of other members' chat activity, so before anyone else has
  // chatted the agent renders this placeholder instead.
  async expectViewerChatEmptyState() {
    await expect(this.emptyView).toBeVisible();
    await expect(
      this.emptyView.getByText(aiAgentViewerChatEmptyView.title),
    ).toBeVisible();
    await expect(
      this.emptyView.getByText(aiAgentViewerChatEmptyView.description),
    ).toBeVisible();
  }

  async expectViewerModeToast() {
    await this.checkToastMessage(aiAgentViewerModeToastMessage);
  }

  async expectChatUrl() {
    await expect(this.page).toHaveURL(/\/ai-agents\/[^/]+\/chat/);
  }

  // "Tested model for form processing is not available" hint container,
  // shown in the chat and in the agent settings dialog
  private get recommendedModelHint() {
    return this.page.locator(".recomendedModel");
  }

  async expectFormProcessingHintVisible() {
    await expect(this.recommendedModelHint.first()).toBeVisible();
  }

  async expectFormProcessingHintInEditDialog() {
    await expect(
      this.page.locator("#modal-dialog .recomendedModel"),
    ).toBeVisible();
  }

  async openEditAgentFromChat() {
    const editAgentOption: TMenuItem = {
      type: "data-testid",
      value: "option_edit-agent",
    };
    await this.page.locator("#header_optional-button").click();
    await this.contextMenu.checkMenuExists();
    const editOption = this.contextMenu.getItemLocator(editAgentOption);
    if (await editOption.isVisible()) {
      await editOption.click();
    } else {
      await this.contextMenu.clickSubmenuOption("Manage", editAgentOption);
    }
    await expect(this.agentNameInput).toBeVisible();
  }

  async openAgentContextMenu(name: string) {
    const cell = this.agentNameCell(name).first();
    await expect(cell).toBeVisible();
    await cell.click({ button: "right" });
    await this.contextMenu.checkMenuExists();
  }

  async openAgent(name: string) {
    await this.openAgentContextMenu(name);
    await this.contextMenu.clickOption("Open");
  }

  async pinAgent(name: string) {
    await this.openAgentContextMenu(name);
    await this.contextMenu.clickOption("Pin to top");
  }

  async disableAgentNotifications(name: string) {
    await this.openAgentContextMenu(name);
    await this.contextMenu.clickOption("Disable notifications");
  }

  async enableAgentNotifications(name: string) {
    await this.openAgentContextMenu(name);
    await this.contextMenu.clickOption("Enable notifications");
  }

  async copyAgentLink(name: string) {
    await this.openAgentContextMenu(name);
    await this.contextMenu.clickOption("Copy link");
  }

  async expectAgentNotInList(name: string) {
    await expect(this.agentNameCell(name)).toHaveCount(0);
  }

  // #modal-dialog isn't unique on the page (a hidden "Synchronization with
  // database" panel shares the id), so scope by role/name too - the hidden
  // panel has no Save button, which resolves the ambiguity.
  private get editAgentSaveButton() {
    return this.page.locator("#modal-dialog").getByRole("button", {
      name: "Save",
    });
  }

  async openEditAgentDialog(name: string) {
    await this.openAgentContextMenu(name);
    await this.contextMenu.clickOption("Edit agent");
    await expect(this.agentNameInput).toBeVisible();
    // The instructions textarea's initial value loads asynchronously after
    // the dialog itself opens - editing too early gets overwritten once it
    // arrives, so wait for it before touching any field.
    await expect(this.instructionsTextarea).toBeVisible();
  }

  async saveEditedAgent() {
    await expect(this.editAgentSaveButton).toBeEnabled();
    await this.editAgentSaveButton.click();
  }

  async renameAgent(oldName: string, newName: string) {
    await this.openEditAgentDialog(oldName);
    await this.agentNameInput.fill(newName);
    await this.saveEditedAgent();
  }

  // The create-agent dialog is reused for editing, so the same model
  // combobox and instructions textarea testids apply here.
  async editAgent(
    name: string,
    opts: { model?: string; instructions?: string },
  ) {
    await this.openEditAgentDialog(name);
    if (opts.model) {
      await this.selectModel(opts.model);
    }
    if (opts.instructions) {
      await this.instructionsTextarea.fill(opts.instructions);
      // Blur so the controlled textarea's change commits to state before
      // Save is clicked - without it the click can race the update.
      await this.instructionsTextarea.blur();
    }
    await this.saveEditedAgent();
  }

  async expectAgentModel(name: string, modelName: string) {
    await this.openEditAgentDialog(name);
    await expect(this.modelCombobox).toHaveText(modelName);
  }

  async expectAgentInstructions(name: string, instructions: string) {
    await this.openEditAgentDialog(name);
    await expect(this.instructionsTextarea).toHaveValue(instructions);
  }

  async deleteAgent(name: string) {
    await this.openAgentContextMenu(name);
    await this.contextMenu.clickOption("Delete agent");
    const dialog = this.page
      .getByTestId("delete-dialog")
      .getByTestId("modal-dialog");
    await expect(dialog).toBeVisible();
    const warningCheckbox = dialog.locator(
      "label[data-testid='delete_warning_checkbox']",
    );
    await expect(warningCheckbox).toBeVisible();
    await warningCheckbox.click();
    const submit = this.page.locator("#delete-file-modal_submit");
    await expect(submit).toBeEnabled();
    await submit.click();
  }

  async openInviteDialog(name: string) {
    await this.openAgentContextMenu(name);
    await this.contextMenu.clickOption("Invite people");
    await this.inviteDialog.checkInviteTitleExist();
  }

  // Access defaults to whatever the invite dialog itself defaults to
  // (Viewer - no chat composer). Pass e.g. "Content creator" to grant a role
  // that can actually chat with the agent; must be set before the email is
  // added, as it becomes the default role applied to newly added invitees.
  async inviteUserToAgent(agentName: string, email: string, access?: string) {
    await this.openInviteDialog(agentName);
    if (access) {
      await this.inviteDialog.openAccessOptions();
      await this.inviteDialog.selectAccessOption(access);
    }
    await this.inviteDialog.fillSearchInviteInput(email);
    await this.inviteDialog.checkUserExist(email);
    await this.inviteDialog.clickAddUserToInviteList(email);
    await this.inviteDialog.submitInviteDialog();
  }

  async openAgentInfo(name: string) {
    await this.openAgentContextMenu(name);
    await this.contextMenu.clickSubmenuOption("More options", "Agent info");
  }

  async expectMemberInAgentContacts(email: string) {
    await this.page.getByTestId("info_members_tab").click();
    const member = this.page
      .locator(".members-list-item")
      .filter({ hasText: email });
    await expect(member).toBeVisible();
  }

  async downloadAgent(name: string) {
    return this.waitForDownload(async () => {
      await this.openAgentContextMenu(name);
      await this.contextMenu.clickSubmenuOption("More options", "Download");
    });
  }

  private async pickOwnerInChangeOwnerSelector(newOwnerName: string) {
    const panel = this.page.getByTestId("change_owner_people_selector");
    const item = panel
      .locator('[data-testid^="selector-item-"]')
      .filter({ hasText: newOwnerName });
    await expect(item).toBeVisible();
    await item.click();
    const submit = panel.getByTestId("selector_submit_button");
    await expect(submit).toBeEnabled();
    await submit.click();
  }

  async changeAgentOwner(agentName: string, newOwnerName: string) {
    await this.openAgentContextMenu(agentName);
    await this.contextMenu.clickSubmenuOption("More options", "Change owner");
    await this.pickOwnerInChangeOwnerSelector(newOwnerName);
  }

  async leaveAgent(name: string, newOwnerName: string) {
    await this.openAgentContextMenu(name);
    await this.contextMenu.clickOption("Leave agent");
    const assignOwner = this.page.getByTestId("leave_room_modal_submit");
    await expect(assignOwner).toBeVisible();
    await assignOwner.click();
    await this.pickOwnerInChangeOwnerSelector(newOwnerName);
  }

  // --- Saved AI Prompts library ---
  // Opened from the composer's ">_" button. Menus and dialogs render in a
  // portal outside the chat root, so they are queried from the page root.

  // An open Radix menu's overlay intercepts every click on the page, and one
  // Escape closes only the top level (e.g. a hover-opened folder panel), so
  // repeat until no menu is left. The pointer is moved off first so a hovered
  // folder does not reopen its panel; an outside click is the fallback when
  // Escape is ignored. Skipped when nothing is open - Escape in the chat also
  // stops a reply that is still streaming.
  private async closeOpenMenus() {
    const menus = this.page
      .locator(RADIX_MENU_CONTENT)
      .filter({ visible: true });
    await expect(async () => {
      if ((await menus.count()) === 0) return;
      await this.page.mouse.move(1, 1);
      await this.page.keyboard.press("Escape");
      if ((await menus.count()) > 0) {
        await this.page.mouse.click(1, 1);
      }
      await expect(menus).toHaveCount(0, { timeout: 1000 });
    }).toPass({ timeout: 10000 });
  }

  private get promptsMenu() {
    return this.page.getByTestId(PROMPTS_MENU);
  }

  private promptMenuItem(name: string) {
    return this.promptsMenu
      .getByTestId(PROMPTS_MENU_PROMPT)
      .filter({ has: this.page.getByText(name, { exact: true }) });
  }

  async openPromptsLibrary() {
    await this.closeOpenMenus();
    await this.page.getByTestId(PROMPTS_BUTTON).click();
    await expect(this.promptsMenu).toBeVisible();
  }

  async expectPromptInLibrary(name: string) {
    await this.openPromptsLibrary();
    await expect(this.promptMenuItem(name)).toBeVisible();
    await this.closeOpenMenus();
  }

  async expectPromptNotInLibrary(name: string) {
    await this.openPromptsLibrary();
    await expect(this.promptMenuItem(name)).toHaveCount(0);
    await this.closeOpenMenus();
  }

  private promptFolderItem(folderName: string) {
    return this.promptsMenu
      .getByTestId(PROMPTS_MENU_FOLDER)
      .filter({ hasText: folderName });
  }

  // A folder opens on hover into its own portal panel: the prompts inside it
  // plus "Rename folder" / "Delete folder". Only one folder panel is open at
  // a time, so its rename/delete items are queried from the page root.
  private async openPromptFolder(folderName: string) {
    await this.openPromptsLibrary();
    await this.promptFolderItem(folderName).hover();
    await expect(
      this.page.getByTestId(PROMPTS_MENU_RENAME_FOLDER),
    ).toBeVisible();
  }

  // Any prompt row on the page - the library root or an open folder panel.
  private anyPromptItem(name: string) {
    return this.page
      .getByTestId(PROMPTS_MENU_PROMPT)
      .filter({ has: this.page.getByText(name, { exact: true }) });
  }

  // The library root stays open next to a folder panel, so a prompt inside
  // the folder is looked up only in the panel that holds the rename button.
  private openFolderPromptItem(name: string) {
    return this.page
      .locator(RADIX_MENU_CONTENT)
      .filter({ has: this.page.getByTestId(PROMPTS_MENU_RENAME_FOLDER) })
      .last()
      .getByTestId(PROMPTS_MENU_PROMPT)
      .filter({ has: this.page.getByText(name, { exact: true }) });
  }

  async expectPromptFolderInLibrary(folderName: string) {
    await this.openPromptsLibrary();
    await expect(this.promptFolderItem(folderName)).toBeVisible();
    await this.closeOpenMenus();
  }

  async expectPromptFolderNotInLibrary(folderName: string) {
    await this.openPromptsLibrary();
    await expect(this.promptFolderItem(folderName)).toHaveCount(0);
    await this.closeOpenMenus();
  }

  async expectPromptInFolder(folderName: string, name: string) {
    await this.openPromptFolder(folderName);
    await expect(this.openFolderPromptItem(name)).toBeVisible();
    await this.closeOpenMenus();
  }

  async expectPromptNotInFolder(folderName: string, name: string) {
    await this.openPromptFolder(folderName);
    await expect(this.openFolderPromptItem(name)).toHaveCount(0);
    await this.closeOpenMenus();
  }

  async renamePromptFolder(currentName: string, newName: string) {
    await this.openPromptFolder(currentName);
    await this.page.getByTestId(PROMPTS_MENU_RENAME_FOLDER).click();
    const dialog = this.promptDialog(RENAME_PROMPT_FOLDER_DIALOG_TITLE);
    await expect(dialog).toBeVisible();
    await dialog.locator("input").first().fill(newName);
    await dialog.getByRole("button", { name: "Save", exact: true }).click();
    await expect(dialog).toBeHidden();
  }

  // Answers the "Warning" confirmation with "Yes" (confirm) or "No".
  async deletePromptFolder(name: string, opts: { confirm: boolean }) {
    await this.openPromptFolder(name);
    await this.page.getByTestId(PROMPTS_MENU_DELETE_FOLDER).click();
    const dialog = this.page.getByRole("dialog").filter({
      has: this.page.getByText(aiDeletePromptFolderDialog.message),
    });
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByText(aiDeletePromptFolderDialog.title, { exact: true }),
    ).toBeVisible();
    await dialog
      .getByRole("button", { name: opts.confirm ? "Yes" : "No", exact: true })
      .click();
    await expect(dialog).toBeHidden();
  }

  // "Move to folder" is a hover-opened submenu listing every folder, plus the
  // library root only for a prompt that sits in a folder - so callers wait
  // for their own target item. Pass fromFolder for a prompt in a folder.
  private async openMovePromptSubmenu(name: string, fromFolder?: string) {
    if (fromFolder) {
      await this.openPromptFolder(fromFolder);
    } else {
      await this.openPromptsLibrary();
    }
    await this.openPromptActions(name);
    await this.page.getByTestId(PROMPT_MENU_MOVE).hover({ force: true });
  }

  async movePromptToFolder(
    name: string,
    folderName: string,
    fromFolder?: string,
  ) {
    await this.openMovePromptSubmenu(name, fromFolder);
    await this.page
      .getByTestId(PROMPT_MENU_MOVE_TO_FOLDER)
      .filter({ hasText: folderName })
      .click();
  }

  async movePromptToRoot(name: string, fromFolder: string) {
    await this.openMovePromptSubmenu(name, fromFolder);
    await this.page.getByTestId(PROMPT_MENU_MOVE_TO_ROOT).click();
  }

  // The row's submenu trigger is revealed only on hover (group-hover opacity).
  // Queried from the page root so it also finds prompts inside a folder panel.
  private async openPromptActions(name: string) {
    const item = this.anyPromptItem(name);
    await item.hover({ force: true });
    await item
      .getByTestId(PROMPTS_MENU_PROMPT_SUBMENU_BUTTON)
      .click({ force: true });
  }

  // Scoped to the message bubble - the composer can hold the same text
  // (e.g. when a reply is stopped, the message is put back into it).
  private userMessage(messageText: string) {
    return this.page
      .getByTestId(USER_MESSAGE_CONTENT)
      .getByText(messageText, { exact: true });
  }

  // Every user message shares the same more-button testid, so take the
  // first one following this message's text.
  private userMessageMoreButton(messageText: string) {
    return this.userMessage(messageText).locator(
      `xpath=following::*[@data-testid="${USER_MESSAGE_MORE_BUTTON}"][1]`,
    );
  }

  private get userMessageMenu() {
    return this.page.getByTestId(USER_MESSAGE_MENU);
  }

  private async openUserMessageMenu(messageText: string) {
    // The chat auto-scrolls to the end of the AI reply, so a long reply
    // leaves the user message above the viewport; its actions show on hover.
    // No Escape here: while a reply is streaming it stops the generation.
    const message = this.userMessage(messageText);
    await message.scrollIntoViewIfNeeded();
    await message.hover();
    await this.userMessageMoreButton(messageText).click();
    await expect(this.userMessageMenu).toBeVisible();
  }

  async saveMessageAsPrompt(messageText: string) {
    await this.openUserMessageMenu(messageText);
    await this.userMessageMenu
      .getByTestId(USER_MESSAGE_MENU_SAVE_PROMPT)
      .click();
    await this.checkToastMessage(aiAgentToastMessages.promptSaved);
  }

  // Submenus near the chat panel's right edge flip to the left and cover
  // their own trigger, so the trigger hover is forced past that overlap.
  // "Save AI prompt to folder" is a hover-opened submenu: "New folder" plus
  // every folder created so far. It renders in its own portal, so its items
  // are queried from the page root.
  private async openSaveToFolderSubmenu(messageText: string) {
    await this.openUserMessageMenu(messageText);
    await this.userMessageMenu
      .getByTestId(USER_MESSAGE_MENU_SAVE_TO_FOLDER)
      .hover({ force: true });
    await expect(
      this.page.getByTestId(USER_MESSAGE_MENU_NEW_FOLDER),
    ).toBeVisible();
  }

  private saveToFolderMenuItem(folderName: string) {
    return this.page
      .getByTestId(USER_MESSAGE_MENU_FOLDER)
      .filter({ hasText: folderName });
  }

  async saveMessageToNewFolder(messageText: string, folderName: string) {
    await this.openSaveToFolderSubmenu(messageText);
    await this.page.getByTestId(USER_MESSAGE_MENU_NEW_FOLDER).click();
    const dialog = this.promptDialog(NEW_PROMPT_FOLDER_DIALOG_TITLE);
    await expect(dialog).toBeVisible();
    await dialog.locator("input").first().fill(folderName);
    await dialog.getByRole("button", { name: "Save", exact: true }).click();
    await expect(dialog).toBeHidden();
    await this.checkToastMessage(
      aiAgentToastMessages.promptSavedToFolder(folderName),
    );
  }

  // The folder list sits in a scroll container inside the submenu; walk up
  // from a folder item to the menu root looking for overflowing content.
  async expectSaveToFolderListScrollable(
    messageText: string,
    scrollable: boolean,
  ) {
    await this.openSaveToFolderSubmenu(messageText);
    const firstFolder = this.page.getByTestId(USER_MESSAGE_MENU_FOLDER).first();
    await expect(firstFolder).toBeVisible();
    await expect
      .poll(() =>
        firstFolder.evaluate((item) => {
          let el: HTMLElement | null = item.parentElement;
          const view = item.ownerDocument.defaultView;
          while (el && view) {
            const { overflowY } = view.getComputedStyle(el);
            if (
              (overflowY === "auto" || overflowY === "scroll") &&
              el.scrollHeight > el.clientHeight
            ) {
              return true;
            }
            if (el.getAttribute("role") === "menu") return false;
            el = el.parentElement;
          }
          return false;
        }),
      )
      .toBe(scrollable);
    await this.closeOpenMenus();
  }

  async expectFolderInSaveToFolderMenu(
    messageText: string,
    folderName: string,
  ) {
    await this.openSaveToFolderSubmenu(messageText);
    await expect(this.saveToFolderMenuItem(folderName)).toBeVisible();
    await this.closeOpenMenus();
  }

  // The catalog's edit/delete dialog testids are not rendered on these
  // DocSpace modals, so scope by role + header text. Several hidden dialogs
  // ("Synchronization with database", "Top up credits") also exist on the page.
  private promptDialog(title: string) {
    return this.page.getByRole("dialog").filter({
      has: this.page.getByText(title, { exact: true }),
    });
  }

  async editPrompt(
    currentName: string,
    opts: { name?: string; text?: string },
  ) {
    await this.openPromptsLibrary();
    await this.openPromptActions(currentName);
    await this.page.getByTestId(PROMPT_MENU_EDIT).click();
    const dialog = this.promptDialog(EDIT_PROMPT_DIALOG_TITLE);
    await expect(dialog).toBeVisible();
    if (opts.name) {
      await dialog.locator("input").first().fill(opts.name);
    }
    if (opts.text) {
      await dialog.locator("textarea").first().fill(opts.text);
    }
    await dialog.getByRole("button", { name: "Save", exact: true }).click();
    await expect(dialog).toBeHidden();
  }

  async deletePrompt(name: string) {
    await this.openPromptsLibrary();
    await this.openPromptActions(name);
    await this.page.getByTestId(PROMPT_MENU_DELETE).click();
    const dialog = this.promptDialog(aiDeletePromptDialog.title);
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(aiDeletePromptDialog.message)).toBeVisible();
    await dialog
      .getByRole("button", { name: "Delete prompt", exact: true })
      .click();
    await expect(dialog).toBeHidden();
  }

  // --- Chat message actions ---

  private readClipboard() {
    return this.page.evaluate(() => navigator.clipboard.readText());
  }

  // Same per-message lookup as userMessageMoreButton - every user message
  // shares the copy button testid.
  async copyUserMessage(messageText: string) {
    await setupClipboardPermissions(this.page);
    const message = this.userMessage(messageText);
    await message.scrollIntoViewIfNeeded();
    await message.hover();
    await message
      .locator(
        `xpath=following::*[@data-testid="${USER_MESSAGE_COPY_BUTTON}"][1]`,
      )
      .click();
  }

  async expectUserMessageCopied(messageText: string) {
    await expect(
      this.page.getByTestId(USER_MESSAGE_COPIED_INDICATOR),
    ).toBeVisible();
    await expect.poll(() => this.readClipboard()).toBe(messageText);
  }

  private get lastAssistantMessage() {
    return this.page.getByTestId(ASSISTANT_MESSAGE).last();
  }

  // The action row is rendered once the reply has finished streaming.
  async waitForAssistantReply() {
    await expect(
      this.lastAssistantMessage.getByTestId(ASSISTANT_MESSAGE_ACTIONS),
    ).toBeAttached({ timeout: 60000 });
  }

  async expectAssistantReplyActionsVisible() {
    const reply = this.lastAssistantMessage;
    await reply.hover();
    await expect(
      reply.getByTestId(ASSISTANT_MESSAGE_COPY_BUTTON),
    ).toBeVisible();
    await expect(
      reply.getByTestId(ASSISTANT_MESSAGE_REGENERATE_BUTTON),
    ).toBeVisible();
    await expect(
      reply.getByTestId(ASSISTANT_MESSAGE_DOWNLOAD_BUTTON),
    ).toBeVisible();
  }

  async copyAssistantReply() {
    await setupClipboardPermissions(this.page);
    const reply = this.lastAssistantMessage;
    await reply.hover();
    await reply.getByTestId(ASSISTANT_MESSAGE_COPY_BUTTON).click();
  }

  // The clipboard holds the reply's raw markdown, not its rendered text, so
  // only check that something was copied.
  async expectAssistantReplyCopied() {
    await expect(
      this.lastAssistantMessage.getByTestId(ASSISTANT_MESSAGE_COPIED_INDICATOR),
    ).toBeVisible();
    await expect
      .poll(async () => (await this.readClipboard()).trim().length)
      .toBeGreaterThan(0);
  }

  async openSaveReplyAsDocx() {
    const reply = this.lastAssistantMessage;
    await reply.hover();
    await reply.getByTestId(ASSISTANT_MESSAGE_DOWNLOAD_BUTTON).click();
    await this.saveAsDocxSelector.checkSelectorExist();
  }

  // Unlike the other selector panels, this one has no Forms section.
  async expectSaveAsDocxSections() {
    const items = this.saveAsDocxSelector.selector.locator(SELECTOR_ITEMS);
    const { files, rooms, aiAgents, forms } = aiSaveAsDocxSections;
    await expect(items.nth(0)).toHaveText(files);
    await expect(items.nth(1)).toHaveText(rooms);
    await expect(items.nth(2)).toHaveText(aiAgents);
    await expect(items.filter({ hasText: forms })).toHaveCount(0);
  }

  // The file name is generated from the chat, so it is read back from the
  // "Message exported to file: <name>.docx" toast and returned.
  async saveReplyAsDocxToFiles() {
    await this.saveAsDocxSelector.select("documents");
    await this.saveAsDocxSelector.submitSelection();
    await expect(this.saveAsDocxSelector.selector).toBeHidden();
    return this.readExportedFileName(".docx");
  }

  // Regenerate re-streams the reply in place: wait until the content differs
  // from the previous reply and the action row is back.
  async regenerateAssistantReply() {
    const reply = this.lastAssistantMessage;
    const content = reply.getByTestId(ASSISTANT_MESSAGE_CONTENT);
    const previousText = (await content.innerText()).trim();
    await reply.hover();
    await reply.getByTestId(ASSISTANT_MESSAGE_REGENERATE_BUTTON).click();
    await expect
      .poll(async () => (await content.innerText()).trim(), { timeout: 60000 })
      .not.toBe(previousText);
    await this.waitForAssistantReply();
    await expect(content).not.toBeEmpty();
  }

  // --- Chat history list ---
  // The "Chat history" panel lists past chats grouped by date. Every row
  // shares the chat-item testid, so a row is picked by its title; without a
  // title the first (newest) row is used. Row menus render in a portal.

  // The panel header buttons (history, new chat) belong to DocSpace, not the
  // chat widget, so they have no catalog testids - fall back to aria-label /
  // the history column class wherever a testid may be missing.
  private get chatList() {
    return this.page
      .getByTestId(CHAT_LIST)
      .or(this.page.locator(CHAT_LIST_COLUMN))
      .first();
  }

  private chatHistoryItem(title?: string) {
    const items = this.chatList
      .getByTestId(CHAT_ITEM)
      .or(this.chatList.locator(CHAT_ITEM_FALLBACK));
    if (!title) return items.first();
    return items.filter({
      has: this.page.getByText(title, { exact: true }),
    });
  }

  private get chatItemMenu() {
    return this.page.getByTestId(CHAT_ITEM_MENU);
  }

  async startNewChat() {
    await this.page
      .getByTestId(NEW_CHAT_BUTTON)
      .or(this.page.locator(NEW_CHAT_BUTTON_LABEL))
      .first()
      .click();
    await this.expectChatOpened();
  }

  // The header button toggles the panel, so only click it while it is closed.
  async openChatList() {
    if (!(await this.chatList.isVisible())) {
      await this.chatHistoryToggle.click();
    }
    await expect(this.chatList).toBeVisible();
  }

  // A new chat is listed as "New chat" and gets its AI-generated title a few
  // seconds after the first reply - wait for it, or a lookup by the stale
  // placeholder title fails once the row is renamed.
  async getChatHistoryItemTitle(title?: string) {
    const item = this.chatHistoryItem(title);
    await expect(item).toBeVisible();
    const titleLocator = item.getByTestId(CHAT_ITEM_TITLE);
    const source = (await titleLocator.count()) > 0 ? titleLocator : item;
    const readTitle = async () => (await source.innerText()).trim();
    await expect
      .poll(readTitle, { timeout: 60000 })
      .not.toBe(aiDefaultChatTitle);
    return readTitle();
  }

  async expectChatInHistory(title: string) {
    await expect(this.chatHistoryItem(title)).toBeVisible();
  }

  async expectChatNotInHistory(title: string) {
    await expect(this.chatHistoryItem(title)).toHaveCount(0);
  }

  async expectChatHistoryEmpty() {
    await expect(this.page.getByTestId(CHAT_LIST_EMPTY)).toBeVisible();
  }

  private get chatListSearchInput() {
    return this.chatList
      .getByTestId(CHAT_LIST_SEARCH_INPUT)
      .or(this.chatList.getByRole("searchbox"))
      .first();
  }

  // An empty query resets the list to all chats.
  async searchChatHistory(query: string) {
    await this.chatListSearchInput.fill(query);
  }

  // The "nothing found" message has no verified text, so check no row is left.
  async expectChatHistorySearchEmpty() {
    await expect(
      this.chatList
        .getByTestId(CHAT_ITEM)
        .or(this.chatList.locator(CHAT_ITEM_FALLBACK)),
    ).toHaveCount(0);
  }

  async expectChatActive(title: string) {
    await expect(this.chatHistoryItem(title)).toHaveAttribute(
      "data-active",
      "true",
    );
  }

  // The "..." button may be revealed only on row hover.
  async openChatHistoryItemMenu(title?: string) {
    await this.closeOpenMenus();
    const item = this.chatHistoryItem(title);
    await item.hover();
    await item.getByTestId(CHAT_ITEM_MENU_BUTTON).click();
    await expect(this.chatItemMenu).toBeVisible();
  }

  async expectChatHistoryItemMenuOptions() {
    for (const testId of [
      CHAT_ITEM_MENU_OPEN,
      CHAT_ITEM_MENU_EXPORT,
      CHAT_ITEM_MENU_RENAME,
      CHAT_ITEM_MENU_DELETE,
    ]) {
      await expect(this.chatItemMenu.getByTestId(testId)).toBeVisible();
    }
  }

  // "Export to..." is a hover-opened submenu with one item per format; it can
  // flip over its own trigger near the panel edge, so the hover is forced.
  // Exactly this set - checks every format and that no other one is shown.
  async expectChatExportFormats() {
    await this.chatItemMenu
      .getByTestId(CHAT_ITEM_MENU_EXPORT)
      .hover({ force: true });
    const formats = this.page.locator(CHAT_ITEM_MENU_EXPORT_FORMATS);
    for (const { label } of aiChatExportFormats) {
      await expect(formats.filter({ hasText: label })).toBeVisible();
    }
    await expect(formats).toHaveCount(aiChatExportFormats.length);
    await this.closeOpenMenus();
  }

  // Reads "<name><extension>" back from the "Message exported to file: ..."
  // toast - shared by the reply's Save as docx and the chat history export.
  private async readExportedFileName(extension: string) {
    const { messageExported } = aiAgentToastMessages;
    const toast = this.toast.toast
      .filter({ hasText: messageExported })
      .filter({ hasText: extension })
      .first();
    await expect(toast).toBeVisible({ timeout: 60000 });
    const text = await toast.innerText();
    const fileName = text
      .slice(text.indexOf(messageExported) + messageExported.length)
      .trim();
    await this.dismissToastSafely(fileName);
    return fileName;
  }

  // Exports the whole chat to My Documents and returns the file name from the
  // toast. If a folder selector opens (as for Save as docx), My Documents is
  // picked there; otherwise the file is saved without one.
  async exportChatFromHistory(format: TAiChatExportFormat, title?: string) {
    await this.openChatHistoryItemMenu(title);
    await this.chatItemMenu
      .getByTestId(CHAT_ITEM_MENU_EXPORT)
      .hover({ force: true });
    await this.page
      .locator(CHAT_ITEM_MENU_EXPORT_FORMATS)
      .filter({ hasText: format.label })
      .click();
    const selectorOpened = await this.saveAsDocxSelector.selector
      .waitFor({ state: "visible", timeout: 5000 })
      .then(() => true)
      .catch(() => false);
    if (selectorOpened) {
      await this.saveAsDocxSelector.select("documents");
      await this.saveAsDocxSelector.submitSelection();
      await expect(this.saveAsDocxSelector.selector).toBeHidden();
    }
    return this.readExportedFileName(format.extension);
  }

  async openChatFromHistory(title?: string) {
    await this.openChatHistoryItemMenu(title);
    await this.chatItemMenu.getByTestId(CHAT_ITEM_MENU_OPEN).click();
  }

  async renameChatInHistory(newTitle: string, title?: string) {
    await this.openChatHistoryItemMenu(title);
    await this.chatItemMenu.getByTestId(CHAT_ITEM_MENU_RENAME).click();
    const input = this.chatList.getByTestId(CHAT_ITEM_RENAME_INPUT);
    await expect(input).toBeVisible();
    await input.fill(newTitle);
    await input.press("Enter");
    await expect(input).toBeHidden();
  }

  // The "Warning" confirmation is a plain DocSpace modal without its catalog
  // testid (like delete-prompt-dialog), so scope it by its message.
  async deleteChatFromHistory(title?: string) {
    await this.openChatHistoryItemMenu(title);
    await this.chatItemMenu.getByTestId(CHAT_ITEM_MENU_DELETE).click();
    const dialog = this.page.getByRole("dialog").filter({
      has: this.page.getByText(aiDeleteChatDialog.message),
    });
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByText(aiDeleteChatDialog.title, { exact: true }),
    ).toBeVisible();
    await dialog.getByRole("button", { name: "Yes", exact: true }).click();
    await expect(dialog).toBeHidden();
  }
}

export default AiAgents;
