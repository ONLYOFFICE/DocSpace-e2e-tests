export const FILTER_AUTHOR = {
  ME: "[data-testid='filter_tag_me']",
  OTHER: "[data-testid='filter_tag_other']",
} as const;

export const FILTER_TYPE = {
  FOLDERS: "#filter_type-folders",
  ALL_FILES: "#filter_type-all-files",
  DOCUMENTS: "#filter_type-documents",
  SPREADSHEETS: "#filter_type-spreadsheets",
  PRESENTATIONS: "#filter_type-presentations",
  PDF: "#filter_type-pdf",
  FORMS: "#filter_type-forms",
  DIAGRAMS: "#filter_type-diagrams",
  ARCHIVE: "#filter_type-archive",
  IMAGES: "#filter_type-images",
  MEDIA: "#filter_type-media",
} as const;
