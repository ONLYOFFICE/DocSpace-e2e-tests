import { expect, Page } from "@playwright/test";
import RoomsEmptyView from "./RoomsEmptyView";
import RoomsCreateDialog from "./RoomsCreateDialog";
import BaseNavigation from "../common/BaseNavigation";
import InfoPanel from "../common/InfoPanel";
import RoomsTable from "./RoomsTable";
import RoomsTypesDropdown from "./RoomsTypeDropdown";
import {
  ROOM_CREATE_TITLES,
  TRoomCreateTitles,
} from "@/src/utils/constants/rooms";
import RoomsArticle from "./RoomsArticle";

class MyRooms {
  page: Page;
  portalDomain: string;

  roomsEmptyView: RoomsEmptyView;
  roomsCreateDialog: RoomsCreateDialog;
  navigation: BaseNavigation;

  infoPanel: InfoPanel;
  roomsTable: RoomsTable;
  roomsTypeDropdown: RoomsTypesDropdown;
  roomsArticle: RoomsArticle;

  constructor(page: Page, portalDomain: string) {
    this.page = page;
    this.portalDomain = portalDomain;

    this.roomsEmptyView = new RoomsEmptyView(page);
    this.roomsCreateDialog = new RoomsCreateDialog(page);
    this.navigation = new BaseNavigation(page);

    this.infoPanel = new InfoPanel(page);

    this.roomsTable = new RoomsTable(page);
    this.roomsEmptyView = new RoomsEmptyView(page);
    this.roomsCreateDialog = new RoomsCreateDialog(page);
    this.roomsTypeDropdown = new RoomsTypesDropdown(page);
    this.roomsArticle = new RoomsArticle(page);
  }

  async open() {
    await this.page.goto(`https://${this.portalDomain}/rooms/shared`);
    await this.page.waitForLoadState("load");
    await expect(this.page).toHaveURL(/.*rooms\/shared.*/);
  }

  async waitRoomsResponse() {
    return this.page.waitForResponse((response) => {
      return (
        response.request().method() === "GET" &&
        response.url().includes("/files/rooms?count") &&
        response.status() === 200
      );
    });
  }

  async openTemplatesTab() {
    const response = this.waitRoomsResponse();
    await this.page.getByText("Templates").click();
    await response;
  }

  async openRoomsTab() {
    const response = this.waitRoomsResponse();
    await this.page.locator("span").filter({ hasText: "Rooms" }).click();
    await response;
  }

  async checkCreatedRoomExist(roomType: TRoomCreateTitles) {
    await expect(
      this.page.getByRole("button", { name: `Welcome to the ${roomType}` }),
    ).toBeVisible();
  }

  async checkHeadingExist(name: string) {
    await expect(
      this.page.getByRole("heading", { name, level: 1 }),
    ).toBeVisible();
  }

  async backToRooms() {
    const response = this.waitRoomsResponse();
    await this.navigation.gotoBack();
    await response;
  }

  async createRooms() {
    for (const roomType of Object.values(ROOM_CREATE_TITLES)) {
      if (roomType === ROOM_CREATE_TITLES.FROM_TEMPLATE) {
        continue;
      }
      await this.navigation.openCreateDialog();
      await this.roomsCreateDialog.checkRoomDialogExist();
      await this.roomsCreateDialog.openRoomType(roomType);
      await this.roomsCreateDialog.fillRoomName(roomType);
      await this.roomsCreateDialog.clickRoomDialogSubmit();

      if (roomType === ROOM_CREATE_TITLES.FORM_FILLING) {
        const tipsModal = this.page.getByRole("img", { name: "tips-preview" });
        await expect(tipsModal).toBeVisible();
        await this.page.mouse.click(1, 1);
      }
      await this.checkCreatedRoomExist(roomType);
      await this.backToRooms();
      await this.infoPanel.toggleInfoPanel();
    }
  }
}

export default MyRooms;
