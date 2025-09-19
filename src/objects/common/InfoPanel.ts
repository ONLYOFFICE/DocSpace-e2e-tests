import { expect, Page, test } from "@playwright/test";
import { BaseContextMenu } from "./BaseContextMenu";
import { TInfoPanelTabs } from "../../utils/types/common";
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

const HISTORY_LIST = "#history-list-info-panel";
const CREATION_TIME_HISTORY = "p.date";

const SHARED_LINKS_WRAPPER = "shared-links";
const SHARED_LINKS_AVATAR =
  "[data-testid='avatar'] [data-has-username='false']";
const CREATE_SHARED_LINKS_ICON = "[data-tooltip-id='file-links-tooltip']";
const ROOM_ICON = ".item-icon [data-testid='room-icon']";

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
    return this.page.locator(NO_ITEM_TEXT).filter({ hasText: "See file and folder details here" });
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
    return this.page.getByTestId(SHARED_LINKS_WRAPPER);
  }

  private get createSharedLinksIcon() {
    return this.page.locator(CREATE_SHARED_LINKS_ICON);
  }

  private get sharedLinksAvatar() {
    return this.sharedLinksWrapper.locator(SHARED_LINKS_AVATAR);
  }

  async hideDatePropertiesDetails() {
    return test.step('Hide date properties details', async () => {
    await this.page
      .locator(PROPERTY_DATE_MODIFIED)
      .evaluate((el) => (el.style.display = "none"));

    await this.page
      .locator(PROPERTY_CREATION_DATE)
      .evaluate((el) => (el.style.display = "none"));
    });
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
    return test.step('Hide room icon', async () => {
    const icon = this.page.locator(ROOM_ICON).last();
    await icon.waitFor({ state: "visible", timeout: 5_000 });
    await icon.evaluate((el) => (el.style.display = "none"));
  });
}

  async checkNoItemTextExist() {
    return test.step('Check no item text exist', async () => {
    await expect(this.noItemText).toBeVisible();
  });
  }

  async checkInfoPanelExist() {
    await expect(this.infoPanel).toBeVisible();
  }

  async checkInfoPanelNotExist() {
    await expect(this.infoPanel).not.toBeVisible();
  }

  async openOptions(isDropdown: boolean = false) {
    return test.step('Open options', async () => {
    await this.infoOptionsIcon.click();
    if (isDropdown) {
      await expect(this.dropdown.menu).toBeVisible();
    } else {
      await expect(this.contextMenu.menu).toBeVisible();
    }
  });
}

  async close() {
    return test.step('Close info panel', async () => {
    const isInfoPanelVisible = await this.infoPanel.isVisible();

    if (isInfoPanelVisible) {
      await this.toggle.click();
      await this.checkInfoPanelNotExist();
    }
  });
}

  async open() {
    return test.step('Open info panel', async () => {  
    const isInfoPanelVisible = await this.infoPanel.isVisible();

    if (!isInfoPanelVisible) {
      await this.toggle.click();
      await this.checkInfoPanelExist();
    }
  });
  }

  async openTab(tabName: TInfoPanelTabs) {
    return test.step('Open tab', async () => {
    const tab = this.page.getByTestId(tabName);
    await expect(tab).toBeVisible();
    await tab.click();
  });
}

  async checkHistoryExist(title: string) {
    await expect(this.historyList).toBeVisible();
    await expect(this.historyList.getByText(title)).toBeVisible();
  }

  async checkDocxFileProperties() {
    return test.step('Check docx file properties', async () => {
    const fileExtension = this.infoPanel.locator(PROPERTY_FILE_EXTENSION);
    await expect(fileExtension).toContainText("DOCX");

    const fileType = this.infoPanel.locator(PROPERTY_TYPE);
    await expect(fileType).toContainText("Document");
  });
  }

  async checkFolderProperties() {
    return test.step('Check folder properties', async () => {
    const folderType = this.infoPanel.locator(PROPERTY_TYPE);
    await expect(folderType).toContainText("Folder");
  });
}

  async checkRoomProperties(roomType: TRoomCreateTitles) {
    const roomTypeProperty = this.infoPanel.locator(PROPERTY_TYPE);
    await expect(roomTypeProperty).toContainText(roomType);
  }

  async closeMenu(isDropdown: boolean = false) {
    return test.step('Close menu', async () => {
    await this.infoPanel.click({
      position: { x: 1, y: 1 },
    });
    if (isDropdown) {
      await expect(this.dropdown.menu).not.toBeVisible();
    } else {
      await expect(this.contextMenu.menu).not.toBeVisible();
    }
  });
}

  async checkShareExist() {
    await expect(this.sharedLinksWrapper).toBeVisible();
  }

  async checkAccessesExist() {
    const membersTitle = this.infoPanel.getByText("Administration");
    await expect(membersTitle).toBeVisible();
  }

  async removeSharedLinkCreatedToast() {
    return test.step('Remove shared link created toast', async () => {
    await this.toast.removeToast(
      "Anyone with the link can read only. The link has no expiration date",
    );
  });
}

  async createFirstSharedLink() {
    return test.step('Create first shared link', async () => {
    await expect(this.sharedLinksAvatar).toHaveCount(0);
    const createAndCopy = this.sharedLinksWrapper.getByText("Create and copy");
    await expect(createAndCopy).toBeVisible();
    await createAndCopy.click();
    await this.removeSharedLinkCreatedToast();
    await expect(this.sharedLinksAvatar).toHaveCount(1);
  });
}

  async createMoreSharedLink() {
    return test.step('Create more shared link', async () => {
    const currentLinksCount = await this.sharedLinksAvatar.count();
    expect(currentLinksCount).toBeGreaterThan(0);
    await expect(this.createSharedLinksIcon).toBeVisible();
    await this.createSharedLinksIcon.click();
    await expect(this.sharedLinksAvatar).toHaveCount(currentLinksCount + 1);
  });
}
}

export default InfoPanel;
