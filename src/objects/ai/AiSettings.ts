import { getPortalUrl } from "../../../config";
import BasePage from "../common/BasePage";
import { expect, Locator, Page } from "@playwright/test";
import { navItems, toastMessages } from "@/src/utils/constants/settings";
import {
  aiLimitPeriods,
  aiLimitsTab,
  TAiLimitPeriod,
} from "@/src/utils/constants/ai";

const LIMITS_TAB = "limits_tab";
const SERVICE_LIMITS = "service_limits";
const TOGGLE_BUTTON_CONTAINER = "toggle-button-container";
const COMBO_BUTTON = '[data-test-id="combo-button"]';
const SELECTED_TAB_CLASS = /Tabs-module__selected/;
const LIMIT_RESETS_TEXT = "Resets";

// AI limits tab has two identical forms: "portal_limit_*" and "user_limit_*".
export type TAiLimitForm = "portal" | "user";
const limitTestId = (form: TAiLimitForm, part: string) =>
  `${form}_limit_${part}`;

class AiSettings extends BasePage {
  private portalDomain: string;

  constructor(page: Page, portalDomain: string) {
    super(page);
    this.portalDomain = portalDomain;
  }

  private get activateButton() {
    return this.page
      .locator('[class*="AIFeaturesBanner-module__banner"]')
      .getByTestId("button");
  }

  private get editMcpConfigButton() {
    return this.page.getByRole("button", {
      name: "Edit configuration",
      exact: true,
    });
  }

  private get mcpConfigEditor() {
    return this.page.locator(".cm-content");
  }

  private get saveMcpConfigButton() {
    return this.page.getByRole("button", { name: "Save", exact: true });
  }

  private get turnOffModelConfirmButton() {
    return this.page.getByRole("button", { name: "Turn off", exact: true });
  }

  private get modelsTab() {
    return this.page.getByTestId("ai-models_tab");
  }

  private get serversTab() {
    return this.page.getByTestId("mcp-servers_tab");
  }

  private get searchTab() {
    return this.page.getByTestId("web-search_tab");
  }

  private get knowledgeTab() {
    return this.page.getByTestId("knowledge_tab");
  }

  private get aiSettingsBaseUrl() {
    return `${getPortalUrl(this.portalDomain)}/portal-settings/ai-settings`;
  }

  async openDirectly() {
    await this.page.goto(`${this.aiSettingsBaseUrl}/ai-models`);
    await this.expectLoaded();
  }

  async open() {
    await this.navigateToSettings();
    await this.navigateToArticle(navItems.aiSettings);
    await this.expectLoaded();
  }

  async expectLoaded() {
    await expect(this.activateButton).toBeVisible();
  }
  async activate() {
    await this.expectLoaded();
    await this.activateButton.click();
    await this.page.waitForURL(/\/billing\/addons\/ai-services/, {
      timeout: 30000,
    });
    await this.page.waitForTimeout(3000);
  }

  async openModelsTab() {
    await this.page.goto(`${this.aiSettingsBaseUrl}/ai-models`);
    await expect(this.modelsTab).toBeVisible();
  }

  private modelRow(modelName: string) {
    return this.page
      .getByTestId("table-row")
      .filter({ has: this.page.getByText(modelName, { exact: true }) });
  }

  private modelToggleContainer(modelName: string) {
    return this.modelRow(modelName).getByTestId("toggle-button-container");
  }

  private modelToggleInput(modelName: string) {
    return this.modelToggleContainer(modelName).getByTestId(
      "toggle-button-input",
    );
  }

  async setModelEnabled(modelName: string, enabled: boolean) {
    if ((await this.modelToggleInput(modelName).isChecked()) === enabled) {
      return;
    }
    await this.modelToggleContainer(modelName).click();
    if (!enabled) {
      // Turning a model off shows a "Turn off {model}?" confirmation dialog;
      // turning it back on does not.
      await this.turnOffModelConfirmButton.click();
    }
  }

  async expectModelEnabled(modelName: string, enabled: boolean) {
    if (enabled) {
      await expect(this.modelToggleInput(modelName)).toBeChecked();
    } else {
      await expect(this.modelToggleInput(modelName)).not.toBeChecked();
    }
  }

  async openMcpServersTab() {
    await this.openTab(this.serversTab);
  }

  async openWebSearchTab() {
    await this.openTab(this.searchTab);
  }

  async openKnowledgeTab() {
    await this.openTab(this.knowledgeTab);
  }

  // The redesigned Web search tab is informational: a description, a "Learn
  // more" help link and per-engine pricing links.
  get webSearchLearnMoreLink() {
    return this.page.locator('[class*="WebSearchSaas-module__learnMore"]');
  }

  get webSearchPricingLink() {
    return this.page
      .locator('[class*="WebSearchSaas-module__detailsLink"]')
      .first();
  }

