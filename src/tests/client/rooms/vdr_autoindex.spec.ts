import MyRooms from "@/src/objects/rooms/Rooms";
import Screenshot from "@/src/objects/common/Screenshot";
import {
  roomContextMenuOption,
  roomCreateTitles,
  roomDialogSource,
  roomTemplateTitles,
  roomToastMessages,
  templateContextMenuOption,
} from "@/src/utils/constants/rooms";
import { test } from "@/src/fixtures";
import { Page, expect } from "@playwright/test";

test.describe("VDRRooms_autoindex", () => {
  let screenshot: Screenshot;
  let myRooms: MyRooms;
  let page: Page;

  const duplicateRoomName = roomCreateTitles.public + " (1)";

  test.beforeEach(async ({ page: fixturePage, api, login }) => {
    page = fixturePage;
    screenshot = new Screenshot(page, {
      screenshotDir: "vdr_autoindex",
      suiteName: "vdr_autoindex",
    });
    myRooms = new MyRooms(page, api.portalDomain);

    await login.loginToPortal();
  });

  test("VDR: auto indexing assigns number to newly created docs", async () => {
    const roomName = `Autoindex ${Date.now()}`;
  
    // Open the Create Room dialog (from navigation) and select VDR
    await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
    await page.getByTitle("Virtual Data Room").click();
  
    // Room name + enable auto-indexing through the new method
    await page.getByTestId("create_edit_room_input").fill(roomName);
    await myRooms.roomsCreateDialog.toggleAutomaticIndexing(true);
  
    // Create room
    await page.getByTestId("create_room_dialog_save").click();
  
    // Ensure the grid appears (visible header with '#')
    await expect(
      page.getByRole("button", { name: /#\s+Name\s+Author\s+Modified\s+Size/i })
    ).toBeVisible();
    await screenshot.expectHaveScreenshot("vdr_autoindex_header");
  
    // Create new document: editor will open in a popup
    const popupPromise = page.waitForEvent("popup"); // Set expectation before clicking
    await page.getByTestId("plus-button").getByRole("img").click();
    await page.getByRole("menuitem", { name: "New document" }).click();
    const editorPage = await popupPromise;
  
    // Save document in editor (do not close the tab)
    await editorPage.getByTestId("new_document_save_button").click();
  
    // Return to the room tab
    await page.bringToFront();
  
    // Check that the first row has index "1"
    const firstRow = page.locator('[role="row"]').nth(1); 
    await expect(firstRow).toBeVisible();
  
    const firstCell = firstRow.locator('[role="gridcell"], td').first();
    await expect(firstCell).toHaveText(/^1$/);
  
    await screenshot.expectHaveScreenshot("vdr_autoindex_new_document_indexed");
  });

  test("VDR: auto indexing disabled — no index column and no numeric index", async () => {
    const roomName = `NoAutoIndex ${Date.now()}`;
  
    
    await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
    await page.getByTitle("Virtual Data Room").click();
  
    
    await page.getByTestId("create_edit_room_input").fill(roomName);
    await myRooms.roomsCreateDialog.toggleAutomaticIndexing(false);
  
    
    await page.getByTestId("create_room_dialog_save").click();
  
    
    await expect(
      page.getByRole("button", { name: /^#\s+/ }) 
    ).toHaveCount(0);
    await screenshot.expectHaveScreenshot("vdr_autoindex_off_header_without_index");
  
    
    const popupPromise = page.waitForEvent("popup"); 
    await page.getByTestId("plus-button").getByRole("img").click();
    await page.getByRole("menuitem", { name: "New document" }).click();
    const editorPage = await popupPromise;
  
    
    await editorPage.getByTestId("new_document_save_button").click();
  
   
    await page.bringToFront();
  

    const firstRow = page.locator('[role="row"]').nth(1); 
    await expect(firstRow).toBeVisible();
  
    const firstCell = firstRow.locator('[role="gridcell"], td').first();
    await expect(firstCell).not.toHaveText(/^\d+$/); 
  
    await screenshot.expectHaveScreenshot("vdr_autoindex_off_new_document_no_index");
  });
});
