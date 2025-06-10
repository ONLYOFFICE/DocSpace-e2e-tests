import { TRoomCreateTitles } from "@/src/utils/constants/rooms";
import { expect, Page } from "@playwright/test";

const ROOM_TYPE_DROPDOWN_BUTTON = '[data-testid="room-type-dropdown-button"]';
const ROOM_TYPES_DROPDOWN = ".dropdown-content-wrapper .dropdown-content";

class RoomsTypesDropdown {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get roomTypeDropdownButton() {
    return this.page.locator(ROOM_TYPE_DROPDOWN_BUTTON);
  }

  private get roomTypesDropdown() {
    return this.page.locator(ROOM_TYPES_DROPDOWN);
  }

  async openRoomTypeDropdown() {
    await this.roomTypeDropdownButton.click();
    await expect(this.roomTypesDropdown).toBeVisible();
  }

  async selectRoomTypeByTitle(title: TRoomCreateTitles) {
    const roomType = this.roomTypesDropdown.getByTitle(title, { exact: true });
    await expect(roomType).toBeVisible();
    await roomType.click();
    await expect(this.roomTypesDropdown).not.toBeVisible();
    await expect(this.roomTypeDropdownButton).toHaveAttribute("title", title);
  }
}

export default RoomsTypesDropdown;
