import { expect, Page } from "@playwright/test";
import { BaseContextMenu } from "./BaseContextMenu";
import { getTabInfo, TInfoPanelTabs } from "../../utils/types/common";
import { TRoomCreateTitles } from "@/src/utils/constants/rooms";
import { BaseDropdown } from "./BaseDropdown";
import BaseToast from "./BaseToast";

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
const FORMFILLING_SHARED_LINK = "Link to fill out";
const SHARED_LINK_COMBOBOX_ACCESS = '[data-test-id="combo-button"]';
const SHARING_ACCESS_ANYONE_WITH_LINK = "drop_down_item_anyone";
const SHARING_ACCESS_DOCSPACE_USERS = "drop_down_item_users";

class InfoPanel {
  protected page: Page;
  protected contextMenu: BaseContextMenu;
  protected dropdown: BaseDropdown;
  protected toast: BaseToast;

  constructor(page: Page) {
    this.page = page;
    this.contextMenu = new BaseContextMenu(page);
    this.dropdown = new BaseDropdown(page);
    this.toast = new BaseToast(page);
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

  private get formFillingSharedLink() {
    return this.page.getByText(FORMFILLING_SHARED_LINK);
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
    const tabInfo = getTabInfo(tabName);
    const tab = this.page.getByTestId(tabInfo.testId);
    await expect(tab).toBeVisible();
    await tab.click();
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
      throw new Error("Size not found");
    }
    const sizeStr = size.replace(/^Size\s*/i, "").trim();
    const match = sizeStr.match(/([\d.]+)\s*(KB|MB|B)/i);
    if (!match) return 0;
    const num = match[1];
    const unit = match[2];
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

  async checkFormFillingSharedLinkExist() {
    await expect(this.formFillingSharedLink).toBeVisible();
  }
  async checkAccessesExist() {
    const membersTitle = this.infoPanel.getByText("Administration");
    await expect(membersTitle).toBeVisible();
  }

  async removeSharedLinkCreatedToast() {
    await this.toast.removeToast(
      "Anyone with this link can read only. The link is valid for unlimited.",
    );
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
  private get linkComboboxAccess() {
    return this.infoPanel.locator(SHARED_LINK_COMBOBOX_ACCESS);
  }
  async clickLinkComboboxAccess() {
    await this.linkComboboxAccess.click();
  }
  async getCurrentLinkAccess(): Promise<
    "anyone with the link" | "docspace users only" | null
  > {
    const anyoneSelected = await this.page
      .locator(
        `[data-testid="${SHARING_ACCESS_ANYONE_WITH_LINK}"][aria-selected="true"]`,
      )
      .isVisible();
    if (anyoneSelected) return "anyone with the link";

    const usersSelected = await this.page
      .locator(
        `[data-testid="${SHARING_ACCESS_DOCSPACE_USERS}"][aria-selected="true"]`,
      )
      .isVisible();
    if (usersSelected) return "docspace users only";

    return null;
  }
  async selectLinkAccess(
    option: "anyone with the link" | "docspace users only",
  ) {
    const currentText = await this.linkComboboxAccess.textContent();
    if (currentText?.trim() === option) {
      await this.linkComboboxAccess.click();
      return;
    }
    await this.linkComboboxAccess.waitFor({ state: "visible" });
    await this.linkComboboxAccess.click();
    const optionLocator = this.page.getByText(option).first();
    await optionLocator.waitFor({ state: "visible" });
    await optionLocator.click();
  }
}

export default InfoPanel;
