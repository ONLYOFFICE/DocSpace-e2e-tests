import { expect, Page } from "@playwright/test";
import ContextMenu from "./BaseContextMenu";
import { TInfoPanelTabs } from "../../utils/types/common";
import { TRoomCreateTitles } from "@/src/utils/constants/rooms";

const NO_ITEM_TEXT = ".no-item-text";
const INFO_OPTIONS_ICON = "#info-options";

const TOGGLE_INFO_PANEL = "#info-panel-toggle--open";
const INFO_PANEL = "#InfoPanelWrapper";
const INFO_PANEL_TABS = ".tabs";

const PROPERTY_FILE_EXTENSION = "#File\\ extension";
const PROPERTY_TYPE = "#Type";
const PROPERTY_DATE_MODIFIED = "#Date\\ modified";
const PROPERTY_CREATION_DATE = "#Creation\\ date";
const PROPERTY_SIZE = "#Size";

const HISTORY_LIST = "#history-list-info-panel";
const CREATION_TIME_HISTORY = "p.date";

const SHARED_LINKS_WRAPPER = "[data-testid='shared-links']";
const SHARED_LINKS_AVATAR =
  "[data-testid='avatar'] [data-has-username='false']";
const CREATE_SHARED_LINKS_ICON = "[data-tooltip-id='file-links-tooltip']";
const ROOM_ICON = ".item-icon [data-testid='room-icon']";

class InfoPanel {
  page: Page;
  protected contextMenu: ContextMenu;
  protected dropdown: ContextMenu;

  constructor(page: Page) {
    this.page = page;
    this.contextMenu = new ContextMenu(page);
    this.dropdown = new ContextMenu(page, true);
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

  protected get infoPanel() {
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

  async hideCreationDateHistory() {
    await this.historyList
      .locator("div")
      .first()
      .evaluate((el) => {
        el.style.display = "none";
      }); // hide creation date

    await this.page.locator(CREATION_TIME_HISTORY).evaluateAll((elements) => {
      elements.forEach((el) => (el.style.display = "none")); // hide creation time
    });
  }
  async hideRoomIcon() {
    const icon = this.page.locator(ROOM_ICON).last();
    await icon.waitFor({ state: "visible", timeout: 5_000 });
    await icon.evaluate((el) => (el.style.display = "none"));
  }

  async checkNoItemTextExist() {
    return await expect(this.noItemText).toBeVisible();
  }

  async checkInfoPanelExist() {
    await expect(this.infoPanel).toBeVisible();
  }

  async checkInfoPanelNotExist() {
    await expect(this.infoPanel).not.toBeVisible();
  }

  async openOptions(isDropdown: boolean = false) {
    await this.infoOptionsIcon.click();
    if (isDropdown) {
      await expect(this.dropdown.menu).toBeVisible();
    } else {
      await expect(this.contextMenu.menu).toBeVisible();
    }
  }

  async close() {
    const isInfoPanelVisible = await this.infoPanel.isVisible();

    if (isInfoPanelVisible) {
      await this.toggle.click();
      await this.checkInfoPanelNotExist();
    }
  }

  async open() {
    const isInfoPanelVisible = await this.infoPanel.isVisible();

    if (!isInfoPanelVisible) {
      await this.toggle.click();
      await this.checkInfoPanelExist();
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

  async getSizeProperty() {
    const size = this.infoPanel.locator(PROPERTY_SIZE);
    return await size.textContent();
  }
  async getSizeInBytes(): Promise<number> {
    const size = await this.getSizeProperty();
    if (!size) {
      throw new Error('Размер файла не найден!');
    }
    const sizeStr = size.replace(/^Size\s*/i, '').trim();
    const match = sizeStr.match(/([\d.]+)\s*(KB|MB|B)/i);
    if (!match) return 0;
    let [_, num, unit] = match;
    let sizeNum = parseFloat(num);
    if (/MB/i.test(unit)) sizeNum *= 1024 * 1024;
    else if (/KB/i.test(unit)) sizeNum *= 1024;
    return sizeNum;
  }
  async checkFolderProperties() {
    const folderType = this.infoPanel.locator(PROPERTY_TYPE);
    await expect(folderType).toContainText("Folder");
  }

  async checkRoomProperties(roomType: TRoomCreateTitles) {
    const roomTypeProperty = this.infoPanel.locator(PROPERTY_TYPE);
    await expect(roomTypeProperty).toContainText(roomType);
  }

  async closeMenu(isDropdown: boolean = false) {
    await this.infoPanel.click({
      position: { x: 1, y: 1 },
    });
    if (isDropdown) {
      await expect(this.dropdown.menu).not.toBeVisible();
    } else {
      await expect(this.contextMenu.menu).not.toBeVisible();
    }
  }

  async checkShareExist() {
    await expect(this.sharedLinksWrapper).toBeVisible();
  }

  async checkAccessesExist() {
    const membersTitle = this.infoPanel.getByText("Administration");
    await expect(membersTitle).toBeVisible();
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
