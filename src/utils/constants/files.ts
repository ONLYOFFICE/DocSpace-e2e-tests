import { transformDocActions } from "..";

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

export const listArticleDocActions = transformDocActions(listDocActions);