  // The redesigned Knowledge base tab is informational too: a description, a
  // "Learn more" help link and a vectorization model pricing link.
  get knowledgeLearnMoreLink() {
    return this.page.locator('[class*="KnowledgeBaseSaas-module__learnMore"]');
  }

  get knowledgePricingLink() {
    return this.page
      .locator('[class*="KnowledgeBaseSaas-module__detailsLink"]')
      .first();
  }

  // Clicks a link that opens in a new tab and returns the opened page so the
  // test can assert the destination URL.
  async openLinkInNewTab(link: Locator): Promise<Page> {
    const [popup] = await Promise.all([
      this.page.context().waitForEvent("page"),
      link.click(),
    ]);
    await popup.waitForLoadState("domcontentloaded");
    return popup;
  }

  private async writeMcpConfig(config: { mcpServers: Record<string, object> }) {
    await expect(this.editMcpConfigButton).toBeEnabled();
    await this.editMcpConfigButton.click();
    await expect(this.mcpConfigEditor).toBeVisible();

    await this.mcpConfigEditor.click();
    await this.page.keyboard.press(
      process.platform === "darwin" ? "Meta+A" : "Control+A",
    );
    await this.page.keyboard.press("Backspace");
    await this.page.keyboard.insertText(JSON.stringify(config, null, 2));

    await expect(this.saveMcpConfigButton).toBeEnabled();
    await this.saveMcpConfigButton.click();
  }

  async addMcpServer(name: string, url: string) {
    await this.writeMcpConfig({ mcpServers: { [name]: { url } } });
  }

  async removeAllMcpServers() {
    await this.writeMcpConfig({ mcpServers: {} });
  }

  private get mcpToolsPanel() {
    return this.page.locator(".available-tools");
  }

  private mcpServerTitle(name: string) {
    return this.page.locator("p.font-bold", { hasText: name });
  }

  async expectMcpServerInList(name: string) {
    await expect(this.mcpServerTitle(name)).toBeVisible();
  }

  async expectMcpServerNotInList(name: string) {
    await expect(this.mcpServerTitle(name)).toHaveCount(0);
  }

  async expandMcpServer(name: string) {
    const title = this.mcpServerTitle(name);
    await expect(title).toBeVisible();

    const row = title.locator("..");
    const collapsedChevron = row.locator('[style*="rotate(-90deg)"]');

    await expect(async () => {
      if ((await collapsedChevron.count()) > 0) {
        await row.click();
      }
      await expect(collapsedChevron).toHaveCount(0, { timeout: 5000 });
    }).toPass({ timeout: 60000 });
  }

  async expectMcpServerTools(tools: string[]) {
    for (const tool of tools) {
      await expect(
        this.mcpToolsPanel.getByText(tool, { exact: true }),
      ).toBeVisible({ timeout: 30000 });
    }
  }

  async expectMcpToolEnabled(tool: string) {
    const row = this.mcpToolsPanel
      .locator("div")
      .filter({ has: this.page.getByText(tool, { exact: true }) })
      .last();
    await expect(row.getByRole("switch")).toHaveAttribute(
      "aria-checked",
      "true",
    );
  }

  private async openTab(tab: Locator) {
    await this.page.goto(`${this.aiSettingsBaseUrl}/ai-models`);
    await expect(this.modelsTab).toBeVisible();
    await tab.click();
    await expect(tab).toHaveClass(SELECTED_TAB_CLASS);
  }

  private get limitsTab() {
    return this.page.getByTestId(LIMITS_TAB);
  }

  private get serviceLimits() {
    return this.page.getByTestId(SERVICE_LIMITS);
  }

  private limitElement(form: TAiLimitForm, part: string) {
    return this.serviceLimits.getByTestId(limitTestId(form, part));
  }

  async openLimitsTab() {
    await this.page.goto(`${this.aiSettingsBaseUrl}/limits`);
    await this.expectLimitsTabOpened();
  }

  async expectLimitsTabOpened() {
    await expect(this.page).toHaveURL(/\/portal-settings\/ai-settings\/limits/);
    await expect(this.limitsTab).toHaveClass(SELECTED_TAB_CLASS);
    await expect(this.serviceLimits).toBeVisible();
  }

  // The toggle state lives in aria-checked on the container; the inner
  // input's checked attribute is unreliable.
  async expectLimitEnabled(form: TAiLimitForm, enabled: boolean) {
    await expect(this.limitElement(form, "toggle")).toHaveAttribute(
      "aria-checked",
      String(enabled),
    );
  }

  async setLimitEnabled(form: TAiLimitForm, enabled: boolean) {
    const toggle = this.limitElement(form, "toggle");
    if ((await toggle.getAttribute("aria-checked")) === String(enabled)) {
      return;
    }
    await toggle.getByTestId(TOGGLE_BUTTON_CONTAINER).click();
    await this.expectLimitEnabled(form, enabled);
  }

  // Turning a limit off saves it right away - the form with Save/Cancel
  // disappears, so there is nothing to save.
  async disableLimit(form: TAiLimitForm) {
    await this.setLimitEnabled(form, false);
    await expect(this.limitElement(form, "save_button")).toHaveCount(0);
  }

