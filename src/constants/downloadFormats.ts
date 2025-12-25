export const DOCUMENT_DOWNLOAD_FORMATS = {
  ORIGINAL: "Original format",
  BMP: ".bmp",
  DOCM: ".docm",
  DOTM: ".dotm",
  DOTX: ".dotx",
  EPUB: ".epub",
  FB2: ".fb2",
  GIF: ".gif",
  HTML: ".html",
  JPG: ".jpg",
  ODT: ".odt",
  OTT: ".ott",
  PDF: ".pdf",
  PDFA: ".pdfa",
  PNG: ".png",
  RTF: ".rtf",
  TXT: ".txt",
} as const;

export const ORIGINAL_DOC_EXTENSIONS: Record<string, string> = {
  Document: ".docx",
  Spreadsheet: ".xlsx",
  Presentation: ".pptx",
  Blank: ".pdf",
};
