import { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import FilesTable from "@/src/objects/files/FilesTable";
import MyRooms from "@/src/objects/rooms/Rooms";
import { ShortTour } from "@/src/objects/rooms/ShortTourModal";
import RoomEmptyView from "@/src/objects/rooms/RoomEmptyView";
import RoomSelectPanel from "@/src/objects/rooms/RoomSelectPanel";
import PdfFormModal from "@/src/objects/rooms/PdfFormModal";
import { formFillingRoomPdfContextMenuOption } from "@/src/utils/constants/files";
import {
  setupClipboardPermissions,
  getLinkFromClipboard,
} from "@/src/utils/helpers/linkTest";

const PDF_FILE_NAME = "ONLYOFFICE Resume Sample";

export async function uploadAndStartFillingPDF(
  shortTour: ShortTour,
  roomEmptyView: RoomEmptyView,
  selectPanel: RoomSelectPanel,
  myRooms: MyRooms,
  page: Page,
  filesTable: FilesTable,
): Promise<void> {
  await uploadAndVerifyPDF(shortTour, roomEmptyView, selectPanel, myRooms, page);
  await filesTable.openContextMenuForItem(PDF_FILE_NAME);
  await filesTable.contextMenu.clickOption(
    formFillingRoomPdfContextMenuOption.startFilling,
  );
  await new PdfFormModal(page).close();
}

export async function copyFileLink(
  page: Page,
  filesTable: FilesTable,
  myRooms: MyRooms,
): Promise<string> {
  await setupClipboardPermissions(page);
  await filesTable.openContextMenuForItem(PDF_FILE_NAME);
  await filesTable.contextMenu.clickSubmenuOption("Share", "Copy shared link");
  await myRooms.toast.dismissToastSafely("Link copied to clipboard", 5000);
  return await getLinkFromClipboard(page);
}

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
  await selectPanel.selectItemByText(PDF_FILE_NAME);
  await selectPanel.confirmSelection();
  await myRooms.infoPanel.close();
  await expect(page.getByLabel(`${PDF_FILE_NAME},`)).toBeVisible();
}
