import { transformDocActions } from "..";
import type { TMenuItem } from "@/src/objects/common/BaseMenu";

const testId = (value: string): TMenuItem => ({ type: "data-testid", value });

// Available in My Documents and rooms.
// markAsRead appears only after another user modifies the file.
// blockVersion appears only in rooms.

export const pdfFormContextMenuOption = {
  open: testId("open-pdf"),
  fill: testId("option_fill-form"),
  select: testId("option_select"),
  edit: testId("option_edit"),
  delete: testId("option_delete"),
  moveOrCopy: testId("option_move-or-copy"),
  download: testId("option_download"),
  rename: testId("option_rename"),
  share: testId("option_share"),
  markAsFavorite: testId("option_mark-as-favorite"),
  markAsRead: testId("option_mark-read"), // conditional: visible after external edits
  blockVersion: testId("block-unblock-version"), // rooms only
  moreOptions: testId("option_info"),
};

// FormFilling room adds fill actions not available in other contexts.
// "startFilling" appears on a new/untouched form; "fill" appears when resuming.
export const formFillingRoomPdfContextMenuOption = {
  ...pdfFormContextMenuOption,
  startFilling: testId("option_start-filling"),
  stopFilling: testId("option_stop-filling"),
  fill: testId("fill-form"),
};

// "More options" submenu (2 items)
export const pdfFormMoreOptionsSubmenu = {
  showVersionHistory: testId("option_show-version-history"),
  fileInfo: testId("show-info"),
};

// "Move or copy" submenu
export const pdfFormMoveOrCopySubmenu = {
  moveTo: testId("option_move-to"),
  copy: testId("copy-to"),
  duplicate: testId("option_create-duplicate"),
};

// "Share" submenu
export const pdfFormShareSubmenu = {
  copySharedLink: testId("option_copy-shared-link"),
  sharingSettings: testId("manage-links"),
  createRoom: testId("create-room"),
};

// "Download" submenu
export const pdfFormDownloadSubmenu = {
  originalFormat: testId("download-original"),
  downloadAs: testId("download-as"),
};

export type TPdfFormContextMenuOption =
  (typeof pdfFormContextMenuOption)[keyof typeof pdfFormContextMenuOption];
export type TPdfFormMoreOptionsSubmenu =
  (typeof pdfFormMoreOptionsSubmenu)[keyof typeof pdfFormMoreOptionsSubmenu];
export type TPdfFormMoveOrCopySubmenu =
  (typeof pdfFormMoveOrCopySubmenu)[keyof typeof pdfFormMoveOrCopySubmenu];
export type TPdfFormShareSubmenu =
  (typeof pdfFormShareSubmenu)[keyof typeof pdfFormShareSubmenu];
export type TPdfFormDownloadSubmenu =
  (typeof pdfFormDownloadSubmenu)[keyof typeof pdfFormDownloadSubmenu];

// markAsRead appears only after another user modifies the file.
// blockVersion appears only in rooms.

export const documentContextMenuOption = {
  select: testId("option_select"),
  edit: testId("option_edit"),
  preview: testId("option_preview"),
  share: testId("option_share"),
  moveOrCopy: testId("option_move-or-copy"),
  download: testId("option_download"),
  rename: testId("option_rename"),
  markAsFavorite: testId("option_mark-as-favorite"),
  markAsRead: testId("option_mark-read"), // conditional: visible after external edits
  blockVersion: testId("block-unblock-version"), // rooms only
  moreOptions: testId("option_info"),
  delete: testId("option_delete"),
};

// Same as document but includes "Enable custom filter".
// markAsRead appears only after another user modifies the file.
// blockVersion appears only in rooms.

export const spreadsheetContextMenuOption = {
  select: testId("option_select"),
  edit: testId("option_edit"),
  preview: testId("option_preview"),
  share: testId("option_share"),
  moveOrCopy: testId("option_move-or-copy"),
  download: testId("option_download"),
  rename: testId("option_rename"),
  markAsFavorite: testId("option_mark-as-favorite"),
  markAsRead: testId("option_mark-read"), // conditional: visible after external edits
  blockVersion: testId("block-unblock-version"), // rooms only
  customFilter: testId("option_custom-filter"),
  moreOptions: testId("option_info"),
  delete: testId("option_delete"),
};

// markAsRead appears only after another user modifies a file inside the folder.

export const folderContextMenuOption = {
  select: testId("option_select"),
  open: testId("option_open"),
  share: testId("option_share"),
  moveOrCopy: testId("option_move-or-copy"),
  download: testId("option_download"),
  rename: testId("option_rename"),
  markAsFavorite: testId("option_mark-as-favorite"),
  markAsRead: testId("option_mark-read"), // conditional: visible after external edits
  folderInfo: testId("option_show-info"),
  delete: testId("delete"),
};

export type TDocumentContextMenuOption =
  (typeof documentContextMenuOption)[keyof typeof documentContextMenuOption];
export type TSpreadsheetContextMenuOption =
  (typeof spreadsheetContextMenuOption)[keyof typeof spreadsheetContextMenuOption];
export type TFolderContextMenuOption =
  (typeof folderContextMenuOption)[keyof typeof folderContextMenuOption];

export const mapInitialDocNames = {
  ONLYOFFICE_SAMPLE_PRESENTATION: "ONLYOFFICE Presentation Sample",
  ONLYOFFICE_SAMPLE_SPREADSHEETS: "ONLYOFFICE Spreadsheet Sample",
  ONLYOFFICE_SAMPLE_DOCUMENT: "ONLYOFFICE Document Sample",
  ONLYOFFICE_SAMPLE_FORM: "ONLYOFFICE Resume Sample",
} as const;

export const initialDocNames = Object.values(mapInitialDocNames);

export const DOC_ACTIONS = {
  CREATE_DOCUMENT: "New document",
  CREATE_SPREADSHEET: "New spreadsheet",
  CREATE_PRESENTATION: "New presentation",
  CREATE_PDF_FORM: "New PDF form",
  CREATE_FOLDER: "New folder",
  CREATE_PDF_BLANK: "Blank",
} as const;

export const listDocActions = [
  DOC_ACTIONS.CREATE_DOCUMENT,
  DOC_ACTIONS.CREATE_SPREADSHEET,
  DOC_ACTIONS.CREATE_PRESENTATION,
  DOC_ACTIONS.CREATE_FOLDER,
  DOC_ACTIONS.CREATE_PDF_BLANK,
] as const;

export const docSort = {
  name: "Name",
  modified: "Last modified date",
  size: "Size",
} as const;

export type TDocSort = (typeof docSort)[keyof typeof docSort];

export const listArticleDocActions = transformDocActions(listDocActions);
