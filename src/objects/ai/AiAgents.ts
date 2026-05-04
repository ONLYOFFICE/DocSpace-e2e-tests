import { getPortalUrl } from "../../../config";
import BasePage from "../common/BasePage";
import { BaseContextMenu } from "../common/BaseContextMenu";
import BaseInviteDialog from "../common/BaseInviteDialog";
import { expect, Page } from "@playwright/test";

export class AiAgents extends BasePage {
  private portalDomain: string;
  contextMenu: BaseContextMenu;
  inviteDialog: BaseInviteDialog;

  constructor(page: Page, portalDomain: string) {
    super(page);
    this.portalDomain = portalDomain;
    this.contextMenu = new BaseContextMenu(page);
    this.inviteDialog = new BaseInviteDialog(page);
  }

  private get emptyProvidersHeading() {
    return this.page.getByText("AI provider is not available yet");
  }

  private get goToSettingsButton() {
    return this.page.locator("#go-to-ai-provider-settings");
  }

  private get aiAgentsNavigationItem() {
    return this.page.locator(
      'a[href*="/ai-agents"] #document_catalog-undefined',
    );
  }

  private get createAgentEmptyViewItem() {
    return this.page.locator("#create-ai-agent");
  }

  private get agentNameInput() {
    return this.page.getByTestId("create_edit_agent_input");
  }

  private get providerCombobox() {
    return this.page.getByTestId("create_agent_provider_combobox");
  }

  private get modelCombobox() {
    return this.page.getByTestId("create_agent_model_combobox");
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

  private get chatInputButtons() {
    return this.page.getByTestId("chat-input-buttons");
  }

  async openDirectly() {
    await this.page.goto(`${getPortalUrl(this.portalDomain)}/ai-agents/filter`);
    await this.waitForAiAgentsPage();
  }

  async open() {
    const navItem = this.aiAgentsNavigationItem;
    await expect(navItem).toBeVisible();
    await navItem.click();
    await this.waitForAiAgentsPage();
  }

  async expectNoProvidersMessage() {
    await expect(this.emptyProvidersHeading).toBeVisible();
  }

  async goToSettings() {
    await this.goToSettingsButton.click();
  }

  private async waitForAiAgentsPage() {
    await expect(this.page).toHaveURL(/\/ai-agents/);
  }

  async openCreateAgentDialog() {
    await this.createAgentEmptyViewItem.click();
    await expect(this.agentNameInput).toBeVisible();
  }

  async fillAgentName(name: string) {
    await this.agentNameInput.fill(name);
  }

  async selectProvider(providerTitle: string) {
    await this.providerCombobox.click();
    await this.page
      .getByRole("listbox")
      .filter({ hasText: providerTitle })
      .getByText(providerTitle, { exact: true })
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

  async expectChatOpened() {
    await expect(this.chatInputButtons).toBeVisible();
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
    await this.contextMenu.clickOption("Edit Agent");
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
    const dialog = this.page.locator("#modal-dialog");
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
    await this.contextMenu.clickOption("Invite contacts");
    await this.inviteDialog.checkInviteTitleExist();
  }

  async inviteUserToAgent(agentName: string, email: string) {
    await this.openInviteDialog(agentName);
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
    await this.contextMenu.clickOption("Leave the agent");
    const assignOwner = this.page.getByTestId("leave_room_modal_submit");
    await expect(assignOwner).toBeVisible();
    await assignOwner.click();
    await this.pickOwnerInChangeOwnerSelector(newOwnerName);
  }
}

export default AiAgents;
