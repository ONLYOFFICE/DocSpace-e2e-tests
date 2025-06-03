import { expect, Page } from "@playwright/test";
import ContextMenu from "./ContextMenu";
import { TInfoPanelTabs } from "../utils/types/common";

const NO_ITEM_TEXT = ".no-item-text";
const INFO_OPTIONS_ICON = "#info-options";

const TOGGLE_INFO_PANEL = "#info-panel-toggle--open";
const INFO_PANEL = "#InfoPanelWrapper";
const INFO_PANEL_TABS = ".tabs";

const PROPERTY_FILE_EXTENSION = "#File\\ extension";
const PROPERTY_TYPE = "#Type";
const PROPERTY_DATE_MODIFIED = "#Date\\ modified";
const PROPERTY_CREATION_DATE = "#Creation\\ date";

const HISTORY_LIST = "#history-list-info-panel";
const CREATION_TIME_HISTORY = "p.date";

const SHARED_LINKS_WRAPPER = "[data-testid='shared-links']";
const SHARED_LINKS_AVATAR =
  "[data-testid='avatar'] [data-has-username='false']";
const CREATE_SHARED_LINKS_ICON = "[data-tooltip-id='file-links-tooltip']";

class InfoPanel {
  page: Page;
  private dropdown: ContextMenu;

  constructor(page: Page) {
    this.page = page;
    this.dropdown = new ContextMenu(page);
  }

  private get noItemText() {
    return this.page.locator(NO_ITEM_TEXT);
  }

  private get infoOptionsIcon() {
    return this.page.locator(INFO_OPTIONS_ICON);
  }

  private get toggle() {
    return this.page.locator(TOGGLE_INFO_PANEL);
  }

  private get infoPanel() {
    return this.page.locator(INFO_PANEL);
  }

  private get infoPanelTabs() {
    return this.page.locator(INFO_PANEL_TABS);
  }

  private get historyList() {
    return this.page.locator(HISTORY_LIST);
  }

  private get sharedLinksWrapper() {
    return this.page.locator(SHARED_LINKS_WRAPPER);
  }

  private get createSharedLinksIcon() {
    return this.page.locator(CREATE_SHARED_LINKS_ICON);
  }

  private get sharedLinksAvatar() {
    return this.sharedLinksWrapper.locator(SHARED_LINKS_AVATAR);
  }

  async hideDatePropertiesDetails() {
    await this.page
      .locator(PROPERTY_DATE_MODIFIED)
      .evaluate((el) => (el.style.display = "none"));

    await this.page
      .locator(PROPERTY_CREATION_DATE)
      .evaluate((el) => (el.style.display = "none"));
  }

  async hideCreationTimeHistory() {
    await this.page.locator(CREATION_TIME_HISTORY).evaluateAll((elements) => {
      elements.forEach((el) => (el.style.display = "none"));
    });
  }

  async checkNoItemTextExist() {
    return await expect(this.noItemText).toBeVisible();
  }

  async openOptions() {
    await this.infoOptionsIcon.click();
    expect(this.dropdown.contextMenu).toBeVisible();
  }

  async toggleInfoPanel() {
    const isInfoPanelVisible = await this.infoPanel.isVisible();
    await this.toggle.click();

    if (isInfoPanelVisible) {
      await expect(this.infoPanel).not.toBeVisible();
    } else {
      await expect(this.infoPanel).toBeVisible();
    }
  }

  async openTab(tabName: TInfoPanelTabs) {
    await this.infoPanelTabs.getByText(tabName).click();
  }

  async checkHistoryExist(title: string) {
    await expect(this.historyList).toBeVisible();
    await expect(this.historyList.getByText(title)).toBeVisible();
  }

  async checkDocxFileProperties() {
    const fileExtension = this.infoPanel.locator(PROPERTY_FILE_EXTENSION);
    await expect(fileExtension).toContainText("DOCX");

    const fileType = this.infoPanel.locator(PROPERTY_TYPE);
    await expect(fileType).toContainText("Document");
  }

  async checkFolderProperties() {
    const folderType = this.infoPanel.locator(PROPERTY_TYPE);
    await expect(folderType).toContainText("Folder");
  }

  async closeDropdown() {
    await this.infoPanel.click({
      position: { x: 0, y: 0 },
    });
    await expect(this.dropdown.contextMenu).not.toBeVisible();
  }

  async checkShareExist() {
    await expect(this.sharedLinksWrapper).toBeVisible();
  }

  async createFirstSharedLink() {
    await expect(this.sharedLinksAvatar).toHaveCount(0);
    const createAndCopy = this.sharedLinksWrapper.getByText("Create and copy");
    await expect(createAndCopy).toBeVisible();
    await createAndCopy.click();
    await expect(this.sharedLinksAvatar).toHaveCount(1);
  }

  async createMoreSharedLink() {
    const currentLinksCount = await this.sharedLinksAvatar.count();
    expect(currentLinksCount).toBeGreaterThan(0);
    await expect(this.createSharedLinksIcon).toBeVisible();
    await this.createSharedLinksIcon.click();
    await expect(this.sharedLinksAvatar).toHaveCount(currentLinksCount + 1);
  }
}

export default InfoPanel;
