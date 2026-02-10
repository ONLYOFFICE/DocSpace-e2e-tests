import { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import FilesTable from "@/src/objects/files/FilesTable";
import MyRooms from "@/src/objects/rooms/Rooms";
import { ShortTour } from "@/src/objects/rooms/ShortTourModal";
import RoomEmptyView from "@/src/objects/rooms/RoomEmptyView";
import RoomSelectPanel from "@/src/objects/rooms/RoomSelectPanel";
import {
  setupClipboardPermissions,
  getLinkFromClipboard,
} from "@/src/utils/helpers/linkTest";

/**
 * Form Filling Room specific helper functions
 * These functions are tailored for Form Filling Room workflows
 */

/**
 * Copies shared link for a file using context menu
 */
export async function copyFileLink(
  page: Page,
  filesTable: FilesTable,
  myRooms: MyRooms,
): Promise<string> {
  await setupClipboardPermissions(page);
  await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
  await filesTable.contextMenu.clickSubmenuOption("Share", "Copy shared link");
  await myRooms.toast.dismissToastSafely("Link copied to clipboard", 5000);
  return await getLinkFromClipboard(page);
}

/**
 * Uploads PDF and verifies it's visible
 */
export async function uploadAndVerifyPDF(
  shortTour: ShortTour,
  roomEmptyView: RoomEmptyView,
  selectPanel: RoomSelectPanel,
  myRooms: MyRooms,
  page: Page,
  skipTour = true,
): Promise<void> {
  if (skipTour) {
    await shortTour.clickSkipTour();
  }
  await roomEmptyView.uploadPdfFromDocSpace();
  await selectPanel.checkSelectorExist();
  await selectPanel.select("documents");
  await selectPanel.selectItemByText("ONLYOFFICE Resume Sample");
  await selectPanel.confirmSelection();
  await shortTour.clickModalCloseButton().catch(() => {});
  await myRooms.infoPanel.close();
  await expect(page.getByLabel("ONLYOFFICE Resume Sample,")).toBeVisible();
}
