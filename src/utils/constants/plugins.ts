// System plugins shipped with DocSpace: the name is the `plugin_<name>` testid
// suffix on Settings > Integration > Plugins.
export const systemPlugins = {
  bookReader: "book-reader",
  codemirror: "codemirror",
  convertToMarkdown: "convert-to-markdown",
  drawIo: "draw.io",
  imageEditor: "image-editor",
  markdown: "markdown",
  pdfConverter: "pdf-converter",
  speechToText: "speech-to-text",
  url: "url",
  zipArchives: "zip-archives",
} as const;

export type TSystemPlugin = (typeof systemPlugins)[keyof typeof systemPlugins];

// Items the plugins add to New > More
export const pluginCreateItems = {
  drawIo: "draw.io",
  textFile: "Text file",
  url: "New URL",
} as const;

// Items the plugins add to the top level of New. They open the standard
// create-file dialog of DocSpace, titled "New <item>".
export const pluginNewMenuItems = {
  markdown: "Markdown file",
} as const;

// Items the plugins add to a file's context menu > More options
export const pluginFileActions = {
  archive: "Archive selected item",
  convertToMarkdown: "Convert to Markdown",
  convertToPdf: "Convert to PDF",
  convertToText: "Convert to text",
  editImage: "Edit image",
  editMarkdown: "Edit markdown",
  editWithCodemirror: "Edit file with Codemirror",
  openArchive: "Open archive",
  openDiagram: "Open diagram",
  openInReader: "Open in Reader",
  previewMarkdown: "Preview markdown",
  unzip: "Unzip it",
} as const;

export const pluginToasts = {
  fileSaved: "File saved",
  imageSaved: "File saved successfully",
  zipSaved: "Zip is saved",
  convertedToText: "The file was successfully converted to text",
  wrongApiToken: "Wrong API token",
  created: (fileName: string) => `Created ${fileName}`,
} as const;

// Uploaded to My Documents before a plugin test. File names are shown without
// extensions in the list, so `title` is what the row displays.
export const pluginTestFiles = {
  docx: { path: "data/documents/test-document.docx", title: "test-document" },
  markdown: { path: "data/plugins/files/markdown.md", title: "markdown" },
  script: { path: "data/plugins/files/script.js", title: "script" },
  image: { path: "data/filter/image.png", title: "image" },
  archive: { path: "data/filter/archive.zip", title: "archive" },
  // An EPUB packed into a zip: the reader opens EPUB/FB2 found inside a zip
  book: { path: "data/plugins/files/book.zip", title: "book" },
  // "Hello world. This is a speech to text test." (macOS `say`)
  speech: { path: "data/plugins/files/speech.wav", title: "speech" },
} as const;
