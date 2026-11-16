import { Page } from "@playwright/test";
import * as XLSX from "xlsx";
import { ApiSDK } from "@/src/services";
import { formFillingSystemFolders } from "@/src/utils/constants/rooms";
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
  await uploadAndVerifyPDF(
    shortTour,
    roomEmptyView,
    selectPanel,
    myRooms,
    page,
  );
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
    // Tour is temporarily not shown; may come back later.
    // await shortTour.clickSkipTour();
  }
  await roomEmptyView.uploadPdfFromDocSpace();
  await selectPanel.checkSelectorExist();
  await selectPanel.select("documents");
  await selectPanel.selectItemByText(PDF_FILE_NAME);
  await selectPanel.confirmSelection();
  await myRooms.infoPanel.close();
  await myRooms.filesTable.checkRowExist(PDF_FILE_NAME);
}

// Sheets of the form's results table (Complete/<form>/<form>.xlsx) with the
// number of answers on each; a form version whose fields differ gets a sheet
// of its own. Meant for expect.poll: the folders and the table appear a while
// after a submission, so "not there yet" is returned, never thrown. Downloaded
// with the page's session - the file handler takes the auth cookie.
export async function getFormResultsSheets(
  apiSdk: ApiSDK,
  page: Page,
  roomId: number,
  formTitle: string,
): Promise<{ name: string; answers: number }[]> {
  let formFolderId: number;
  try {
    const completeId = await apiSdk.folders.getSubfolderIdByTitle(
      "owner",
      roomId,
      formFillingSystemFolders.complete,
    );
    formFolderId = await apiSdk.folders.getSubfolderIdByTitle(
      "owner",
      completeId,
      formTitle,
    );
  } catch {
    return [];
  }
  const files = await apiSdk.folders.listFiles("owner", formFolderId);
  const resultsTable = files.find((f) => f.title === `${formTitle}.xlsx`);
  if (!resultsTable) {
    return [];
  }
  const response = await page.request.get(
    new URL(
      `/filehandler.ashx?action=download&fileid=${resultsTable.id}`,
      page.url(),
    ).toString(),
  );
  // Right after a submission the table is rebuilt and its download can
  // briefly 404
  if (!response.ok()) {
    return [{ name: `download ${response.status()}`, answers: 0 }];
  }
  const workbook = XLSX.read(await response.body());
  return workbook.SheetNames.map((name) => ({
    name,
    // The first row holds the column titles
    answers:
      XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1 }).length - 1,
  }));
}