  async fillLimitAmount(form: TAiLimitForm, amount: number) {
    await this.limitElement(form, "amount_input").fill(String(amount));
  }

  async saveLimit(form: TAiLimitForm) {
    const saveButton = this.limitElement(form, "save_button");
    await expect(saveButton).not.toHaveAttribute("aria-disabled", "true");
    await saveButton.click();
    await this.dismissToastSafely(toastMessages.aiLimitSaved);
    await expect(saveButton).toHaveAttribute("aria-disabled", "true");
  }

  // Only the portal limit status shows the spending: "Spent US$0.00 of
  // US$1.00. Resets Nov 3, 02:59:59." The limit per user is spent by each user
  // separately, so its status is just "Resets ...". The reset date is
  // locale-formatted, so only the limit amount is asserted.
  async expectPortalLimitStatus(amount: number) {
    await expect(this.limitElement("portal", "status")).toContainText(
      `of US$${amount.toFixed(2)}`,
    );
  }

  // A lifetime limit never resets, so there is no "Resets ..." text (the
  // per-user status line may be missing altogether).
  async expectLimitResets(form: TAiLimitForm, resets: boolean) {
    const status = this.limitElement(form, "status");
    if (resets) {
      await expect(status).toContainText(LIMIT_RESETS_TEXT);
    } else {
      await expect(status.filter({ hasText: LIMIT_RESETS_TEXT })).toHaveCount(
        0,
      );
    }
  }

  private limitAmountInput(form: TAiLimitForm) {
    return this.limitElement(form, "amount_input");
  }

  // The input may render the value as "5" or "5.00".
  async expectLimitAmount(form: TAiLimitForm, amount: number) {
    await expect(this.limitAmountInput(form)).toHaveValue(
      new RegExp(`^${amount}(\\.0+)?$`),
    );
  }

  async expectSaveDisabled(form: TAiLimitForm) {
    await expect(this.limitElement(form, "save_button")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  }

  // The period dropdown is portaled to the page root, outside service_limits.
  private get periodDropdown() {
    return this.page.getByRole("listbox");
  }

  async selectLimitPeriod(form: TAiLimitForm, period: TAiLimitPeriod) {
    await this.limitElement(form, "period_combobox")
      .locator(COMBO_BUTTON)
      .click();
    const dropdown = this.periodDropdown;
    await expect(dropdown).toBeVisible();
    await dropdown.getByTestId(aiLimitPeriods[period].option).click();
    await expect(dropdown).toBeHidden();
    await this.expectLimitPeriod(form, period);
  }

  async expectLimitPeriod(form: TAiLimitForm, period: TAiLimitPeriod) {
    await expect(this.limitElement(form, "period_combobox")).toContainText(
      aiLimitPeriods[period].label,
    );
  }

  // Opens the period dropdown, checks all four options and that the current
  // period is the selected (and disabled) one, then closes it.
  async expectLimitPeriodOptions(form: TAiLimitForm, selected: TAiLimitPeriod) {
    await this.limitElement(form, "period_combobox")
      .locator(COMBO_BUTTON)
      .click();
    const dropdown = this.periodDropdown;
    await expect(dropdown).toBeVisible();
    for (const [period, { label, option }] of Object.entries(aiLimitPeriods)) {
      const item = dropdown.getByTestId(option);
      await expect(item).toHaveText(label);
      if (period === selected) {
        await expect(item).toHaveAttribute("aria-selected", "true");
        await expect(item).toHaveAttribute("aria-disabled", "true");
      } else {
        await expect(item).not.toHaveAttribute("aria-selected", "true");
      }
    }
    await this.page.keyboard.press("Escape");
    await expect(dropdown).toBeHidden();
  }

  async expectUnsavedChanges(form: TAiLimitForm, visible: boolean) {
    const reminder = this.limitElement(form, "reminder");
    if (visible) {
      await expect(reminder).toHaveText(aiLimitsTab.unsavedChanges);
    } else {
      await expect(reminder).toBeHidden();
    }
  }

  async cancelLimitChanges(form: TAiLimitForm) {
    const cancelButton = this.limitElement(form, "cancel_button");
    await expect(cancelButton).not.toHaveAttribute("aria-disabled", "true");
    await cancelButton.click();
    await this.expectUnsavedChanges(form, false);
    await this.expectSaveDisabled(form);
  }

  async openContactsFromUserLimit() {
    const link = this.limitElement("user", "contacts_link");
    await expect(link).toHaveText(aiLimitsTab.contactsLink);
    await link.click();
    await expect(this.page).toHaveURL(/\/accounts\/people/);
  }

  async expectContactsLinkVisible(visible: boolean) {
    const link = this.limitElement("user", "contacts_link");
    if (visible) {
      await expect(link).toBeVisible();
    } else {
      await expect(link).toHaveCount(0);
    }
  }
}

export default AiSettings;
