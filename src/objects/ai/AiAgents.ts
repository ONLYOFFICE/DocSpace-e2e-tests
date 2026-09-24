import { getPortalUrl } from "../../../config";
import BasePage from "../common/BasePage";
import { BaseContextMenu } from "../common/BaseContextMenu";
import type { TMenuItem } from "../common/BaseMenu";
import BaseInviteDialog from "../common/BaseInviteDialog";
import BaseNavigation from "../common/BaseNavigation";
import FilesTable from "../files/FilesTable";
import { apps, aiAgentsSubItems } from "@/src/utils/constants/navigation";
import {
  aiSectionEmptyView,
  aiAgentViewerChatEmptyView,
  aiAgentViewerModeToastMessage,
} from "@/src/utils/constants/ai";
import { expect, Page } from "@playwright/test";

export class AiAgents extends BasePage {
  private portalDomain: string;
  contextMenu: BaseContextMenu;
  inviteDialog: BaseInviteDialog;
  navigation: BaseNavigation;
  filesTable: FilesTable;

  constructor(page: Page, portalDomain: string) {
    super(page);
    this.portalDomain = portalDomain;
    this.contextMenu = new BaseContextMenu(page);
    this.inviteDialog = new BaseInviteDialog(page);
    this.navigation = new BaseNavigation(page, {});
    this.filesTable = new FilesTable(page);
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
    await this.page.getByTestId("send-button").click();
  }

  // Agent tool calls require approval via a "Confirmation" dialog.
  async approveToolUsageIfPresent(): Promise<boolean> {
    const allow = this.page
      .locator("#modal-dialog")
      .getByRole("button", { name: "Allow", exact: true });
    if (await allow.isVisible().catch(() => false)) {
      await allow.click();
      return true;
    }
    return false;
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
  async generateResumeDocument(
    pollFiles: () => Promise<Array<{ id: number; title: string }>>,
  ): Promise<{ fileId: number; fileTitle: string }> {
    await this.sendChatMessage("Create a new resume doc");

    let file: { id: number; title: string } | undefined;
    await expect(async () => {
      await this.approveToolUsageIfPresent();
      const files = await pollFiles();
      expect(files.length).toBeGreaterThan(0);
      file = files[0];
    }).toPass({ timeout: 120000, intervals: [3000] });

    return { fileId: file!.id, fileTitle: file!.title };
  }

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
  private async openQuickChatAgentSubmenu() {
    await this.quickChatModelSelectorButton.click();
    const submenu = this.quickChatAgentSubmenu;
    const alreadyOpen = await submenu
      .waitFor({ state: "visible", timeout: 3000 })
      .then(() => true)
      .catch(() => false);
    if (!alreadyOpen) {
      await this.page
        .getByText("Choose AI Agent", { exact: true })
        .hover({ force: true });
      await submenu.waitFor({ state: "visible" });
    }
    return submenu;
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

  async renameAgent(oldName: string, newName: string) {
    await this.openAgentContextMenu(oldName);
    await this.contextMenu.clickOption("Edit agent");
    await expect(this.agentNameInput).toBeVisible();
    await this.agentNameInput.fill(newName);
    const saveButton = this.page
      .locator("#modal-dialog")
      .getByRole("button", { name: "Save" });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
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
}

export default AiAgents;
