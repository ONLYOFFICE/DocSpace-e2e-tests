import MyRooms from "@/src/objects/rooms/Rooms";
import Screenshot from "@/src/objects/common/Screenshot";
import {
  roomCreateTitles,
  roomDialogSource,
 
} 

from "@/src/utils/constants/rooms";
import { test } from "@/src/fixtures";
import { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import OnlyOfficeEditor from "@/src/objects/common/BaseOnlyofficeEditor";
import FilesCreateContextMenu from "@/src/objects/files/FilesCreateContextMenu";
import UserData from "@/src/utils/helpers/UserData";

test.describe("VDRRooms_watermark", () => {
  let screenshot: Screenshot;
  let myRooms: MyRooms;
  let page: Page;
  let createMenu: FilesCreateContextMenu;

  test.beforeEach(async ({ page: fixturePage, api, login }) => {
    page = fixturePage;
    screenshot = new Screenshot(page, {
      screenshotDir: "vdr_watermark",
      suiteName: "vdr_watermark",
    });
    myRooms = new MyRooms(page, api.portalDomain);
    await login.loginToPortal();
    createMenu = new FilesCreateContextMenu(page);
  });

  test("VDR: watermark appears in editor config", async () => {
    const roomName = `Watermark ${Date.now()}`;
    const staticText = "Watermark";
    const userData = new UserData(page);
    const viewerName = await userData.getCurrentUserName();
  
    await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
    await page.getByTitle("Virtual Data Room").click();
  
    await page.getByTestId("create_edit_room_input").fill(roomName);
    await myRooms.roomsCreateDialog.toggleWatermarks(true);
    await myRooms.roomsCreateDialog.selectWatermarkType("Viewer info");
    await myRooms.roomsCreateDialog.selectWatermarkElements(["username"]);
    await myRooms.roomsCreateDialog.setWatermarkStaticText(staticText);
    await page.getByTestId("create_room_dialog_save").click();

    await page.getByTestId("plus-button").getByRole("img").click();
  
    const editorPage = await createMenu.createAndOpenEditor("New document", {
      name: `Doc ${Date.now()}`, 
    });
  
    const editor = new OnlyOfficeEditor(editorPage);
    await editor.waitForReady(30000);  
    await editor.expectWatermarkPresent({
      staticText,
      viewerInfoText: viewerName,
    });
  
    await page.bringToFront();
    await myRooms.backToRooms();
  });

  test("VDR: watermark disabled — no watermark in editor config", async () => {
    const roomName = `NoWatermark ${Date.now()}`;
  
    await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
    await page.getByTitle("Virtual Data Room").click();
  
    await page.getByTestId("create_edit_room_input").fill(roomName);
    await myRooms.roomsCreateDialog.toggleWatermarks(false);
    await page.getByTestId("create_room_dialog_save").click();
  
    await page.getByTestId("plus-button").getByRole("img").click();
  
    const editorPage = await createMenu.createAndOpenEditor("New document", {
      name: `Doc ${Date.now()}`, 
    });
  
    const editor = new OnlyOfficeEditor(editorPage);
    await editor.waitForReady(30000);  
  
    await editor.expectNoWatermark();
    await page.bringToFront();
    await myRooms.backToRooms();
  });

 
});
